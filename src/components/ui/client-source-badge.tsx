import { Globe, HelpCircle, Smartphone } from "lucide-react";
import type { ClientSource } from "@/lib/types";
import { cn } from "@/lib/utils";

const LABELS: Record<ClientSource, string> = {
  app: "Telemóvel (app)",
  web: "Site",
  unknown: "Desconhecido",
};

export function clientSourceLabel(source: ClientSource | string | null | undefined): string {
  if (source === "app" || source === "web" || source === "unknown") return LABELS[source];
  return LABELS.unknown;
}

export function ClientSourceBadge({
  source,
  className,
}: {
  source: ClientSource | string | null | undefined;
  className?: string;
}) {
  const normalized: ClientSource =
    source === "app" || source === "web" ? source : "unknown";
  const Icon = normalized === "app" ? Smartphone : normalized === "web" ? Globe : HelpCircle;
  const tone =
    normalized === "app"
      ? "bg-violet-100 text-violet-800"
      : normalized === "web"
        ? "bg-sky-100 text-sky-800"
        : "bg-slate-100 text-slate-600";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        tone,
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden />
      {LABELS[normalized]}
    </span>
  );
}
