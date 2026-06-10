import Link from "next/link";
import { Scale } from "lucide-react";
import { adminList } from "@/lib/admin-data";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";
import { LEGAL_DEFAULTS } from "@/lib/legal-defaults";
import { SeedLegalButton } from "./seed-button";
import type { LegalDocument } from "@/lib/types";

export const dynamic = "force-dynamic";

const SITE_PATHS: Record<string, string> = {
  terms: "/termos",
  privacy: "/privacidade",
  cookies: "/cookies",
  how_it_works: "/como-funciona",
  publishing_rules: "/regras-publicacao",
};

export default async function LegalPage() {
  const rows = await adminList<Pick<LegalDocument, "slug" | "title" | "intro" | "updated_at">>("legal");
    return (
      <div className="space-y-6">
        <PageHeader
          title="Textos legais"
          subtitle="Edita termos, privacidade, cookies e regras — o site user lê da base de dados."
        />
        <div className="kumbu-card flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="font-semibold">Primeira configuração</p>
            <p className="text-sm text-slate-600">
              Importa os textos actuais do site para a base de dados, depois edita aqui.
            </p>
          </div>
          <SeedLegalButton />
        </div>
        {rows.length === 0 ? (
          <EmptyState
            icon={Scale}
            title="Nenhum documento na BD"
            description="Use «Importar textos por defeito» ou edite um slug abaixo."
          />
        ) : (
          <div className="kumbu-card overflow-hidden">
            <table className="kumbu-table">
              <thead>
                <tr><th>Slug</th><th>Título</th><th>Página no site</th><th>Actualizado</th><th /></tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.slug}>
                    <td className="font-mono text-xs">{row.slug}</td>
                    <td className="font-medium">{row.title}</td>
                    <td className="text-sm text-slate-500">{SITE_PATHS[row.slug] ?? "—"}</td>
                    <td className="text-sm text-slate-500">{formatDateTime(row.updated_at)}</td>
                    <td><Link href={`/legal/${row.slug}`} className="text-sm font-semibold text-kumbu-red hover:underline">Editar</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LEGAL_DEFAULTS.map((d) => (
            <Link key={d.slug} href={`/legal/${d.slug}`} className="kumbu-card block p-4 transition-shadow hover:shadow-md">
              <p className="font-bold">{d.title}</p>
              <p className="mt-1 text-xs text-slate-500">{d.slug}</p>
            </Link>
          ))}
        </div>
      </div>
    );
}