"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { fillBuckets, type AnalyticsPeriod } from "@/lib/analytics-period";

type SeriesPoint = { bucket: string; total: number };

export function MetricSeriesChart({
  title,
  period,
  data,
}: {
  title: string;
  period: AnalyticsPeriod;
  data: SeriesPoint[];
}) {
  const chart = fillBuckets(period, data).map((p) => ({
    day: p.bucket,
    total: p.total,
  }));

  return (
    <div className="kumbu-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="kumbu-label">Evolução</p>
          <h3 className="text-base font-semibold text-kumbu-ink">{title}</h3>
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <AreaChart data={chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="kumbuMetricArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C62828" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#C62828" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="day"
              tickFormatter={(d) => {
                try {
                  return format(parseISO(String(d)), period === "year" ? "yyyy" : "dd/MM", {
                    locale: pt,
                  });
                } catch {
                  return String(d);
                }
              }}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
              formatter={(v: number) => [v, "Total"]}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#C62828"
              strokeWidth={2}
              fill="url(#kumbuMetricArea)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
