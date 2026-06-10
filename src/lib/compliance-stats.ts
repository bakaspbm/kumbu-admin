import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";

export async function getPendingReportsCount(): Promise<number> {
  try {
    const overview = await kumbuApiFetch<{ pending_reports_count?: number }>(
      "/admin/system/dashboard-overview",
      { method: "GET" },
      { withAuth: true },
    );
    return overview.pending_reports_count ?? 0;
  } catch {
    return 0;
  }
}
