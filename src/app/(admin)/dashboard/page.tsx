import Link from "next/link";

import {

  Users as UsersIcon,

  ShoppingBag,

  Package,

  Bell,

  ArrowUpRight,

  TrendingUp,

  PackageX,

  Tags,

} from "lucide-react";

import { format, subDays } from "date-fns";

import { adminListSafe } from "@/lib/admin-data";

import { PageHeader } from "@/components/ui/page-header";

import { StatCard } from "@/components/ui/stat-card";

import { OrderStatusBadge } from "@/components/ui/status-badge";

import { OrdersChart, type ChartPoint } from "@/components/dashboard/orders-chart";

import { StatusDonut, type DonutSlice } from "@/components/dashboard/status-donut";

import { formatDateTime } from "@/lib/utils";

import type { AdminOverview, KumbuOrder, OrderStatus } from "@/lib/types";



export const dynamic = "force-dynamic";



const STATUS_COLORS: Record<OrderStatus, string> = {

  processing: "#F59E0B",

  shipping: "#6366F1",

  delivered: "#10B981",

  cancelled: "#EF4444",

};



const STATUS_LABEL: Record<OrderStatus, string> = {

  processing: "Em processamento",

  shipping: "Em trânsito",

  delivered: "Entregue",

  cancelled: "Cancelado",

};



