"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PERIOD_LABELS, type AnalyticsPeriod } from "@/lib/analytics-period";

export function PeriodFilter({ period }: { period: AnalyticsPeriod }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(PERIOD_LABELS) as AnalyticsPeriod[]).map((key) => (
        <Link
          key={key}
          href={`${pathname}?period=${key}`}
          className={cn(
            "rounded-chip px-4 py-2 text-sm font-semibold transition",
            period === key
              ? "bg-kumbu-red text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:border-kumbu-red hover:text-kumbu-red"
          )}
        >
          {PERIOD_LABELS[key]}
        </Link>
      ))}
    </div>
  );
}

