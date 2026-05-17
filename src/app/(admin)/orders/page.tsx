import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";
import type { KumbuOrder, OrderStatus } from "@/lib/types";
import { DeleteOrderButton, StatusSelect } from "./row-actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;
const ALL_STATUS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "processing", label: "Em processamento" },
  { value: "shipping", label: "Em trânsito" },
  { value: "delivered", label: "Entregue" },
  { value: "cancelled", label: "Cancelado" },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = (params?.status ?? "all") as OrderStatus | "all";
  const query = (params?.q ?? "").trim();
  const page = Math.max(1, Number(params?.page ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createSupabaseServerClient();
  let q = supabase
    .from("orders")
    .select("id, user_id, created_at, items_count, total_label, status, show_track", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status !== "all") q = q.eq("status", status);
  if (query) q = q.ilike("id", `%${query}%`);

  const { data, count } = await q;
  const orders = (data ?? []) as KumbuOrder[];

  const userIds = Array.from(new Set(orders.map((o) => o.user_id)));
  const userMap = new Map<string, { email: string | null; name: string | null }>();
  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, email, display_name")
      .in("id", userIds);
    for (const u of users ?? []) {
      userMap.set(u.id, { email: u.email, name: u.display_name });
    }
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Pedidos"
        subtitle={`${total} pedido(s) — filtra por estado ou procura pelo ID.`}
        actions={
          <form className="flex items-center gap-2">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="ID do pedido"
              className="kumbu-input w-56"
            />
            <button className="kumbu-btn-ghost">Procurar</button>
          </form>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {ALL_STATUS.map((s) => {
          const sp = new URLSearchParams();
          if (s.value !== "all") sp.set("status", s.value);
          if (query) sp.set("q", query);
          const active = status === s.value;
          return (
            <Link
              key={s.value}
              href={`/orders${sp.toString() ? `?${sp.toString()}` : ""}`}
              className={
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors " +
                (active
                  ? "bg-kumbu-red text-white shadow-card"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50")
              }
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Sem pedidos"
          description="Quando um cliente fizer um pedido aparece aqui."
        />
      ) : (
        <div className="kumbu-card overflow-x-auto">
          <table className="kumbu-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Estado</th>
                <th aria-label="ações" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const u = userMap.get(o.user_id);
                return (
                  <tr key={o.id}>
                    <td className="font-mono text-xs">{o.id}</td>
                    <td>
                      <p className="font-semibold">
                        {u?.name?.trim() || u?.email || "Cliente"}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {o.user_id.slice(0, 8)}…
                      </p>
                    </td>
                    <td>{formatDateTime(o.created_at)}</td>
                    <td>{o.items_count}</td>
                    <td className="font-semibold">{o.total_label}</td>
                    <td>
                      <StatusSelect id={o.id} status={o.status} />
                    </td>
                    <td className="text-right">
                      <DeleteOrderButton id={o.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-slate-500">
            Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={makeUrl({ status, query, page: page - 1 })}
                className="kumbu-btn-ghost"
              >
                Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={makeUrl({ status, query, page: page + 1 })}
                className="kumbu-btn-primary"
              >
                Seguinte
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function makeUrl({
  status,
  query,
  page,
}: {
  status: OrderStatus | "all";
  query: string;
  page: number;
}) {
  const sp = new URLSearchParams();
  if (status !== "all") sp.set("status", status);
  if (query) sp.set("q", query);
  sp.set("page", String(page));
  return `/orders?${sp.toString()}`;
}
