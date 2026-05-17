"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Tags,
  Megaphone,
  LifeBuoy,
  CreditCard,
  Filter,
  Bell,
  ShieldCheck,
  ListChecks,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/users", label: "Utilizadores", icon: Users },
  { href: "/orders", label: "Pedidos", icon: ShoppingBag },
  { href: "/products", label: "Produtos", icon: Package },
  { href: "/categories", label: "Categorias", icon: Tags },
  { href: "/marketing", label: "Marketing", icon: Megaphone },
  { href: "/support", label: "Suporte", icon: LifeBuoy },
  { href: "/payment-methods", label: "Pagamentos", icon: CreditCard },
  { href: "/filters", label: "Filtros", icon: Filter },
  { href: "/notifications", label: "Notificações", icon: Bell },
  { href: "/admins", label: "Administradores", icon: ShieldCheck },
  { href: "/audit", label: "Auditoria", icon: ListChecks },
  { href: "/settings", label: "Definições", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

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
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-chip px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-kumbu-red-soft text-kumbu-red"
                      : "text-slate-600 hover:bg-slate-50 hover:text-kumbu-ink"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-kumbu-red" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-slate-100 px-4 py-3 text-[11px] text-slate-400">
        © {new Date().getFullYear()} Kumbu. Todos os direitos reservados.
      </div>
    </aside>
  );
}
