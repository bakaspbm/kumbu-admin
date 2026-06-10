import Link from "next/link";

const links = [
  { href: "/jobs", label: "Vagas publicadas" },
  { href: "/jobs/applications", label: "Candidaturas" },
];

export function JobsSubNav({ active }: { active: string }) {
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
