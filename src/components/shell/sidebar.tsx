"use client";

import Link from "next/link";
import { SidebarNav } from "@/components/shell/sidebar-nav";

import type { AdminRole } from "@/lib/auth";

export function Sidebar({
  role,
  pendingReportsCount = 0,
  waitingSupportCount = 0,
  pendingIdentityCount = 0,
  pendingApplicationsCount = 0,
  pendingRentalsCount = 0,
}: {
  role?: AdminRole;
  pendingReportsCount?: number;
  waitingSupportCount?: number;
  pendingIdentityCount?: number;
  pendingApplicationsCount?: number;
  pendingRentalsCount?: number;
}) {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white border-r border-slate-100">
      <div className="px-6 py-6 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl2 bg-kumbu-gradient text-white font-bold">
            K
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight">Kumbu</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              Super Admin
            </p>
          </div>
        </Link>
      </div>
      <SidebarNav
        role={role}
        pendingReportsCount={pendingReportsCount}
        waitingSupportCount={waitingSupportCount}
        pendingIdentityCount={pendingIdentityCount}
        pendingApplicationsCount={pendingApplicationsCount}
        pendingRentalsCount={pendingRentalsCount}
      />
      <div className="border-t border-slate-100 px-4 py-3 text-[11px] text-slate-400">
        © 2026 Kumbu. Todos os direitos reservados.
      </div>
    </aside>
  );
}
