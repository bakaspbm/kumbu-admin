import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { adminGet, adminList } from "@/lib/admin-data";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";
import type { MarketplaceConversation } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

type ConversationRow = MarketplaceConversation & {
  last_message_body?: string | null;
};

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ blocked?: string; page?: string }>;
}) {
  const params = await searchParams;
  const blockedOnly = params?.blocked === "1";
  const page = Math.max(1, Number(params?.page ?? "1") || 1);

  const rows = await adminList<ConversationRow>("conversations", {
    blocked: blockedOnly ? true : undefined,
    page,
    size: PAGE_SIZE,
  });

  const userIds = Array.from(new Set(rows.flatMap((r) => [r.buyer_id, r.seller_id])));
  const productIds = Array.from(
    new Set(rows.map((r) => r.product_id).filter(Boolean) as string[]),
  );

  const [users, products] = await Promise.all([
    userIds.length
      ? adminList<{ id: string; email: string | null; display_name: string | null }>("users", {
          page: 0,
          size: 200,
        })
      : Promise.resolve([]),
    Promise.all(
      productIds.map(async (productId) => {
        const product = await adminGet<{ id: string; title: string }>("products", productId);
        return product ?? { id: productId, title: productId };
      }),
    ),
  ]);

  const userMap = new Map<string, { email: string | null; name: string | null }>();
  for (const u of users) userMap.set(u.id, { email: u.email, name: u.display_name });
  const productMap = new Map<string, string>();
  for (const p of products) productMap.set(p.id, p.title);

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conversas"
        subtitle={`${total} thread(s) entre compradores e vendedores — moderação e bloqueio.`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/conversations"
              className={blockedOnly ? "kumbu-btn-secondary" : "kumbu-btn-primary"}
            >
              Todas
            </Link>
            <Link
              href="/conversations?blocked=1"
              className={blockedOnly ? "kumbu-btn-primary" : "kumbu-btn-secondary"}
            >
              Bloqueadas
            </Link>
          </div>
        }
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="Sem conversas"
          description={
            blockedOnly
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
              {rows.map((row) => {
                const buyer = userMap.get(row.buyer_id);
                const seller = userMap.get(row.seller_id);
                return (
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
                        {buyer?.name ?? buyer?.email ?? row.buyer_id.slice(0, 8)}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/users/${row.seller_id}`} className="text-sm hover:text-kumbu-red">
                        {seller?.name ?? seller?.email ?? row.seller_id.slice(0, 8)}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/conversations?${blockedOnly ? "blocked=1&" : ""}page=${page - 1}`}
              className="kumbu-btn-secondary"
            >
              Anterior
            </Link>
          )}
          <span className="self-center text-sm text-slate-500">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/conversations?${blockedOnly ? "blocked=1&" : ""}page=${page + 1}`}
              className="kumbu-btn-secondary"
            >
              Seguinte
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
