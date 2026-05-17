import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import { Avatar } from "@/components/ui/avatar";
import type { AdminSession } from "@/lib/auth";

const ROLE_LABEL: Record<AdminSession["role"], string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  support: "Suporte",
};

export function Topbar({ session }: { session: AdminSession }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="hidden h-2.5 w-2.5 rounded-full bg-emerald-500 lg:inline-block" />
          <p className="text-sm font-semibold tracking-tight">
            Console Kumbu
          </p>
          <span className="hidden text-xs text-slate-400 sm:inline">
            · ambiente em produção
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight">
              {session.email}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
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
