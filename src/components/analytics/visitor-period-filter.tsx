"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  VISITOR_PERIOD_LABELS,
  type VisitorPeriod,
} from "@/lib/visitor-period";

function buildPresenceHref(opts: {
  source?: string;
  period?: VisitorPeriod;
  from?: string;
  to?: string;
  clearCustom?: boolean;
}) {
  const sp = new URLSearchParams();
  if (opts.source && opts.source !== "all") sp.set("source", opts.source);
  if (opts.period && opts.period !== "week") sp.set("period", opts.period);
  if (!opts.clearCustom) {
    if (opts.from) sp.set("from", opts.from);
    if (opts.to) sp.set("to", opts.to);
  }
  const q = sp.toString();
  return q ? `/users/online?${q}` : "/users/online";
}

export function VisitorPeriodFilter({
  period,
  from,
  to,
  source,
}: {
  period: VisitorPeriod;
  from?: string;
  to?: string;
  source?: string;
}) {
  const router = useRouter();
  const [customFrom, setCustomFrom] = useState(from ?? "");
  const [customTo, setCustomTo] = useState(to ?? "");

  const presetKeys = Object.keys(VISITOR_PERIOD_LABELS) as Array<
    keyof typeof VISITOR_PERIOD_LABELS
  >;

  function applyCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!customFrom && !customTo) return;
    router.push(
      buildPresenceHref({
        source,
        period: "custom",
        from: customFrom || undefined,
        to: customTo || undefined,
      })
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {presetKeys.map((key) => (
          <Link
            key={key}
            href={buildPresenceHref({ source, period: key, clearCustom: true })}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              period === key && !from && !to
                ? "bg-kumbu-red text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:border-kumbu-red hover:text-kumbu-red"
            )}
          >
            {VISITOR_PERIOD_LABELS[key]}
          </Link>
        ))}
      </div>

      <form
        onSubmit={applyCustom}
        className="flex flex-wrap items-end gap-2 rounded-2xl border border-slate-200 bg-white p-3"
      >
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          De
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-kumbu-ink"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500">
          Até
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-kumbu-ink"
          />
        </label>
        <button type="submit" className="kumbu-btn-primary text-sm">
          Aplicar período
        </button>
        {(from || to || period === "custom") && (
          <Link
            href={buildPresenceHref({ source, period: "week", clearCustom: true })}
            className="kumbu-btn-ghost text-sm"
          >
            Limpar datas
          </Link>
        )}
      </form>
    </div>
  );
}
