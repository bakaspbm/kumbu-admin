import Link from "next/link";
import { Activity, ChevronRight, Eye, Globe, HelpCircle, Smartphone, Users } from "lucide-react";
import { adminFetch } from "@/lib/admin-data";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { ClientSourceBadge } from "@/components/ui/client-source-badge";
import { VisitorDaysChart } from "@/components/analytics/visitor-days-chart";
import { VisitorPeriodFilter } from "@/components/analytics/visitor-period-filter";
import { resolveVisitorPeriodFromParams, visitorPeriodCardLabel } from "@/lib/visitor-period";
import { formatDateTime } from "@/lib/utils";
import type { OnlineUsersResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

function formatLastSeen(seconds?: number): string {
  if (seconds == null || Number.isNaN(seconds)) return "—";
  if (seconds < 60) return `há ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;
  return `há ${Math.floor(minutes / 60)} h`;
}

export default async function OnlineUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    source?: string;
    page?: string;
    period?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const params = await searchParams;
  const source = params?.source?.trim() || "all";
  const page = Math.max(0, (Number(params?.page ?? "1") || 1) - 1);
  const { period, from, to } = resolveVisitorPeriodFromParams(params ?? {});

  const data = await adminFetch<OnlineUsersResponse>("users/online", {
    source: source !== "all" ? source : undefined,
    page: page + 1,
    size: PAGE_SIZE,
    period: period !== "custom" ? period : undefined,
    from,
    to,
  });

  const summary = data?.summary ?? { total: 0, web: 0, app: 0, unknown: 0 };
  const visitors = data?.visitors ?? {
    online: 0,
    today: 0,
    yesterday: 0,
    last_7_days: 0,
    total: 0,
  };
  const periodTotal = visitors.total ?? visitors.last_7_days ?? 0;
  const users = data?.content ?? [];
  const windowMinutes = Math.round((data?.window_seconds ?? 300) / 60);
  const totalPages = Math.max(1, data?.total_pages ?? 1);
  const currentPage = (data?.page ?? 0) + 1;
  const rangeLabel = visitorPeriodCardLabel(period, from, to);

  return (
    <div>
      <PageHeader
        title="Presença no site"
        subtitle={`Contas com sessão + visitantes (incl. anónimos) · últimos ${windowMinutes} min`}
        actions={
          <Link href="/users" className="kumbu-btn-ghost">
            Ver todas as contas
          </Link>
        }
      />

      <section className="mb-6">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-kumbu-ink">Visitantes (com ou sem login)</h2>
        </div>

        <VisitorPeriodFilter period={period} from={from} to={to} source={source} />

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard label="No site agora" value={visitors.online} icon={Eye} href={buildPresenceLink({ source, period, from, to })} tone="sky" />
          <SummaryCard
            label={rangeLabel}
            value={periodTotal}
            icon={Activity}
            href={buildPresenceLink({ source, period, from, to })}
            tone="rose"
            active
          />
          <SummaryCard
            label="Hoje"
            value={visitors.today}
            icon={Users}
            href={buildPresenceLink({ source, period: "day" })}
            tone="rose"
            active={period === "day" && !from && !to}
          />
          <SummaryCard
            label="Ontem"
            value={visitors.yesterday}
            icon={Users}
            href={buildPresenceLink({ source, period, from, to })}
            tone="slate"
          />
          <SummaryCard
            label="Últimos 7 dias"
            value={visitors.last_7_days}
            icon={Activity}
            href={buildPresenceLink({ source, period: "week" })}
            tone="violet"
            active={period === "week" && !from && !to}
          />
        </div>
        {visitors.days && visitors.days.length > 0 ? (
          <VisitorDaysChart
            days={visitors.days}
            granularity={visitors.granularity}
            subtitle={
              visitors.granularity === "hour"
                ? "Cada barra = visitantes únicos nessa hora (UTC)"
                : visitors.from && visitors.to
                  ? `${visitors.from} → ${visitors.to}`
                  : rangeLabel
            }
          />
        ) : null}
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-kumbu-ink">Contas com sessão online</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total online"
            value={summary.total}
            icon={Activity}
            href={buildPresenceLink({ source: "all", period, from, to })}
            active={source === "all"}
          />
          <SummaryCard
            label="No site (logados)"
            value={summary.web}
            icon={Globe}
            href={buildPresenceLink({ source: "web", period, from, to })}
            active={source === "web"}
            tone="sky"
          />
          <SummaryCard
            label="Na app"
            value={summary.app}
            icon={Smartphone}
            href={buildPresenceLink({ source: "app", period, from, to })}
            active={source === "app"}
            tone="violet"
          />
          <SummaryCard
            label="Origem desconhecida"
            value={summary.unknown}
            icon={HelpCircle}
            href={buildPresenceLink({ source: "unknown", period, from, to })}
            active={source === "unknown"}
            tone="slate"
          />
        </div>
      </section>

      {users.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Nenhuma conta online neste filtro"
          description="Contas aparecem aqui com heartbeat de presença. Os visitantes anónimos contam só nos cartões acima."
        />
      ) : (
        <div className="kumbu-card overflow-x-auto">
          <table className="kumbu-table">
            <thead>
              <tr>
                <th>Utilizador</th>
                <th>Canal actual</th>
                <th>Última actividade</th>
                <th>Há quanto tempo</th>
                <th aria-label="acções" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="relative">
                        <Avatar
                          src={u.photo_url}
                          name={u.display_name}
                          email={u.email}
                          size={36}
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                      </span>
                      <div>
                        <p className="font-semibold text-kumbu-ink">
                          {u.display_name?.trim() || u.email || "Sem nome"}
                        </p>
                        <p className="text-xs text-slate-500">{u.email ?? "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <ClientSourceBadge source={u.last_active_source} />
                  </td>
                  <td className="text-sm">
                    {u.last_seen_at ? formatDateTime(u.last_seen_at) : "—"}
                  </td>
                  <td className="text-sm font-medium text-emerald-700">
                    {formatLastSeen(u.seconds_since_last_seen)}
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/users/${u.id}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-kumbu-red hover:underline"
                    >
                      Perfil <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-slate-500">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {currentPage > 1 && (
              <Link
                href={buildPresenceLink({ source, period, from, to, page: currentPage - 1 })}
                className="kumbu-btn-ghost"
              >
                Anterior
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={buildPresenceLink({ source, period, from, to, page: currentPage + 1 })}
                className="kumbu-btn-primary"
              >
                Seguinte
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function buildPresenceLink(opts: {
  source?: string;
  period?: string;
  from?: string;
  to?: string;
  page?: number;
}) {
  const sp = new URLSearchParams();
  if (opts.source && opts.source !== "all") sp.set("source", opts.source);
  if (opts.period && opts.period !== "week") sp.set("period", opts.period);
  if (opts.from) sp.set("from", opts.from);
  if (opts.to) sp.set("to", opts.to);
  if (opts.page && opts.page > 1) sp.set("page", String(opts.page));
  const q = sp.toString();
  return q ? `/users/online?${q}` : "/users/online";
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  href,
  active,
  tone = "rose",
}: {
  label: string;
  value: number;
  icon: typeof Activity;
  href: string;
  active?: boolean;
  tone?: "rose" | "sky" | "violet" | "slate";
}) {
  const tones = {
    rose: "border-kumbu-red/30 bg-rose-50/70",
    sky: "border-sky-200 bg-sky-50/70",
    violet: "border-violet-200 bg-violet-50/70",
    slate: "border-slate-200 bg-slate-50",
  } as const;

  return (
    <Link
      href={href}
      className={`kumbu-card block p-4 transition hover:shadow-md ${active ? "ring-2 ring-kumbu-red/40" : ""} ${tones[tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-kumbu-ink">{value}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl2 bg-white/80 text-kumbu-red shadow-sm">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
}
