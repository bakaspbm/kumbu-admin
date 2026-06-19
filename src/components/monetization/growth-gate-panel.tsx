import Link from "next/link";
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

type GateData = Record<string, unknown>;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function MetricRow({
  label,
  current,
  min,
  max,
  ok,
  progressPct,
}: {
  label: string;
  current: number;
  min: number;
  max: number;
  ok: boolean;
  progressPct: number;
}) {
  const pct = Math.min(100, Math.max(0, progressPct));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className={ok ? "font-bold text-emerald-600" : "font-bold text-slate-800"}>
          {current}
          <span className="font-normal text-slate-500">
            {" "}
            / meta {min}–{max}
          </span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${ok ? "bg-emerald-500" : "bg-kumbu-red"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function GrowthGatePanel({ gate, compact = false }: { gate: GateData; compact?: boolean }) {
  const checks = asRecord(gate.checks);
  const requirements = asRecord(gate.requirements);
  const metrics = asRecord(gate.metrics);
  const gateReady = Boolean(gate.gate_ready);
  const chargingEnabled = Boolean(gate.charging_enabled);
  const needsReview = Boolean(gate.needs_superadmin_review);

  const dau = Number(checks.dau_current ?? metrics.dau ?? 0);
  const listings = Number(checks.listings_current ?? metrics.active_listings ?? 0);
  const chats = Number(checks.chats_current ?? metrics.chats_today ?? 0);

  const minDau = Number(requirements.min_dau ?? 200);
  const maxDau = Number(requirements.max_dau ?? 300);
  const minListings = Number(requirements.min_listings ?? 300);
  const maxListings = Number(requirements.max_listings ?? 500);
  const minChats = Number(requirements.min_chats_per_day ?? 30);
  const maxChats = Number(requirements.max_chats_per_day ?? 50);

  return (
    <section className={`kumbu-card ${compact ? "p-4" : "p-5"} space-y-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <p className="kumbu-label">Crescimento · Monetização</p>
            <h3 className="text-base font-semibold">Gatilhos para começar a cobrar</h3>
            <p className="mt-1 text-sm text-slate-500">
              {String(
                gate.policy ??
                  "Sem limites de anúncios enquanto a cobrança estiver desactivada.",
              )}
            </p>
          </div>
        </div>
        {needsReview ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
            <AlertTriangle className="h-3.5 w-3.5" />
            Analisar monetização
          </span>
        ) : gateReady && chargingEnabled ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Cobrança activa
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            A crescer — não cobrar ainda
          </span>
        )}
      </div>

      <div className="space-y-4">
        <MetricRow
          label="Utilizadores activos hoje (DAU)"
          current={dau}
          min={minDau}
          max={maxDau}
          ok={Boolean(checks.dau_ok)}
          progressPct={Number(checks.dau_progress_pct ?? 0)}
        />
        <MetricRow
          label="Anúncios activos"
          current={listings}
          min={minListings}
          max={maxListings}
          ok={Boolean(checks.listings_ok)}
          progressPct={Number(checks.listings_progress_pct ?? 0)}
        />
        <MetricRow
          label="Chats hoje"
          current={chats}
          min={minChats}
          max={maxChats}
          ok={Boolean(checks.chats_ok)}
          progressPct={Number(checks.chats_progress_pct ?? 0)}
        />
      </div>

      {needsReview ? (
        <div className="kumbu-panel-warning px-4 py-3 text-sm">
          <p className="kumbu-panel-title font-semibold">Métricas mínimas atingidas</p>
          <p className="kumbu-panel-label mt-1">
            {String(
              gate.recommendation ??
                "Revise volume, qualidade e suporte antes de activar cobrança e limites VIP.",
            )}
          </p>
          {gate.alert_sent_at ? (
            <p className="kumbu-panel-label mt-2 text-xs opacity-90">
              Superadmin notificado em {String(gate.alert_sent_at)}
            </p>
          ) : null}
          <Link
            href="/monetization"
            className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-kumbu-red hover:underline"
          >
            Ir para Monetização →
          </Link>
        </div>
      ) : (
        <p className="text-sm text-slate-500">{String(gate.message ?? "")}</p>
      )}
    </section>
  );
}
