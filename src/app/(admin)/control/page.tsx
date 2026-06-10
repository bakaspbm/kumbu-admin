import Link from "next/link";
import {
  Users,
  ShoppingBag,
  Package,
  Bell,
  MessageCircle,
  Megaphone,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth";
import { adminFetchItem } from "@/lib/admin-data";
import { PageHeader } from "@/components/ui/page-header";
import { OrderStatusBadge } from "@/components/ui/status-badge";
import { AccountStatusBadge } from "@/components/ui/account-status-badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { MarketingBlock, OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "Controlo total — Kumbu Admin" };

type ControlOverview = {
  users: { total: number; active: number; deleted: number };
  marketplace: {
    activeListings: number;
    uniqueSellers: number;
    totalPurchases: number;
    totalSales: number;
  };
  orders: Record<OrderStatus, number> & { total: number };
  products: { active: number; deleted: number; outOfStock: number };
  notifications: { total: number; unread: number; hidden: number };
  marketingBlocks: MarketingBlock[];
  recentUsers: {
    id: string;
    email: string | null;
    display_name: string | null;
    created_at: string;
    deleted_at: string | null;
    banned_at: string | null;
    banned_until: string | null;
    ban_reason: string | null;
    city: string | null;
    country: string | null;
  }[];
  recentOrders: {
    id: string;
    user_id: string;
    seller_id: string | null;
    created_at: string;
    total_label: string;
    status: OrderStatus;
    buyer_email: string | null;
    seller_email: string | null;
  }[];
};

const EMPTY_CONTROL: ControlOverview = {
  users: { total: 0, active: 0, deleted: 0 },
  marketplace: {
    activeListings: 0,
    uniqueSellers: 0,
    totalPurchases: 0,
    totalSales: 0,
  },
  orders: { total: 0, processing: 0, shipping: 0, delivered: 0, cancelled: 0 },
  products: { active: 0, deleted: 0, outOfStock: 0 },
  notifications: { total: 0, unread: 0, hidden: 0 },
  marketingBlocks: [],
  recentUsers: [],
  recentOrders: [],
};

const QUICK_LINKS = [
  { href: "/users", label: "Utilizadores C2C", icon: Users, desc: "Comprador e vendedor" },
  { href: "/orders", label: "Transações", icon: ShoppingBag, desc: "Compras entre utilizadores" },
  { href: "/conversations", label: "Conversas", icon: MessageCircle, desc: "Chat comprador ↔ vendedor" },
  { href: "/products", label: "Anúncios", icon: Package, desc: "Publicados na app" },
  { href: "/marketing", label: "Banners da app", icon: Megaphone, desc: "Hero e ofertas" },
  { href: "/notifications", label: "Notificações", icon: Bell, desc: "Enviar e ocultar" },
  { href: "/analytics", label: "Estatísticas", icon: BarChart3, desc: "Crescimento" },
];

export default async function ControlPage() {
  await requireSuperAdmin();
  const data =
    (await adminFetchItem<ControlOverview>("dashboard/control")) ?? EMPTY_CONTROL;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Controlo total"
        subtitle="Marketplace C2C: cada utilizador compra e vende. Moderação centralizada."
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        <Stat label="Utilizadores activos" value={data.users.active} accent="text-kumbu-red" />
        <Stat label="Vendedores activos" value={data.marketplace.uniqueSellers} accent="text-emerald-600" />
        <Stat label="Anúncios activos" value={data.marketplace.activeListings} accent="text-purple-600" />
        <Stat label="Compras" value={data.marketplace.totalPurchases} accent="text-indigo-600" />
        <Stat label="Vendas registadas" value={data.marketplace.totalSales} accent="text-sky-600" />
        <Stat label="Contas eliminadas" value={data.users.deleted} accent="text-rose-600" />
        <Stat label="Notificações" value={data.notifications.total} accent="text-amber-600" />
        <Stat label="Por ler" value={data.notifications.unread} accent="text-slate-600" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="kumbu-card p-5">
          <p className="kumbu-label">Operação</p>
          <h3 className="mb-4 text-base font-semibold">Estados dos pedidos</h3>
          <ul className="grid grid-cols-2 gap-3">
            {(
              [
                ["processing", data.orders.processing],
                ["shipping", data.orders.shipping],
                ["delivered", data.orders.delivered],
                ["cancelled", data.orders.cancelled],
              ] as const
            ).map(([status, count]) => (
              <li
                key={status}
                className="flex items-center justify-between rounded-chip border border-slate-100 px-3 py-2"
              >
                <OrderStatusBadge status={status} />
                <span className="text-lg font-bold">{count}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/orders"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-kumbu-red hover:underline"
          >
            Ver transações <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="kumbu-card p-5">
          <p className="kumbu-label">Marketplace</p>
          <h3 className="mb-4 text-base font-semibold">Anúncios dos utilizadores</h3>
          <dl className="space-y-2 text-sm">
            <Row label="Anúncios activos" value={data.products.active} />
            <Row label="Removidos (soft delete)" value={data.products.deleted} />
            <Row label="Esgotados" value={data.products.outOfStock} />
            <Row label="Notificações ocultas" value={data.notifications.hidden} />
          </dl>
          <Link
            href="/products?show_deleted=1"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-kumbu-red hover:underline"
          >
            Ver anúncios <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="kumbu-card p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <p className="kumbu-label">App cliente</p>
            <h3 className="text-base font-semibold">Anúncios visíveis na app</h3>
          </div>
          <Link href="/marketing" className="kumbu-btn-ghost text-sm">
            Editar anúncios
          </Link>
        </div>
        {data.marketingBlocks.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum bloco de marketing configurado.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.marketingBlocks.map((b) => (
              <div
                key={b.id}
                className="overflow-hidden rounded-chip border border-slate-100"
              >
                <div
                  className="h-20 p-4 text-white"
                  style={{
                    background: `linear-gradient(135deg, #${b.gradient_from} 0%, #${b.gradient_to} 100%)`,
                  }}
                >
                  <p className="text-[10px] uppercase opacity-80">{b.kind}</p>
                  <p className="font-bold">{b.title}</p>
                  <p className="text-xs opacity-90 line-clamp-1">{b.subtitle}</p>
                </div>
                <p className="px-3 py-2 text-xs text-slate-500 font-mono">{b.id}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="kumbu-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Utilizadores recentes</h3>
            <Link href="/users" className="text-sm font-semibold text-kumbu-red hover:underline">
              Ver todos
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {data.recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-2 py-2.5">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-sm">
                    {u.display_name || u.email || "Sem nome"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(u.created_at)}
                    {u.city ? ` · ${u.city}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <AccountStatusBadge user={u} />
                  <Link
                    href={`/users/${u.id}`}
                    className="text-kumbu-red hover:underline text-xs font-semibold"
                  >
                    Abrir
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="kumbu-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Transações recentes</h3>
            <Link href="/orders" className="text-sm font-semibold text-kumbu-red hover:underline">
              Ver todos
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {data.recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="font-mono text-xs">{o.id}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {o.buyer_email ?? "Comprador"} → {o.seller_email ?? "Vendedor"}
                  </p>
                  <p className="text-[10px] text-slate-400">{formatDateTime(o.created_at)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-semibold">{o.total_label}</span>
                  <OrderStatusBadge status={o.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="kumbu-card flex items-center gap-3 p-4 hover:border-kumbu-red hover:shadow-sm transition"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl2 bg-rose-100 text-kumbu-red">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="kumbu-card p-4">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-2 border-b border-slate-50 py-1 last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
