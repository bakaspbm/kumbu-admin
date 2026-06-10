import { supportInboxApi } from "@/lib/kumbu-api/support-inbox";
import { identityApi } from "@/lib/kumbu-api/identity";
import { jobsApi } from "@/lib/kumbu-api/jobs";
import { rentalsApi } from "@/lib/kumbu-api/rentals";

export type AdminQueueCounts = {
  pendingReports: number;
  waitingSupport: number;
  pendingIdentity: number;
  pendingApplications: number;
  pendingRentals: number;
};

export async function getAdminQueueCounts(
  pendingReportsFallback = 0,
): Promise<AdminQueueCounts> {
  const [support, identity, applications, rentals] = await Promise.all([
    supportInboxApi.waitingCount().catch(() => ({ count: 0 })),
    identityApi.pendingCount().catch(() => ({ count: 0 })),
    jobsApi.pendingApplicationsCount().catch(() => ({ count: 0 })),
    rentalsApi.pendingCount().catch(() => ({ count: 0 })),
  ]);

  return {
    pendingReports: pendingReportsFallback,
    waitingSupport: support.count ?? 0,
    pendingIdentity: identity.count ?? 0,
    pendingApplications: applications.count ?? 0,
    pendingRentals: rentals.count ?? 0,
  };
}
