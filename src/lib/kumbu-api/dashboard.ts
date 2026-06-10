import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";

export const dashboardApi = {
  overview() {
    return kumbuApiFetch<Record<string, unknown>>(
      "/admin/system/dashboard-overview",
      { method: "GET" },
      { withAuth: true },
    );
  },
};

