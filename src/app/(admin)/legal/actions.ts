"use server";

import { revalidatePath } from "next/cache";
import { logAudit, resolveAdminAction } from "@/lib/auth";
import { adminUpsert } from "@/lib/admin-data";
import type { ActionState } from "@/lib/action-state";
import { formDataString, toActionState } from "@/lib/kumbu-api/errors";
import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";
import type { LegalSection } from "@/lib/types";

function parseSectionsJson(raw: string): LegalSection[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const sections: LegalSection[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      if (typeof obj.title !== "string" || !obj.title.trim()) return null;
      if (!Array.isArray(obj.paragraphs)) return null;
      sections.push({
        title: obj.title.trim(),
        paragraphs: obj.paragraphs
          .filter((p): p is string => typeof p === "string")
          .map((p) => p.trim())
          .filter(Boolean),
      });
    }
    return sections.length ? sections : null;
  } catch {
    return null;
  }
}

export async function saveLegalDocumentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const auth = await resolveAdminAction();
    if ("error" in auth) return { ok: false, message: auth.error };

    const slug = formDataString(formData, "slug");
    const title = formDataString(formData, "title");
    const intro = formDataString(formData, "intro");
    const sections_json = formDataString(formData, "sections_json");

    const sections = parseSectionsJson(sections_json);
    if (!sections?.length) {
      return { ok: false, message: "Secções inválidas (JSON)." };
    }

    await adminUpsert("legal", {
      slug,
      title: title.trim(),
      intro: intro.trim() || null,
      sections,
      updated_at: new Date().toISOString(),
    });
    await logAudit({
      action: "legal.save",
      entity: "legal_documents",
      entityId: slug,
      payload: { sections: sections.length },
    });
    revalidatePath("/legal");
    revalidatePath(`/legal/${slug}`);
    return { ok: true, message: "Documento guardado. O site user passa a mostrar esta versão." };
  } catch (e) {
    return toActionState(e);
  }
}

export async function seedLegalDocumentsAction(): Promise<ActionState> {
  try {
    const auth = await resolveAdminAction();
    if ("error" in auth) return { ok: false, message: auth.error };

    await kumbuApiFetch<void>(
      "/admin/app/legal-documents/seed",
      { method: "POST" },
      { withAuth: true },
    );
    await logAudit({ action: "legal.seed", entity: "legal_documents" });
    revalidatePath("/legal");
    return { ok: true, message: "Textos por defeito importados (5 documentos)." };
  } catch (e) {
    return toActionState(e);
  }
}
