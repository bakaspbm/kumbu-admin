import type { LucideIcon } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "red",
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon?: LucideIcon;
  accent?: "red" | "purple" | "blue" | "green" | "amber";
}) {
  const accents: Record<string, string> = {
    red: "bg-rose-100 text-kumbu-red",
    purple: "bg-purple-100 text-kumbu-purple",
    blue: "bg-indigo-100 text-kumbu-blue",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <div className="kumbu-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kumbu-label">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-kumbu-ink">
            {typeof value === "number" ? formatNumber(value) : value}
          </p>
          {hint && <p className="mt-1 text-xs text-[var(--kumbu-ink-subtle)]">{hint}</p>}
        </div>
        {Icon && (
          <span
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-xl2",
              accents[accent]
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
    </div>
  );
}
