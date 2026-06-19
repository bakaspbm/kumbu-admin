"use server";

import { revalidatePath } from "next/cache";
import { resolveAdminAction } from "@/lib/auth";
import { KumbuApiError } from "@/lib/kumbu-api/server-client";
import { supportInboxApi } from "@/lib/kumbu-api/support-inbox";

function actionError(error: unknown): string {
  if (error instanceof KumbuApiError && error.status === 401) {
    return "Sessão expirada. Actualize a página ou entre novamente no painel.";
  }
  return error instanceof Error ? error.message : "Erro inesperado.";
}

export async function replySupportConversationAction(
  conversationId: string,
  body: string,
  attachmentUrl?: string | null,
) {
  const gate = await resolveAdminAction();
  if (!gate.ok) return { ok: false as const, error: gate.error };
  try {
    await supportInboxApi.reply(conversationId, body, attachmentUrl);
    revalidatePath(`/support/inbox/${conversationId}`);
    revalidatePath("/support/inbox");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: actionError(error),
    };
  }
}

export async function closeSupportConversationAction(conversationId: string) {
  const gate = await resolveAdminAction();
  if (!gate.ok) return { ok: false as const, error: gate.error };
  try {
    await supportInboxApi.close(conversationId);
    revalidatePath(`/support/inbox/${conversationId}`);
    revalidatePath("/support/inbox");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: actionError(error),
    };
  }
}
