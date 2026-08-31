export type VisitorPeriod = "day" | "week" | "month" | "year" | "all" | "custom";

export const VISITOR_PERIOD_LABELS: Record<Exclude<VisitorPeriod, "custom">, string> = {
  day: "Hoje",
  week: "7 dias",
  month: "Mês",
  year: "Ano",
  all: "Todo o tempo",
};

export function parseVisitorPeriod(value: string | undefined): VisitorPeriod {
  if (value === "day" || value === "month" || value === "year" || value === "all" || value === "custom") {
    return value;
  }
  return "week";
}

export function resolveVisitorPeriodFromParams(params: {
  period?: string;
  from?: string;
  to?: string;
}): { period: VisitorPeriod; from?: string; to?: string } {
  const from = params.from?.trim() || undefined;
  const to = params.to?.trim() || undefined;
  if (from || to) {
    return { period: "custom", from, to };
  }
  return { period: parseVisitorPeriod(params.period), from, to };
}

export function visitorPeriodCardLabel(period: VisitorPeriod, from?: string, to?: string): string {
  if (period === "custom" || from || to) {
    if (from && to) return `${from} → ${to}`;
    if (from) return `Desde ${from}`;
    if (to) return `Até ${to}`;
    return "Período personalizado";
  }
  switch (period) {
    case "day":
      return "Hoje (únicos)";
    case "month":
      return "Este mês (únicos)";
    case "year":
      return "Este ano (únicos)";
    case "all":
      return "Todo o tempo (únicos)";
    default:
      return "Últimos 7 dias (únicos)";
  }
}
