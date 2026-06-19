"use server";

import { resolveAdminAction } from "@/lib/auth";
import { supportInboxApi } from "@/lib/kumbu-api/support-inbox";

export async function uploadSupportAttachmentAction(formData: FormData) {
  const gate = await resolveAdminAction();
  if (!gate.ok) return { ok: false as const, error: gate.error };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, error: "Ficheiro inválido." };
  }
  try {
    const result = await supportInboxApi.uploadAttachment(file);
    const url = result.url?.trim();
    if (!url) {
      return { ok: false as const, error: "Upload sem URL de retorno." };
    }
    return { ok: true as const, url };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Erro ao enviar ficheiro.",
    };
  }
}
