import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { identityApi } from "@/lib/kumbu-api/identity";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
};

export default async function IdentityPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "PENDING";
  const page = Math.max(0, Number(params.page ?? "0") || 0);

  const data = await identityApi.list({
    status: status === "ALL" ? undefined : status,
    page,
    size: 30,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verificação de identidade"
        subtitle={`${data.total} pedido(s) — documentos enviados em Definições → Identidade.`}
        actions={
          <div className="flex flex-wrap gap-2">
            {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((s) => (
              <Link
                key={s}
                href={s === "ALL" ? "/identity?status=ALL" : `/identity?status=${s}`}
                className={
                  status === s ? "kumbu-btn-primary text-sm" : "kumbu-btn-secondary text-sm"
                }
              >
                {s === "ALL" ? "Todos" : (STATUS_LABEL[s] ?? s)}
              </Link>
            ))}
          </div>
        }
      />

      {data.items.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Sem pedidos"
          description="Quando um utilizador submeter documentos de identidade, aparecem aqui para revisão."
        />
      ) : (
        <div className="kumbu-card overflow-hidden">
          <table className="kumbu-table">
            <thead>
              <tr>
                <th>Utilizador</th>
                <th>Estado</th>
                <th>Documentos</th>
                <th>Submetido</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.items.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="text-sm font-medium">
                      {row.user_name ?? row.user_email ?? row.user_id.slice(0, 8)}
                    </div>
                    {row.user_email ? (
                      <div className="text-xs text-slate-500">{row.user_email}</div>
                    ) : null}
                  </td>
                  <td>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold">
                      {STATUS_LABEL[row.status] ?? row.status}
                    </span>
                  </td>
                  <td className="text-sm">{row.documents_count}/3</td>
                  <td className="whitespace-nowrap text-sm text-slate-500">
                    {formatDateTime(row.created_at)}
                  </td>
                  <td>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/identity/${row.user_id}`}
                        className="text-sm font-semibold text-kumbu-red hover:underline"
                      >
                        Rever
                      </Link>
                      <Link
                        href={`/users/${row.user_id}`}
                        className="text-xs text-slate-500 hover:text-kumbu-red hover:underline"
                      >
                        Perfil
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