export default async function DashboardPage() {

  const [overviewRes, marketplaceRes, recentOrdersRes, ordersTimelineRes] =

    await Promise.all([

      adminListSafe<AdminOverview>("dashboard"),

      adminListSafe<{ activeListings: number; uniqueSellers: number }>(

        "dashboard/marketplace",

      ),

      adminListSafe<KumbuOrder>("orders", { limit: 8 }),

      adminListSafe<{ created_at: string }>("orders", { timeline_days: 30 }),

    ]);

  const apiErrors = [

    overviewRes.error,

    marketplaceRes.error,

    recentOrdersRes.error,

    ordersTimelineRes.error,

  ].filter(Boolean) as string[];

  const overviewRows = overviewRes.data;

  const marketplaceRows = marketplaceRes.data;

  const recentOrders = recentOrdersRes.data;

  const ordersTimelineRows = ordersTimelineRes.data;

  const marketplace = marketplaceRows[0] ?? { activeListings: 0, uniqueSellers: 0 };

  const overview = (overviewRows[0] ?? {

    users_total: 0,

    users_last_7d: 0,

    orders_total: 0,

    orders_last_7d: 0,

    orders_processing: 0,

    orders_shipping: 0,

    orders_delivered: 0,

    orders_cancelled: 0,

    products_total: 0,

    products_out_of_stock: 0,

    categories_total: 0,

    notifications_unread: 0,

  }) as AdminOverview;

  const timeline = new Map<string, number>();

  for (let i = 29; i >= 0; i--) timeline.set(format(subDays(new Date(), i), "yyyy-MM-dd"), 0);

  for (const row of ordersTimelineRows) {

    const day = format(new Date(row.created_at), "yyyy-MM-dd");

    if (timeline.has(day)) timeline.set(day, (timeline.get(day) ?? 0) + 1);

  }

  const chart: ChartPoint[] = Array.from(timeline.entries()).map(([day, total]) => ({ day, total }));

  const donutTotal =

    overview.orders_processing + overview.orders_shipping + overview.orders_delivered + overview.orders_cancelled;

  const donut: DonutSlice[] = (

    [

      ["processing", overview.orders_processing],

      ["shipping", overview.orders_shipping],

      ["delivered", overview.orders_delivered],

      ["cancelled", overview.orders_cancelled],

    ] as [OrderStatus, number][]

  )

    .filter(([, v]) => v > 0)

    .map(([s, v]) => ({ name: STATUS_LABEL[s], value: v, color: STATUS_COLORS[s] }));



  return (

    <div className="space-y-6">

      <PageHeader title="Visão geral" subtitle="Marketplace C2C — utilizadores compram e vendem entre si." />

      {apiErrors.length > 0 && (

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">

          <p className="font-semibold">Alguns dados do dashboard não carregaram.</p>

          <p className="mt-1 text-amber-900/90">

            {apiErrors[0]} Verifique se o backend Kumbu está a correr em{" "}

            <code className="rounded bg-amber-100 px-1">localhost:8080</code>.

          </p>

        </div>

      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

        <StatCard label="Utilizadores" value={overview.users_total} hint={`+${overview.users_last_7d} nos últimos 7 dias`} icon={UsersIcon} accent="red" />

        <StatCard label="Vendedores activos" value={marketplace.uniqueSellers} hint={`${marketplace.activeListings} anúncios publicados`} icon={Package} accent="blue" />

        <StatCard label="Transações" value={overview.orders_total} hint={`+${overview.orders_last_7d} nos últimos 7 dias`} icon={ShoppingBag} accent="purple" />

        <StatCard label="Anúncios activos" value={marketplace.activeListings} hint={`${overview.products_out_of_stock} esgotados`} icon={Package} accent="blue" />

        <StatCard label="Notificações por ler" value={overview.notifications_unread} hint="Em todas as caixas de utilizador" icon={Bell} accent="amber" />

      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        <div className="lg:col-span-2"><OrdersChart data={chart} /></div>

        <StatusDonut data={donut} total={donutTotal} />

      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        <div className="kumbu-card p-5 lg:col-span-2">

          <div className="mb-4 flex items-center justify-between"><div><p className="kumbu-label">Operacional</p><h3 className="text-base font-semibold text-kumbu-ink">Últimas transações</h3></div><Link href="/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-kumbu-red hover:underline">Ver todos <ArrowUpRight className="h-4 w-4" /></Link></div>

          {recentOrders.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">Ainda não há pedidos.</p> : <div className="overflow-x-auto"><table className="kumbu-table"><thead><tr><th>ID</th><th>Data</th><th>Itens</th><th>Total</th><th>Estado</th></tr></thead><tbody>{recentOrders.map((o) => (<tr key={o.id}><td className="font-mono text-xs">{o.id}</td><td>{formatDateTime(o.created_at)}</td><td>{o.items_count}</td><td className="font-semibold">{o.total_label}</td><td><OrderStatusBadge status={o.status} /></td></tr>))}</tbody></table></div>}

        </div>

        <div className="kumbu-card p-5">

          <p className="kumbu-label">Hot links</p>

          <h3 className="text-base font-semibold text-kumbu-ink">Acesso rápido</h3>

          <ul className="mt-4 space-y-2">

            <QuickLink href="/products?out_of_stock=1" icon={PackageX} title="Anúncios esgotados" hint={`${overview.products_out_of_stock} esgotado(s)`} />

            <QuickLink href="/orders?status=processing" icon={TrendingUp} title="Compras a processar" hint={`${overview.orders_processing} pendentes`} />

            <QuickLink href="/categories" icon={Tags} title="Categorias" hint={`${overview.categories_total} ativas`} />

            <QuickLink href="/notifications" icon={Bell} title="Enviar notificação" hint="Push para utilizadores" />

          </ul>

        </div>

      </section>

    </div>

  );

}



function QuickLink({

  href,

  title,

  hint,

  icon: Icon,

}: {

  href: string;

  title: string;

  hint: string;

  icon: typeof UsersIcon;

}) {

  return (

    <li>

      <Link

        href={href}

        className="flex items-center gap-3 rounded-chip border border-slate-100 px-3 py-2.5 hover:border-kumbu-red hover:bg-rose-50/40"

      >

        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl2 bg-rose-100 text-kumbu-red">

          <Icon className="h-4 w-4" />

        </span>

        <div className="flex-1">

          <p className="text-sm font-semibold">{title}</p>

          <p className="text-xs text-slate-500">{hint}</p>

        </div>

        <ArrowUpRight className="h-4 w-4 text-slate-400" />

      </Link>

    </li>

  );

}

