import Link from "next/link";

const links = [
  { href: "/support/inbox", label: "Fila de chat" },
  { href: "/support", label: "FAQ e bot" },
];

export function SupportSubNav({ active }: { active: string }) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2">
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
