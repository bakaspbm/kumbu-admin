"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import type { AdminSession } from "@/lib/auth";

const ROLE_LABEL: Record<AdminSession["role"], string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  support: "Suporte",
};

export function Topbar({ session }: { session: AdminSession }) {
  return (
    <header className="kumbu-shell-topbar sticky top-0 z-30 border-b supports-[backdrop-filter]:bg-transparent">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.55)] lg:inline-block" />
          <p className="truncate text-sm font-semibold tracking-tight">
            Console Kumbu
          </p>
          <span className="hidden text-xs text-[var(--kumbu-ink-subtle)] sm:inline">
            · ambiente em produção
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle compact />
          <div className="hidden h-8 w-px bg-[var(--kumbu-border)] sm:block" aria-hidden />
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight">
              {session.email}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-[var(--kumbu-ink-subtle)]">
              {ROLE_LABEL[session.role]}
            </p>
          </div>
          <Avatar email={session.email} size={36} />
          <form action={logoutAction}>
            <button
              type="submit"
              className="kumbu-btn-ghost"
              aria-label="Terminar sessão"
              title="Terminar sessão"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
