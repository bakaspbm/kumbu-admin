import { requireAdmin } from "@/lib/auth";
import { getAdminQueueCounts } from "@/lib/admin-queue-stats";
import { getPendingReportsCount } from "@/lib/compliance-stats";import { AdminLayoutClient } from "@/components/shell/admin-layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const pendingReportsCount = await getPendingReportsCount();
  const queueCounts = await getAdminQueueCounts(pendingReportsCount);

  return (
    <AdminLayoutClient session={session} queueCounts={queueCounts}>
      {children}
    </AdminLayoutClient>
  );
}
