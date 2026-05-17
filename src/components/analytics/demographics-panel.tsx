"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Demographics } from "@/lib/analytics";
import { formatNumber } from "@/lib/utils";

const GENDER_COLORS = ["#C62828", "#7B1FA2", "#1565C0", "#F59E0B", "#64748B"];

export function DemographicsPanel({ data }: { data: Demographics }) {
  const genderData = Object.entries(data.gender).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Utilizadores ativos" value={formatNumber(data.total_users)} />
        <Stat label="Contas eliminadas" value={formatNumber(data.deleted_users)} />
        <Stat
          label="Idade média"
          value={data.avg_age != null ? `${formatNumber(data.avg_age, 1)} anos` : "—"}
        />
        <Stat
          label="Taxa de churn"
          value={
            data.total_users + data.deleted_users > 0
              ? `${formatNumber(
                  (data.deleted_users / (data.total_users + data.deleted_users)) * 100,
                  1
                )}%`
              : "—"
          }
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="kumbu-card p-5 lg:col-span-1">
          <p className="kumbu-label">Perfil</p>
          <h3 className="mb-3 text-base font-semibold">Sexo / género</h3>
          {genderData.length === 0 ? (
            <p className="text-sm text-slate-500">Sem dados de género.</p>
          ) : (
            <div className="h-52">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                  >
                    {genderData.map((_, i) => (
                      <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            {genderData.map((g, i) => (
              <li key={g.name} className="flex justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: GENDER_COLORS[i % GENDER_COLORS.length],
                    }}
                  />
                  {g.name}
                </span>
                <span className="font-semibold">{g.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <BarList title="Top cidades" items={data.cities} color="#C62828" />
        <BarList title="Top países" items={data.countries} color="#7B1FA2" />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="kumbu-card p-4">
      <p className="kumbu-label">{label}</p>
      <p className="mt-1 text-xl font-bold text-kumbu-ink">{value}</p>
    </div>
  );
}

function BarList({
  title,
  items,
  color,
}: {
  title: string;
  items: { name: string; count: number }[];
  color: string;
}) {
  return (
    <div className="kumbu-card p-5">
      <p className="kumbu-label">Localização</p>
      <h3 className="mb-3 text-base font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Sem dados de localização.</p>
      ) : (
        <div className="h-52">
          <ResponsiveContainer>
            <BarChart data={items} layout="vertical" margin={{ left: 8, right: 8 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={72}
                tick={{ fontSize: 10 }}
              />
              <Tooltip />
              <Bar dataKey="count" fill={color} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
