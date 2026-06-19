"use client";

import type { AdminSession } from "@/lib/auth";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { MobileNav } from "@/components/shell/mobile-nav";

export function AdminShell({
  session,
  pendingReportsCount = 0,
  waitingSupportCount = 0,
  pendingIdentityCount = 0,
  pendingApplicationsCount = 0,
  pendingRentalsCount = 0,
  monetizationGateReview = 0,
  children,
}: {
  session: AdminSession;
  pendingReportsCount?: number;
  waitingSupportCount?: number;
  pendingIdentityCount?: number;
  pendingApplicationsCount?: number;
  pendingRentalsCount?: number;
  monetizationGateReview?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar
        role={session.role}
        pendingReportsCount={pendingReportsCount}
        waitingSupportCount={waitingSupportCount}
        pendingIdentityCount={pendingIdentityCount}
        pendingApplicationsCount={pendingApplicationsCount}
        pendingRentalsCount={pendingRentalsCount}
        monetizationGateReview={monetizationGateReview}
      />
      <div className="flex flex-1 min-w-0 flex-col">
        <Topbar session={session} />
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
