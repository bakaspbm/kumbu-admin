"use server";

import { revalidatePath } from "next/cache";
import { resolveAdminAction } from "@/lib/auth";
import { KumbuApiError } from "@/lib/kumbu-api/server-client";
import { supportMailboxApi } from "@/lib/kumbu-api/support-mailbox";

function actionError(error: unknown): string {
  if (error instanceof KumbuApiError && error.status === 401) {
    return "Sessão expirada. Actualize a página ou entre novamente no painel.";
  }
  return error instanceof Error ? error.message : "Erro inesperado.";
}

export async function replyMailboxMessageAction(uid: number, body: string) {
  const gate = await resolveAdminAction();
  if (!gate.ok) return { ok: false as const, error: gate.error };
  try {
    const result = await supportMailboxApi.reply(uid, body);
    revalidatePath(`/support/mailbox/${uid}`);
    revalidatePath("/support/mailbox");
    return { ok: true as const, to: result.to, subject: result.subject };
  } catch (error) {
    return {
      ok: false as const,
      error: actionError(error),
    };
  }
}
