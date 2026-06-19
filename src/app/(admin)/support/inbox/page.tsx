import Link from "next/link";
import { Headphones } from "lucide-react";
import { supportInboxApi } from "@/lib/kumbu-api/support-inbox";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SupportSubNav } from "../support-subnav";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  waiting_admin: "Aguarda admin",
  assigned: "Em atendimento",
  bot: "Bot / FAQ",
  closed: "Encerrada",
};

function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABEL[status] ?? status;
  const cls =
    status === "waiting_admin"
      ? "bg-amber-50 text-amber-800"
      : status === "assigned"
        ? "bg-sky-50 text-sky-800"
        : status === "closed"
          ? "bg-slate-100 text-slate-600"
          : "bg-emerald-50 text-emerald-800";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>
  );
}

export default async function SupportInboxPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "";
  const page = Math.max(0, Number(params.page ?? "0") || 0);

  const data = await supportInboxApi.list({
    status: status || undefined,
    page,
    size: 30,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fila de suporte"
        subtitle={`${data.total} conversa(s) — pedidos escalados desde o chat da app.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/support/inbox"
              className={!status ? "kumbu-btn-primary text-sm" : "kumbu-btn-secondary text-sm"}
            >
              Todas
            </Link>
            <Link
              href="/support/inbox?status=waiting_admin"
              className={
                status === "waiting_admin"
                  ? "kumbu-btn-primary text-sm"
                  : "kumbu-btn-secondary text-sm"
              }
            >
              Aguarda admin
            </Link>
            <Link
              href="/support/inbox?status=assigned"
              className={
                status === "assigned" ? "kumbu-btn-primary text-sm" : "kumbu-btn-secondary text-sm"
              }
            >
              Em atendimento
            </Link>
          </div>
        }
      />
      <SupportSubNav active="/support/inbox" />

      {data.items.length === 0 ? (
        <EmptyState
          icon={Headphones}
          title="Sem conversas"
          description="Quando um utilizador pedir ajuda humana no chat de suporte, aparece aqui."
        />
      ) : (
        <div className="kumbu-card overflow-hidden">
          <table className="kumbu-table">
            <thead>
              <tr>
                <th>Utilizador</th>
                <th>Estado</th>
                <th>Última mensagem</th>
                <th>Actualizado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.items.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                      <span>{row.user_name ?? row.user_email ?? "Visitante"}</span>
                      {row.guest ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                          Visitante
                        </span>
                      ) : null}
                    </div>
                    {row.user_email ? (
                      <div className="text-xs text-slate-500">{row.user_email}</div>
                    ) : null}
                  </td>
                  <td>
                    <StatusBadge status={row.support_status} />
                  </td>
                  <td className="max-w-[280px] truncate text-sm text-slate-600">
                    {row.last_message_body ?? "—"}
                  </td>
                  <td className="whitespace-nowrap text-sm text-slate-500">
                    {formatDateTime(row.updated_at)}
                  </td>
                  <td>
                    <Link
                      href={`/support/inbox/${row.id}`}
                      className="text-sm font-semibold text-kumbu-red hover:underline"
                    >
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.total_pages > 1 ? (
        <div className="flex justify-center gap-2">
          {page > 0 ? (
            <Link
              href={`/support/inbox?${status ? `status=${status}&` : ""}page=${page - 1}`}
              className="kumbu-btn-secondary"
            >
              Anterior
            </Link>
          ) : null}
          <span className="self-center text-sm text-slate-500">
            Página {page + 1} de {data.total_pages}
          </span>
          {page + 1 < data.total_pages ? (
            <Link
              href={`/support/inbox?${status ? `status=${status}&` : ""}page=${page + 1}`}
              className="kumbu-btn-secondary"
            >
              Seguinte
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
