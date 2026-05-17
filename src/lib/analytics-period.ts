export type AnalyticsPeriod = "day" | "week" | "month" | "year";

export const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  day: "Dia",
  week: "Semana",
  month: "Mês",
  year: "Ano",
};

export function parseAnalyticsPeriod(value: string | undefined): AnalyticsPeriod {
  if (value === "week" || value === "month" || value === "year") return value;
  return "day";
}

export function periodStart(period: AnalyticsPeriod): Date {
  const now = new Date();
  switch (period) {
    case "week":
      return new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
    case "month":
      return new Date(now.getFullYear(), now.getMonth() - 11, 1);
    case "year":
      return new Date(now.getFullYear() - 4, 0, 1);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

export function bucketKey(date: Date, period: AnalyticsPeriod): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  if (period === "year") return String(y);
  if (period === "month") return `${y}-${m}`;
  if (period === "week") {
    const tmp = new Date(date);
    const day = tmp.getDay() || 7;
    tmp.setDate(tmp.getDate() - day + 1);
    return tmp.toISOString().slice(0, 10);
  }
  return `${y}-${m}-${d}`;
}

export function fillBuckets(
  period: AnalyticsPeriod,
  points: { bucket: string; total: number }[]
): { bucket: string; total: number }[] {
  const map = new Map(points.map((p) => [p.bucket, p.total]));
  const start = periodStart(period);
  const end = new Date();
  const buckets: string[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    buckets.push(bucketKey(cursor, period));
    if (period === "year") cursor.setFullYear(cursor.getFullYear() + 1);
    else if (period === "month") cursor.setMonth(cursor.getMonth() + 1);
    else if (period === "week") cursor.setDate(cursor.getDate() + 7);
    else cursor.setDate(cursor.getDate() + 1);
  }

  const unique = [...new Set(buckets)];
  return unique.map((bucket) => ({
    bucket,
    total: map.get(bucket) ?? 0,
  }));
}
