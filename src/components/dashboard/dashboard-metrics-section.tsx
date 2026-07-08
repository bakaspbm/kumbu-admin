"use client";

import Link from "next/link";
import {
  Users as UsersIcon,
  ShoppingBag,
  Package,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import { MetricSeriesChart } from "@/components/dashboard/metric-series-chart";
import { PERIOD_LABELS, type AnalyticsPeriod } from "@/lib/analytics-period";
import type { DashboardMetric } from "@/lib/dashboard-metric";
import type { AdminOverview } from "@/lib/types";

const METRIC_LABELS: Record<DashboardMetric, string> = {
  users: "Utilizadores",
  sellers: "Vendedores activos",
  orders: "Transações",
  listings: "Anúncios activos",
  notifications: "Notificações por ler",
};

const METRIC_CHART_LABELS: Record<DashboardMetric, string> = {
  users: "Novos utilizadores",
  sellers: "Novos anúncios de vendedores",
  orders: "Novas transações",
  listings: "Novos anúncios activos",
  notifications: "Notificações enviadas",
};

type SeriesPoint = { bucket: string; total: number };

export function DashboardMetricsSection({
  overview,
  marketplace,
  metric,
  period,
  series,
}: {
  overview: AdminOverview;
  marketplace: { activeListings: number; uniqueSellers: number };
  metric: DashboardMetric;
  period: AnalyticsPeriod;
  series: SeriesPoint[];
}) {
  const cards: {
    key: DashboardMetric;
    label: string;
    value: number;
    hint: string;
    icon: typeof UsersIcon;
    accent: "red" | "purple" | "blue" | "amber";
  }[] = [
    {
      key: "users",
      label: "Utilizadores",
      value: overview.users_total,
      hint: `+${overview.users_last_7d} nos últimos 7 dias`,
      icon: UsersIcon,
      accent: "red",
    },
    {
      key: "sellers",
      label: "Vendedores activos",
      value: marketplace.uniqueSellers,
      hint: `${marketplace.activeListings} anúncios publicados`,
      icon: Package,
      accent: "blue",
    },
    {
      key: "orders",
      label: "Transações",
      value: overview.orders_total,
      hint: `+${overview.orders_last_7d} nos últimos 7 dias`,
      icon: ShoppingBag,
      accent: "purple",
    },
    {
      key: "listings",
      label: "Anúncios activos",
      value: marketplace.activeListings,
      hint: `${overview.products_out_of_stock} esgotados`,
      icon: Package,
      accent: "blue",
    },
    {
      key: "notifications",
      label: "Notificações por ler",
      value: overview.notifications_unread,
      hint: "Em todas as caixas de utilizador",
      icon: Bell,
      accent: "amber",
    },
  ];

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.key}
            href={`/dashboard?metric=${card.key}&period=${period}`}
            className={cn(
              "block rounded-card transition focus:outline-none focus-visible:ring-2 focus-visible:ring-kumbu-red",
              metric === card.key && "ring-2 ring-kumbu-red ring-offset-2 ring-offset-[var(--kumbu-bg)]",
            )}
          >
            <StatCard
              label={card.label}
              value={card.value}
              hint={card.hint}
              icon={card.icon}
              accent={card.accent}
            />
          </Link>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="kumbu-label">Detalhe</p>
            <h3 className="text-base font-semibold text-kumbu-ink">
              {METRIC_LABELS[metric]} — {METRIC_CHART_LABELS[metric]}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PERIOD_LABELS) as AnalyticsPeriod[]).map((key) => (
              <Link
                key={key}
                href={`/dashboard?metric=${metric}&period=${key}`}
                className={cn(
                  "rounded-chip px-4 py-2 text-sm font-semibold transition",
                  period === key
                    ? "bg-kumbu-red text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-kumbu-red hover:text-kumbu-red",
                )}
              >
                {PERIOD_LABELS[key]}
              </Link>
            ))}
          </div>
        </div>
        <MetricSeriesChart
          title={METRIC_CHART_LABELS[metric]}
          period={period}
          data={series}
        />
      </section>
    </>
  );
}
