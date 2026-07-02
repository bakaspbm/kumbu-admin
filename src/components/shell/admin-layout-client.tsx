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
    let refreshInFlight: Promise<boolean> | null = null;

    async function keepSessionAlive(): Promise<boolean> {
      if (refreshInFlight) return refreshInFlight;
      refreshInFlight = (async () => {
        try {
          const response = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include",
            cache: "no-store",
          });
          return response.ok;
        } catch {
          return false;
        } finally {
          refreshInFlight = null;
        }
      })();
      return refreshInFlight;
    }

    const interval = window.setInterval(() => {
      void keepSessionAlive();
    }, 10 * 60 * 1000);

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      void keepSessionAlive().then((ok) => {
        if (ok) router.refresh();
      });
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  return (
    <AdminShell
      session={session}
      pendingReportsCount={queueCounts.pendingReports}
      waitingSupportCount={queueCounts.waitingSupport}
      pendingIdentityCount={queueCounts.pendingIdentity}
      pendingApplicationsCount={queueCounts.pendingApplications}
      pendingRentalsCount={queueCounts.pendingRentals}
      monetizationGateReview={queueCounts.monetizationGateReview}
    >
      {children}
    </AdminShell>
  );
}
