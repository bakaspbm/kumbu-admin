import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminGet } from "@/lib/admin-data";
import { PageHeader } from "@/components/ui/page-header";
import { getLegalDefault } from "@/lib/legal-defaults";
import { LegalEditorForm } from "../legal-editor-form";
import type { LegalDocument, LegalSection } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LegalEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fallback = getLegalDefault(slug);
  if (!fallback) notFound();
  const data = await adminGet<LegalDocument>("legal", slug);
    const doc: LegalDocument = data
      ? data
      : {
          slug: fallback.slug,
          title: fallback.title,
          intro: fallback.intro,
          sections: fallback.sections,
          updated_at: new Date().toISOString(),
          updated_by: null,
        };
    return (
      <div className="space-y-6">
        <Link href="/legal" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-kumbu-red">
          <ArrowLeft className="size-4" />
          Todos os documentos
        </Link>
        <PageHeader title={doc.title} subtitle={`Slug: ${doc.slug}`} />
        {!data && (
          <p className="kumbu-panel-warning px-4 py-3 text-sm">
            Ainda não guardado na base de dados — a pré-visualização usa o texto por defeito.
            Guarde para publicar no site.
          </p>
        )}
        <LegalEditorForm doc={doc} />
      </div>
    );

}