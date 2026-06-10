import Link from "next/link";
import type { ReactNode } from "react";
import type { MarketplaceRankings } from "@/lib/marketplace-rankings";

function RankTable({
  title,
  subtitle,
  rows,
  renderRow,
}: {
  title: string;
  subtitle: string;
  rows: unknown[];
  renderRow: (row: Record<string, unknown>, i: number) => ReactNode;
}) {
  return (
    <div className="kumbu-card p-4">
      <h3 className="text-sm font-bold text-kumbu-ink">{title}</h3>
      <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      {rows.length === 0 ? (
        <p className="mt-3 text-xs text-slate-400">Sem dados ainda.</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {rows.map((row, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm"
            >
              <span className="w-6 shrink-0 text-xs font-bold text-slate-400">
                {i + 1}
              </span>
              {renderRow(row as Record<string, unknown>, i)}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function MarketplaceRankingsPanel({
  data,
}: {
  data: MarketplaceRankings | null;
}) {
  if (!data) {
    return (
      <p className="rounded-chip border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Rankings indisponíveis. Verifique se o backend Kumbu expõe{" "}
        <code className="text-xs">/admin/analytics/rankings</code>.
      </p>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Marketplace — destaques</h2>
        <p className="text-sm text-slate-500">
          Mais vistos, mais anunciados, mais vendidos (checkout) e negócios fechados no chat
          (Comprei).
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <RankTable
          title="Mais vistos"
          subtitle="Visualizações no anúncio"
          rows={data.topViewed}
          renderRow={(r) => (
            <>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${r.id}`}
                  className="truncate font-semibold text-kumbu-red hover:underline"
                >
                  {String(r.title ?? r.id)}
                </Link>
              </div>
              <span className="shrink-0 font-mono text-xs">
                {Number(r.view_count ?? 0)}
              </span>
            </>
          )}
        />
        <RankTable
          title="Mais anunciados (vendedores)"
          subtitle="Anúncios activos por vendedor"
          rows={data.topListedSellers}
          renderRow={(r) => (
            <>
              <Link
                href={`/users/${r.seller_id}`}
                className="min-w-0 flex-1 truncate font-semibold hover:text-kumbu-red"
              >
                {String(r.seller_id).slice(0, 8)}…
              </Link>
              <span className="font-mono text-xs">
                {Number(r.listing_count ?? 0)}
              </span>
            </>
          )}
        />
        <RankTable
          title="Mais vendidos (checkout)"
          subtitle="Unidades em encomendas"
          rows={data.topSoldProducts}
          renderRow={(r) => (
            <>
              <Link
                href={`/products/${r.product_id}`}
                className="min-w-0 flex-1 truncate font-semibold hover:text-kumbu-red"
              >
                {String(r.title ?? r.product_id)}
              </Link>
              <span className="font-mono text-xs">
                {Number(r.units_sold ?? 0)}
              </span>
            </>
          )}
        />
        <RankTable
          title="Mais «Comprei» (chat)"
          subtitle="Negócios fechados no chat"
          rows={data.topPurchasedDeals}
          renderRow={(r) => (
            <>
              <Link
                href={`/products/${r.product_id}`}
                className="min-w-0 flex-1 truncate font-semibold hover:text-kumbu-red"
              >
                {String(r.title ?? r.product_id)}
              </Link>
              <span className="font-mono text-xs">
                {Number(r.deal_count ?? 0)}
              </span>
            </>
          )}
        />
        <RankTable
          title="Top vendedores (encomendas)"
          subtitle="N.º de vendas"
          rows={data.topSellersByOrders}
          renderRow={(r) => (
            <>
              <Link
                href={`/users/${r.seller_id}`}
                className="min-w-0 flex-1 truncate font-semibold hover:text-kumbu-red"
              >
                Vendedor
              </Link>
              <span className="font-mono text-xs">
                {Number(r.orders_count ?? 0)}
              </span>
            </>
          )}
        />
        <RankTable
          title="Top compradores"
          subtitle="N.º de compras"
          rows={data.topBuyers}
          renderRow={(r) => (
            <>
              <Link
                href={`/users/${r.user_id}`}
                className="min-w-0 flex-1 truncate font-semibold hover:text-kumbu-red"
              >
                Comprador
              </Link>
              <span className="font-mono text-xs">
                {Number(r.orders_count ?? 0)}
              </span>
            </>
          )}
        />
      </div>
    </section>
  );
}
