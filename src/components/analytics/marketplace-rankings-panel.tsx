import Link from "next/link";
import type { ReactNode } from "react";
import type { MarketplaceRankings } from "@/lib/marketplace-rankings";

function userLabel(
  row: Record<string, unknown>,
  opts: { nameKey: string; emailKey: string; idKey: string },
): { primary: string; secondary?: string } {
  const name = String(row[opts.nameKey] ?? "").trim();
  const email = String(row[opts.emailKey] ?? "").trim();
  const id = String(row[opts.idKey] ?? "").trim();
  if (name) return { primary: name, secondary: email || undefined };
  if (email) return { primary: email };
  if (id) return { primary: `${id.slice(0, 8)}…` };
  return { primary: "—" };
}

function MetricBadge({ value, unit }: { value: number; unit: string }) {
  return (
    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      {value} {unit}
    </span>
  );
}

function UserRankLink({
  href,
  label,
  subtitle,
}: {
  href: string;
  label: { primary: string; secondary?: string };
  subtitle?: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <Link href={href} className="block truncate font-semibold text-kumbu-ink hover:text-kumbu-red">
        {label.primary}
      </Link>
      {(label.secondary || subtitle) && (
        <p className="truncate text-xs text-slate-500">{label.secondary ?? subtitle}</p>
      )}
    </div>
  );
}

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
  if (rows.length === 0) return null;

  return (
    <div className="kumbu-card p-4">
      <h3 className="text-sm font-bold text-kumbu-ink">{title}</h3>
      <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      <ol className="mt-3 space-y-2">
        {rows.map((row, i) => (
          <li
            key={i}
            className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2.5 text-sm dark:border-slate-800"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              {i + 1}
            </span>
            {renderRow(row as Record<string, unknown>, i)}
          </li>
        ))}
      </ol>
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
      <p className="kumbu-panel-warning px-4 py-3 text-sm">
        Rankings indisponíveis. Verifique se o backend Kumbu expõe{" "}
        <code className="text-xs">/admin/analytics/rankings</code>.
      </p>
    );
  }

  const sections = [
    {
      key: "topViewed",
      title: "Mais vistos",
      subtitle: "Visualizações no anúncio",
      rows: data.topViewed,
      renderRow: (r: Record<string, unknown>) => (
        <>
          <div className="min-w-0 flex-1">
            <Link
              href={`/products/${r.id}`}
              className="block truncate font-semibold text-kumbu-ink hover:text-kumbu-red"
            >
              {String(r.title ?? r.id)}
            </Link>
          </div>
          <MetricBadge value={Number(r.view_count ?? 0)} unit="views" />
        </>
      ),
    },
    {
      key: "topListedSellers",
      title: "Mais anunciados",
      subtitle: "Anúncios activos por vendedor",
      rows: data.topListedSellers,
      renderRow: (r: Record<string, unknown>) => (
        <>
          <UserRankLink
            href={`/users/${r.seller_id}`}
            label={userLabel(r, {
              nameKey: "seller_name",
              emailKey: "seller_email",
              idKey: "seller_id",
            })}
          />
          <MetricBadge value={Number(r.listing_count ?? 0)} unit="anúncios" />
        </>
      ),
    },
    {
      key: "topSoldProducts",
      title: "Mais vendidos (checkout)",
      subtitle: "Unidades em encomendas",
      rows: data.topSoldProducts,
      renderRow: (r: Record<string, unknown>) => (
        <>
          <Link
            href={`/products/${r.product_id}`}
            className="min-w-0 flex-1 truncate font-semibold text-kumbu-ink hover:text-kumbu-red"
          >
            {String(r.title ?? r.product_id)}
          </Link>
          <MetricBadge value={Number(r.units_sold ?? 0)} unit="un." />
        </>
      ),
    },
    {
      key: "topPurchasedDeals",
      title: "Mais «Comprei» (chat)",
      subtitle: "Negócios fechados no chat",
      rows: data.topPurchasedDeals,
      renderRow: (r: Record<string, unknown>) => (
        <>
          <Link
            href={`/products/${r.product_id}`}
            className="min-w-0 flex-1 truncate font-semibold text-kumbu-ink hover:text-kumbu-red"
          >
            {String(r.title ?? r.product_id)}
          </Link>
          <MetricBadge value={Number(r.deal_count ?? 0)} unit="negócios" />
        </>
      ),
    },
    {
      key: "topSellersByOrders",
      title: "Top vendedores (encomendas)",
      subtitle: "Encomendas concluídas",
      rows: data.topSellersByOrders,
      renderRow: (r: Record<string, unknown>) => (
        <>
          <UserRankLink
            href={`/users/${r.seller_id}`}
            label={userLabel(r, {
              nameKey: "seller_name",
              emailKey: "seller_email",
              idKey: "seller_id",
            })}
          />
          <MetricBadge value={Number(r.orders_count ?? 0)} unit="vendas" />
        </>
      ),
    },
    {
      key: "topBuyers",
      title: "Top compradores",
      subtitle: "Encomendas efectuadas",
      rows: data.topBuyers,
      renderRow: (r: Record<string, unknown>) => (
        <>
          <UserRankLink
            href={`/users/${r.user_id}`}
            label={userLabel(r, {
              nameKey: "buyer_name",
              emailKey: "buyer_email",
              idKey: "user_id",
            })}
          />
          <MetricBadge value={Number(r.orders_count ?? 0)} unit="compras" />
        </>
      ),
    },
  ];

  const visible = sections.filter((s) => s.rows.length > 0);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-kumbu-ink">Marketplace — destaques</h2>
        <p className="text-sm text-slate-500">
          Anúncios mais vistos, vendedores mais activos e negócios fechados no chat.
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="kumbu-card px-4 py-6 text-sm text-slate-500">
          Ainda não há dados suficientes para rankings do marketplace.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {visible.map((section) => (
            <RankTable
              key={section.key}
              title={section.title}
              subtitle={section.subtitle}
              rows={section.rows}
              renderRow={section.renderRow}
            />
          ))}
        </div>
      )}
    </section>
  );
}
