import type { SupabaseClient } from "@supabase/supabase-js";
import {
  bucketKey,
  fillBuckets,
  periodStart,
  type AnalyticsPeriod,
} from "@/lib/analytics-period";

export type ChartSeries = { bucket: string; total: number }[];

export type Demographics = {
  total_users: number;
  deleted_users: number;
  avg_age: number | null;
  gender: Record<string, number>;
  cities: { name: string; count: number }[];
  countries: { name: string; count: number }[];
};

export type AnalyticsSnapshot = {
  period: AnalyticsPeriod;
  userSignups: ChartSeries;
  userDeletions: ChartSeries;
  productCreated: ChartSeries;
  productDeleted: ChartSeries;
  demographics: Demographics;
  rpcAvailable: boolean;
};

async function fetchSeriesRpc(
  supabase: SupabaseClient,
  period: AnalyticsPeriod,
  metric: string
): Promise<ChartSeries | null> {
  const { data, error } = await supabase.rpc("admin_analytics_series", {
    p_period: period,
    p_metric: metric,
  });
  if (error || !data) return null;
  const rows = data as { bucket: string; total: number }[];
  return fillBuckets(period, rows.map((r) => ({ bucket: r.bucket, total: Number(r.total) })));
}

async function fetchDemographicsRpc(
  supabase: SupabaseClient
): Promise<Demographics | null> {
  const { data, error } = await supabase.rpc("admin_analytics_demographics");
  if (error || !data) return null;
  const raw = data as Demographics;
  return {
    total_users: Number(raw.total_users ?? 0),
    deleted_users: Number(raw.deleted_users ?? 0),
    avg_age: raw.avg_age != null ? Number(raw.avg_age) : null,
    gender: (raw.gender as Record<string, number>) ?? {},
    cities: (raw.cities as { name: string; count: number }[]) ?? [],
    countries: (raw.countries as { name: string; count: number }[]) ?? [],
  };
}

function aggregateByBucket(
  dates: (string | null)[],
  period: AnalyticsPeriod
): ChartSeries {
  const start = periodStart(period);
  const map = new Map<string, number>();
  for (const iso of dates) {
    if (!iso) continue;
    const d = new Date(iso);
    if (d < start) continue;
    const key = bucketKey(d, period);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return fillBuckets(
    period,
    [...map.entries()].map(([bucket, total]) => ({ bucket, total }))
  );
}

async function fetchSeriesFallback(
  supabase: SupabaseClient,
  period: AnalyticsPeriod
): Promise<Pick<AnalyticsSnapshot, "userSignups" | "userDeletions" | "productCreated" | "productDeleted">> {
  const since = periodStart(period).toISOString();

  const [usersRes, deletionsRes, productsRes] = await Promise.all([
    supabase
      .from("users")
      .select("created_at, deleted_at")
      .gte("created_at", since),
    supabase
      .from("user_deletion_events")
      .select("deleted_at")
      .gte("deleted_at", since)
      .then(async (r) => {
        if (r.error) return { data: [] as { deleted_at: string }[] };
        return r;
      }),
    supabase
      .from("catalog_products")
      .select("created_at, deleted_at")
      .gte("created_at", since),
  ]);

  const users = usersRes.data ?? [];
  const softDeleted = users
    .filter((u) => u.deleted_at)
    .map((u) => u.deleted_at as string);
  const deletionEvents = (deletionsRes.data ?? []).map((d) => d.deleted_at);
  const products = productsRes.data ?? [];

  return {
    userSignups: aggregateByBucket(
      users.filter((u) => !u.deleted_at).map((u) => u.created_at),
      period
    ),
    userDeletions: aggregateByBucket(
      [...softDeleted, ...deletionEvents],
      period
    ),
    productCreated: aggregateByBucket(
      products.filter((p) => !p.deleted_at).map((p) => p.created_at),
      period
    ),
    productDeleted: aggregateByBucket(
      products.filter((p) => p.deleted_at).map((p) => p.deleted_at as string),
      period
    ),
  };
}

async function fetchDemographicsFallback(
  supabase: SupabaseClient
): Promise<Demographics> {
  const { data: users } = await supabase
    .from("users")
    .select(
      "gender, birth_date, city, country, deleted_at, delivery_address, created_at"
    );

  const rows = users ?? [];
  const active = rows.filter((u) => !u.deleted_at);
  const deleted = rows.filter((u) => u.deleted_at).length;

  const gender: Record<string, number> = {};
  const cityMap = new Map<string, number>();
  const countryMap = new Map<string, number>();
  const ages: number[] = [];

  for (const u of active) {
    const g = (u.gender as string | null)?.trim() || "Não indicado";
    gender[g] = (gender[g] ?? 0) + 1;

    const addr = u.delivery_address as Record<string, unknown> | null;
    const city =
      (u.city as string | null)?.trim() ||
      String(addr?.city ?? addr?.locality ?? "").trim() ||
      "Sem cidade";
    const country =
      (u.country as string | null)?.trim() ||
      String(addr?.country ?? "").trim() ||
      "Sem país";
    cityMap.set(city, (cityMap.get(city) ?? 0) + 1);
    countryMap.set(country, (countryMap.get(country) ?? 0) + 1);

    if (u.birth_date) {
      const birth = new Date(u.birth_date as string);
      const age = new Date().getFullYear() - birth.getFullYear();
      if (!Number.isNaN(age) && age > 0 && age < 120) ages.push(age);
    }
  }

  const top = (m: Map<string, number>) =>
    [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

  return {
    total_users: active.length,
    deleted_users: deleted,
    avg_age: ages.length
      ? Math.round((ages.reduce((a, b) => a + b, 0) / ages.length) * 10) / 10
      : null,
    gender,
    cities: top(cityMap),
    countries: top(countryMap),
  };
}

export async function getAnalyticsSnapshot(
  supabase: SupabaseClient,
  period: AnalyticsPeriod
): Promise<AnalyticsSnapshot> {
  const [signups, deletions, created, deleted, demo] = await Promise.all([
    fetchSeriesRpc(supabase, period, "user_signups"),
    fetchSeriesRpc(supabase, period, "user_deletions"),
    fetchSeriesRpc(supabase, period, "product_created"),
    fetchSeriesRpc(supabase, period, "product_deleted"),
    fetchDemographicsRpc(supabase),
  ]);

  const rpcAvailable = signups !== null;

  if (rpcAvailable && signups && deletions && created && deleted && demo) {
    return {
      period,
      userSignups: signups,
      userDeletions: deletions,
      productCreated: created,
      productDeleted: deleted,
      demographics: demo,
      rpcAvailable: true,
    };
  }

  const fallback = await fetchSeriesFallback(supabase, period);
  const demographics = await fetchDemographicsFallback(supabase);

  return {
    period,
    ...fallback,
    demographics,
    rpcAvailable: false,
  };
}
