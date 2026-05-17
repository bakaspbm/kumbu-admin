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
import type { ChartSeries } from "@/lib/analytics";
import type { AnalyticsPeriod } from "@/lib/analytics-period";

function formatBucketLabel(bucket: string, period: AnalyticsPeriod) {
  if (period === "year") return bucket;
  if (period === "month") {
    const [y, m] = bucket.split("-");
    return `${m}/${y?.slice(2)}`;
  }
  const parts = bucket.split("-");
  if (parts.length >= 3) return `${parts[2]}/${parts[1]}`;
  return bucket;
}

export function TimeSeriesChart({
  title,
  subtitle,
  data,
  period,
  color = "#C62828",
  label = "Total",
}: {
  title: string;
  subtitle?: string;
  data: ChartSeries;
  period: AnalyticsPeriod;
  color?: string;
  label?: string;
}) {
  const total = data.reduce((s, d) => s + d.total, 0);
  const gradId = `grad-${title.replace(/\s+/g, "-")}`;

  return (
    <div className="kumbu-card p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="kumbu-label">{subtitle ?? "Evolução"}</p>
          <h3 className="text-base font-semibold text-kumbu-ink">{title}</h3>
        </div>
        <span className="text-sm font-bold" style={{ color }}>
          {total}
        </span>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="bucket"
              tickFormatter={(b) => formatBucketLabel(String(b), period)}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
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
              labelFormatter={(b) => formatBucketLabel(String(b), period)}
              formatter={(v: number) => [v, label]}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
