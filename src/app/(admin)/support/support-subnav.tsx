import Link from "next/link";
import { cn } from "@/lib/utils";

const links = [
  { href: "/support/inbox", label: "Fila de chat" },
  { href: "/support/mailbox", label: "Caixa de email" },
  { href: "/support", label: "FAQ e bot" },
];

export function SupportSubNav({
  active,
  className,
}: {
  active: string;
  className?: string;
}) {
  return (
    <nav className={cn("mb-3 flex flex-wrap gap-2", className)}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={
            active === link.href
              ? "kumbu-btn-primary text-sm"
              : "kumbu-btn-secondary text-sm"
          }
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
