"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO, isValid } from "date-fns";
import { pt } from "date-fns/locale";

type DayPoint = { date: string; visitors: number };
type Granularity = "hour" | "day" | "month" | string;

function detectGranularity(points: DayPoint[], explicit?: Granularity): Granularity {
  if (explicit === "hour" || explicit === "day" || explicit === "month") return explicit;
  if (points.some((p) => /T\d{2}$/.test(p.date))) return "hour";
  if (points.every((p) => /^\d{4}-\d{2}$/.test(p.date))) return "month";
  return "day";
}

function safeParseBucket(value: string, granularity: Granularity): Date | null {
  try {
    const s = String(value);
    if (granularity === "hour" || /T\d{2}$/.test(s)) {
      const d = parseISO(`${s}:00:00`);
      return isValid(d) ? d : null;
    }
    if (granularity === "month" || /^\d{4}-\d{2}$/.test(s)) {
      const d = parseISO(/^\d{4}-\d{2}$/.test(s) ? `${s}-01` : s);
      return isValid(d) ? d : null;
    }
    const d = parseISO(s);
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
}

function titleFor(granularity: Granularity): string {
  switch (granularity) {
    case "hour":
      return "Visitantes únicos por hora";
    case "month":
      return "Visitantes por mês";
    default:
      return "Visitantes únicos por dia";
  }
}

function tickLabel(date: Date, granularity: Granularity): string {
  switch (granularity) {
    case "hour":
      return format(date, "HH:mm", { locale: pt });
    case "month":
      return format(date, "MMM yy", { locale: pt });
    default:
      return format(date, "dd/MM", { locale: pt });
  }
}

function tooltipLabel(date: Date, granularity: Granularity): string {
  switch (granularity) {
    case "hour":
      return format(date, "EEE dd/MM · HH:mm", { locale: pt });
    case "month":
      return format(date, "MMMM yyyy", { locale: pt });
    default:
      return format(date, "EEE dd/MM/yyyy", { locale: pt });
  }
}

export function VisitorDaysChart({
  days,
  subtitle,
  granularity: granularityProp,
}: {
  days: DayPoint[];
  subtitle?: string;
  granularity?: Granularity;
}) {
  const data = useMemo(() => {
    return [...(days ?? [])]
      .filter((d) => d?.date)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({ date: d.date, visitors: Number(d.visitors) || 0 }));
  }, [days]);

  const granularity = detectGranularity(data, granularityProp);
  const total = data.reduce((sum, d) => sum + d.visitors, 0);

  if (data.length === 0) return null;

  return (
    <div className="kumbu-card mt-3 p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {titleFor(granularity)}
          </p>
          <p className="text-[11px] text-slate-400">{subtitle ?? `${data.length} pontos`}</p>
        </div>
        <span className="text-sm font-bold tabular-nums text-kumbu-red">{total}</span>
      </div>
      <div className="h-48 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="visitorDaysArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C62828" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#C62828" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => {
                const parsed = safeParseBucket(String(d), granularity);
                if (!parsed) return String(d);
                return tickLabel(parsed, granularity);
              }}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={granularity === "hour" ? 8 : 16}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
              labelFormatter={(d) => {
                const parsed = safeParseBucket(String(d), granularity);
                if (!parsed) return String(d);
                return tooltipLabel(parsed, granularity);
              }}
              formatter={(v: number) => [v, "Visitantes"]}
            />
            <Area
              type="monotone"
              dataKey="visitors"
              stroke="#C62828"
              strokeWidth={2}
              fill="url(#visitorDaysArea)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
