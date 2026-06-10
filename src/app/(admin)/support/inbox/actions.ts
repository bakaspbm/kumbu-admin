"use server";

import { revalidatePath } from "next/cache";
import { supportInboxApi } from "@/lib/kumbu-api/support-inbox";

export async function replySupportConversationAction(conversationId: string, body: string) {
  try {
    await supportInboxApi.reply(conversationId, body);
    revalidatePath(`/support/inbox/${conversationId}`);
    revalidatePath("/support/inbox");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Erro ao enviar mensagem.",
    };
  }
}

export async function closeSupportConversationAction(conversationId: string) {
  try {
    await supportInboxApi.close(conversationId);
    revalidatePath(`/support/inbox/${conversationId}`);
    revalidatePath("/support/inbox");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Erro ao encerrar conversa.",
    };
  }
}
