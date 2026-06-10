import Link from "next/link";

import { requireSuperAdmin } from "@/lib/auth";

import { adminFetchItem } from "@/lib/admin-data";

import { parseAnalyticsPeriod } from "@/lib/analytics-period";

import type { AnalyticsSnapshot, Demographics, ChartSeries } from "@/lib/analytics";

import { PageHeader } from "@/components/ui/page-header";

import { PeriodFilter } from "@/components/analytics/period-filter";

import { TimeSeriesChart } from "@/components/analytics/time-series-chart";

import { DemographicsPanel } from "@/components/analytics/demographics-panel";

import { PERIOD_LABELS } from "@/lib/analytics-period";

import type { MarketplaceRankings } from "@/lib/marketplace-rankings";

import { MarketplaceRankingsPanel } from "@/components/analytics/marketplace-rankings-panel";



export const dynamic = "force-dynamic";



export const metadata = { title: "Estatísticas — Kumbu Admin" };



const EMPTY_SNAPSHOT = (period: AnalyticsSnapshot["period"]): AnalyticsSnapshot => ({

  period,

  userSignups: [] as ChartSeries,

  userDeletions: [] as ChartSeries,

  productCreated: [] as ChartSeries,

  productDeleted: [] as ChartSeries,

  demographics: {

    total_users: 0,

    deleted_users: 0,

    avg_age: null,

    gender: {},

    cities: [],

    countries: [],

  } satisfies Demographics,

  rpcAvailable: true,

});



export default async function AnalyticsPage({

  searchParams,

}: {

  searchParams: Promise<{ period?: string }>;

}) {

  await requireSuperAdmin();

  const params = await searchParams;

  const period = parseAnalyticsPeriod(params.period);

  const [snapshot, rankings] = await Promise.all([
    adminFetchItem<AnalyticsSnapshot>("analytics", { period }).then(
      (r) => r ?? EMPTY_SNAPSHOT(period),
    ),
    adminFetchItem<MarketplaceRankings>("analytics/rankings", { limit: 10 }),
  ]);



  return (

    <div className="space-y-6">

      <PageHeader

        title="Estatísticas & crescimento"

        subtitle="Cadastros, eliminações de perfil, produtos e perfil demográfico da base Kumbu."

        actions={

          <Link href="/notifications" className="kumbu-btn-ghost text-sm">

            Notificações

          </Link>

        }

      />



      <PeriodFilter period={period} />

      <p className="text-xs text-slate-500 -mt-2">

        Agrupamento por {PERIOD_LABELS[period].toLowerCase()} · utilizadores e produtos

      </p>



      <DemographicsPanel data={snapshot.demographics} />



      <MarketplaceRankingsPanel data={rankings} />



      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">

        <TimeSeriesChart

          title="Novos cadastros"

          subtitle="Utilizadores"

          data={snapshot.userSignups}

          period={period}

          color="#C62828"

          label="Cadastros"

        />

        <TimeSeriesChart

          title="Perfis eliminados"

          subtitle="Utilizadores"

          data={snapshot.userDeletions}

          period={period}

          color="#EF4444"

          label="Eliminações"

        />

        <TimeSeriesChart

          title="Produtos adicionados"

          subtitle="Catálogo"

          data={snapshot.productCreated}

          period={period}

          color="#7B1FA2"

          label="Produtos"

        />

        <TimeSeriesChart

          title="Produtos removidos"

          subtitle="Catálogo"

          data={snapshot.productDeleted}

          period={period}

          color="#64748B"

          label="Removidos"

        />

      </section>

    </div>

  );

}

