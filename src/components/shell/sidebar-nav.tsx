"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminRole } from "@/lib/auth";
import {
  LayoutDashboard,
  LayoutGrid,
  BarChart3,
  Users,
  ShoppingBag,
  Package,
  Tags,
  Megaphone,
  MessageCircle,
  LifeBuoy,
  CreditCard,
  Filter,
  Bell,
  ShieldCheck,
  ListChecks,
  Settings,
  Flag,
  FileCheck,
  Scale,
  Star,
  Coins,
  Inbox,
  Briefcase,
  CalendarClock,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SUPER_NAV = [
  { href: "/control", label: "Controlo total", icon: LayoutGrid },
];

type NavItem = {
  href: string;
  label: string;
  icon: typeof Users;
  badgeCount?: number;
};

const MARKETPLACE_NAV: NavItem[] = [
  { href: "/reports", label: "Denúncias", icon: Flag },
  { href: "/users", label: "Utilizadores C2C", icon: Users },
  { href: "/identity", label: "Identidade (KYC)", icon: BadgeCheck },
  { href: "/products", label: "Anúncios à venda", icon: Package },
  { href: "/jobs", label: "Vagas de emprego", icon: Briefcase },
  { href: "/jobs/applications", label: "Candidaturas", icon: FileCheck },
  { href: "/rentals", label: "Reservas imóveis", icon: CalendarClock },
  { href: "/reviews", label: "Avaliações", icon: Star },
  { href: "/orders", label: "Transações", icon: ShoppingBag },
  { href: "/conversations", label: "Conversas", icon: MessageCircle },
  { href: "/consents", label: "Consentimentos", icon: FileCheck },
];

const MODERATION_NAV: NavItem[] = [{ href: "/legal", label: "Textos legais", icon: Scale }];

const PLATFORM_NAV: NavItem[] = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/monetization", label: "Monetização", icon: Coins },
  { href: "/analytics", label: "Estatísticas", icon: BarChart3 },
  { href: "/categories", label: "Categorias", icon: Tags },
  { href: "/marketing", label: "Banners da app", icon: Megaphone },
  { href: "/support/inbox", label: "Fila de suporte", icon: Inbox },
  { href: "/support", label: "FAQ suporte", icon: LifeBuoy },
  { href: "/payment-methods", label: "Pagamentos", icon: CreditCard },
  { href: "/filters", label: "Filtros", icon: Filter },
  { href: "/notifications", label: "Notificações", icon: Bell },
  { href: "/admins", label: "Administradores", icon: ShieldCheck },
  { href: "/audit", label: "Auditoria", icon: ListChecks },
  { href: "/settings", label: "Definições", icon: Settings },
];

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function NavSection({
  title,
  items,
  pathname,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <>
      <p className="mb-2 mt-4 px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--kumbu-ink-subtle)] first:mt-0">
        {title}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                data-active={active ? "true" : "false"}
                className="group kumbu-nav-link"
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    active
                      ? "text-kumbu-red"
                      : "text-[var(--kumbu-ink-subtle)] group-hover:text-[var(--kumbu-ink-muted)]",
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {item.badgeCount != null && item.badgeCount > 0 ? (
                  <NavBadge count={item.badgeCount} />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function SidebarNav({
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
  const pathname = usePathname();
  const marketplaceNav = MARKETPLACE_NAV.map((item) => {
    if (item.href === "/reports") return { ...item, badgeCount: pendingReportsCount };
    if (item.href === "/identity") return { ...item, badgeCount: pendingIdentityCount };
    if (item.href === "/jobs/applications") return { ...item, badgeCount: pendingApplicationsCount };
    if (item.href === "/rentals") return { ...item, badgeCount: pendingRentalsCount };
    return item;
  });
  const platformNav = PLATFORM_NAV.map((item) => {
    if (item.href === "/support/inbox") return { ...item, badgeCount: waitingSupportCount };
    if (item.href === "/monetization") return { ...item, badgeCount: monetizationGateReview };
    return item;
  });

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {role === "super_admin" && (
        <>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-kumbu-red">
            Super Admin
          </p>
          <ul className="space-y-0.5">
            {SUPER_NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              const badge = item.href === "/control" ? monetizationGateReview : 0;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    data-active={active ? "true" : "false"}
                    className="kumbu-nav-link"
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active ? "text-kumbu-red" : "text-[var(--kumbu-ink-subtle)]",
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {badge > 0 ? <NavBadge count={badge} /> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <NavSection title="Marketplace" items={marketplaceNav} pathname={pathname} />
      <NavSection title="Moderação" items={MODERATION_NAV} pathname={pathname} />
      <NavSection title="Plataforma" items={platformNav} pathname={pathname} />
    </nav>
  );
}
