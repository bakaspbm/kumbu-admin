import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Suspense } from "react";
import { adminList } from "@/lib/admin-data";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ConversationSearch } from "@/components/conversations/conversation-search";
import { formatDateTime } from "@/lib/utils";
import type { MarketplaceConversation } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

type ConversationRow = MarketplaceConversation & {
  last_message_body?: string | null;
  buyer_name?: string | null;
  buyer_email?: string | null;
  seller_name?: string | null;
  seller_email?: string | null;
};

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ blocked?: string; page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const blockedOnly = params?.blocked === "1";
  const page = Math.max(1, Number(params?.page ?? "1") || 1);
  const q = params?.q?.trim() ?? "";

  const rows = await adminList<ConversationRow>("conversations", {
    blocked: blockedOnly ? true : undefined,
    q: q || undefined,
    page,
    size: PAGE_SIZE,
  });

  const productIds = Array.from(
    new Set(rows.map((r) => r.product_id).filter(Boolean) as string[]),
  );

  const products = await Promise.all(
    productIds.map(async (productId) => {
      const { adminGet } = await import("@/lib/admin-data");
      const product = await adminGet<{ id: string; title: string }>("products", productId);
      return product ?? { id: productId, title: productId };
    }),
  );

  const productMap = new Map<string, string>();
  for (const p of products) productMap.set(p.id, p.title);

  const querySuffix = [
    blockedOnly ? "blocked=1" : "",
    q ? `q=${encodeURIComponent(q)}` : "",
  ]
    .filter(Boolean)
    .join("&");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conversas"
        subtitle={`${rows.length} thread(s) entre compradores e vendedores — moderação e bloqueio.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={q ? `/conversations?q=${encodeURIComponent(q)}` : "/conversations"}
              className={blockedOnly ? "kumbu-btn-secondary" : "kumbu-btn-primary"}
            >
              Todas
            </Link>
            <Link
              href={`/conversations?blocked=1${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={blockedOnly ? "kumbu-btn-primary" : "kumbu-btn-secondary"}
            >
              Bloqueadas
            </Link>
          </div>
        }
      />

      <Suspense fallback={null}>
        <ConversationSearch defaultValue={q} />
      </Suspense>

      {rows.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="Sem conversas"
          description={
            q
              ? "Nenhuma conversa encontrada para esta pesquisa."
              : blockedOnly
                ? "Nenhuma conversa bloqueada."
                : "Quando utilizadores contactarem vendedores na app, aparecem aqui."
          }
        />
      ) : (
        <div className="kumbu-card overflow-hidden">
          <table className="kumbu-table">
            <thead>
              <tr>
                <th>Anúncio</th>
                <th>Comprador</th>
                <th>Vendedor</th>
                <th>Última mensagem</th>
                <th>Actualizado</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="max-w-[140px] truncate text-sm">
                    {row.product_id ? (
                      <Link
                        href={`/products/${row.product_id}`}
                        className="font-medium text-kumbu-red hover:underline"
                      >
                        {productMap.get(row.product_id) ?? row.product_id}
                      </Link>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td>
                    <Link href={`/users/${row.buyer_id}`} className="text-sm hover:text-kumbu-red">
                      <span className="block font-medium">
                        {row.buyer_name ?? row.buyer_email ?? row.buyer_id.slice(0, 8)}
                      </span>
                      {row.buyer_email ? (
                        <span className="block text-xs text-slate-500">{row.buyer_email}</span>
                      ) : null}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/users/${row.seller_id}`} className="text-sm hover:text-kumbu-red">
                      <span className="block font-medium">
                        {row.seller_name ?? row.seller_email ?? row.seller_id.slice(0, 8)}
                      </span>
                      {row.seller_email ? (
                        <span className="block text-xs text-slate-500">{row.seller_email}</span>
                      ) : null}
                    </Link>
                  </td>
                  <td className="max-w-[200px] truncate text-sm text-slate-600">
                    {row.last_message_body ?? "—"}
                  </td>
                  <td className="whitespace-nowrap text-sm text-slate-500">
                    {formatDateTime(row.updated_at)}
                  </td>
                  <td>
                    {row.is_blocked ? (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                        Bloqueada
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Activa
                      </span>
                    )}
                  </td>
                  <td>
                    <Link
                      href={`/conversations/${row.id}`}
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
      {rows.length >= PAGE_SIZE && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/conversations?${querySuffix ? `${querySuffix}&` : ""}page=${page - 1}`}
              className="kumbu-btn-secondary"
            >
              Anterior
            </Link>
          )}
          <span className="self-center text-sm text-slate-500">Página {page}</span>
          <Link
            href={`/conversations?${querySuffix ? `${querySuffix}&` : ""}page=${page + 1}`}
            className="kumbu-btn-secondary"
          >
            Seguinte
          </Link>
        </div>
      )}
    </div>
  );
}
