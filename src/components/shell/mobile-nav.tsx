"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/orders", label: "Pedidos", icon: ShoppingBag },
  { href: "/products", label: "Produtos", icon: Package },
  { href: "/reports", label: "Denúnc.", icon: Flag },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-100 shadow-pop">
      <ul className="grid grid-cols-5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 text-[11px]",
                  active ? "text-kumbu-red" : "text-slate-500"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
