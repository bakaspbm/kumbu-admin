"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export type DonutSlice = { name: string; value: number; color: string };

export function StatusDonut({ data, total }: { data: DonutSlice[]; total: number }) {
  return (
    <div className="kumbu-card p-5">
      <div className="mb-3">
        <p className="kumbu-label">Pedidos</p>
        <h3 className="text-base font-semibold text-kumbu-ink">
          Distribuição por estado
        </h3>
      </div>
      <div className="relative h-56 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            <Pie
              data={data}
              dataKey="value"
              innerRadius={56}
              outerRadius={84}
              paddingAngle={2}
              stroke="white"
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs text-slate-500">total</p>
        </div>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-2 text-xs">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: d.color }}
            />
            <span className="text-slate-600">{d.name}</span>
            <span className="ml-auto font-semibold">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
