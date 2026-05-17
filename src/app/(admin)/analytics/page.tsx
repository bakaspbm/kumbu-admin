import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth";
import { getAnalyticsSnapshot } from "@/lib/analytics";
import { parseAnalyticsPeriod } from "@/lib/analytics-period";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { PeriodFilter } from "@/components/analytics/period-filter";
import { TimeSeriesChart } from "@/components/analytics/time-series-chart";
import { DemographicsPanel } from "@/components/analytics/demographics-panel";
import { PERIOD_LABELS } from "@/lib/analytics-period";

export const dynamic = "force-dynamic";

export const metadata = { title: "Estatísticas — Kumbu Admin" };

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await requireSuperAdmin();
  const params = await searchParams;
  const period = parseAnalyticsPeriod(params.period);
  const supabase = await createSupabaseServerClient();
  const snapshot = await getAnalyticsSnapshot(supabase, period);

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

      {!snapshot.rpcAvailable && (
        <p className="rounded-chip border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Executa <code className="text-xs">supabase/analytics_schema.sql</code> no
          Supabase para métricas completas. A mostrar dados calculados em modo
          compatível.
        </p>
      )}

      <PeriodFilter period={period} />
      <p className="text-xs text-slate-500 -mt-2">
        Agrupamento por {PERIOD_LABELS[period].toLowerCase()} · utilizadores e produtos
      </p>

      <DemographicsPanel data={snapshot.demographics} />

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

