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

export type ChartPoint = { day: string; total: number };

export function OrdersChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="kumbu-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="kumbu-label">Atividade</p>
          <h3 className="text-base font-semibold text-kumbu-ink">
            Pedidos (últimos 30 dias)
          </h3>
        </div>
        <span className="text-xs text-slate-400">por dia</span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="kumbuArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C62828" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#C62828" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="day"
              tickFormatter={(d) => format(parseISO(d), "dd/MM", { locale: pt })}
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
              labelFormatter={(d) =>
                format(parseISO(String(d)), "dd 'de' MMMM", { locale: pt })
              }
              formatter={(v: number) => [v, "Pedidos"]}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#C62828"
              strokeWidth={2}
              fill="url(#kumbuArea)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
