"use client";

import Link from "next/link";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";

import type { AdminRole } from "@/lib/auth";

export function Sidebar({
  role,
  pendingReportsCount = 0,
  waitingSupportCount = 0,
  pendingIdentityCount = 0,
  pendingApplicationsCount = 0,
  pendingRentalsCount = 0,
  monetizationGateReview = 0,
}: {
  role?: AdminRole;
  pendingReportsCount?: number;
  waitingSupportCount?: number;
  pendingIdentityCount?: number;
  pendingApplicationsCount?: number;
  pendingRentalsCount?: number;
  monetizationGateReview?: number;
}) {
  return (
    <aside className="kumbu-shell-sidebar hidden w-64 shrink-0 flex-col border-r lg:flex">
      <div className="border-b border-[var(--kumbu-border)] px-6 py-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl2 bg-kumbu-gradient text-white font-bold shadow-[0_4px_14px_var(--kumbu-red-glow)]">
            K
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight">Kumbu</p>
            <p className="text-[10px] uppercase tracking-widest text-[var(--kumbu-ink-subtle)]">
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
        monetizationGateReview={monetizationGateReview}
      />
      <div className="space-y-3 border-t border-[var(--kumbu-border)] px-4 py-4">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--kumbu-ink-subtle)]">
          Aparência
        </p>
        <ThemeToggle className="w-full" />
        <p className="text-center text-[11px] text-[var(--kumbu-ink-subtle)]">
          © 2026 Kumbu. Todos os direitos reservados.
        </p>
      </div>
    </aside>
  );
}
