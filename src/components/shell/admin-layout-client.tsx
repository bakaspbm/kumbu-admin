"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import type { AdminQueueCounts } from "@/lib/admin-queue-stats";
import type { AdminSession } from "@/lib/auth";
import { bootstrapAdminBrowserAccessToken } from "@/lib/kumbu-api/admin-browser-session";
import { touchAdminPresence } from "@/lib/kumbu-api/presence";
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

    void keepSessionAlive();
    void bootstrapAdminBrowserAccessToken().then(() => {
      void touchAdminPresence().catch(() => {});
    });

    const interval = window.setInterval(() => {
      void keepSessionAlive();
    }, 25 * 60 * 1000);

    const presenceInterval = window.setInterval(() => {
      void touchAdminPresence().catch(() => {});
    }, 120_000);

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      void touchAdminPresence().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(interval);
      window.clearInterval(presenceInterval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <AdminShell
      session={session}
      pendingReportsCount={queueCounts.pendingReports}
      waitingSupportCount={queueCounts.waitingSupport}
      unreadMailboxCount={queueCounts.unreadMailbox}
      pendingIdentityCount={queueCounts.pendingIdentity}
      pendingApplicationsCount={queueCounts.pendingApplications}
      pendingRentalsCount={queueCounts.pendingRentals}
      monetizationGateReview={queueCounts.monetizationGateReview}
    >
      {children}
    </AdminShell>
  );
}
