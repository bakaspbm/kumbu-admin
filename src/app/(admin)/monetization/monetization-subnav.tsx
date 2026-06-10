import Link from "next/link";

const links = [
  { href: "/monetization", label: "Overview" },
  { href: "/monetization/products", label: "Planos premium" },
  { href: "/monetization/categories", label: "Categorias" },
  { href: "/monetization/settings", label: "Definições" },
];

export function MonetizationSubNav({ active }: { active: string }) {
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
