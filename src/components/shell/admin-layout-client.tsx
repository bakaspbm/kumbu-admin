"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AdminQueueCounts } from "@/lib/admin-queue-stats";
import type { AdminSession } from "@/lib/auth";
import { AdminShellSkeleton } from "@/components/shell/admin-shell-skeleton";
const AdminShell = dynamic(
  () =>
    import("@/components/shell/admin-shell").then((m) => ({
      default: m.AdminShell,
    })),
  { ssr: false, loading: () => <AdminShellSkeleton /> }
);

export function AdminLayoutClient({
  session,
  queueCounts,
  children,
}: {
  session: AdminSession;
  queueCounts: AdminQueueCounts;
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [router]);

  return (
    <AdminShell
      session={session}
      pendingReportsCount={queueCounts.pendingReports}
      waitingSupportCount={queueCounts.waitingSupport}
      pendingIdentityCount={queueCounts.pendingIdentity}
      pendingApplicationsCount={queueCounts.pendingApplications}
      pendingRentalsCount={queueCounts.pendingRentals}
    >
      {children}
    </AdminShell>
  );
}
