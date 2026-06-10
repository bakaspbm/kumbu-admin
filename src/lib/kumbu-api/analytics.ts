import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";

export const analyticsApi = {
  snapshot(period?: string) {
    const qs = period ? `?period=${encodeURIComponent(period)}` : "";
    return kumbuApiFetch<{ items?: Record<string, unknown>[] }>(
      `/admin/system/analytics/snapshot${qs}`,
      { method: "GET" },
      { withAuth: true },
    );
  },
  rankings(limit = 10) {
    return kumbuApiFetch<{ items?: Record<string, unknown>[] }>(
      `/admin/system/analytics/rankings?limit=${limit}`,
      { method: "GET" },
      { withAuth: true },
    );
  },
};
