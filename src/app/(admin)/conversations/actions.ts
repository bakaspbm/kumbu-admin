"use server";

import { revalidatePath } from "next/cache";
import { resolveAdminAction, logAudit } from "@/lib/auth";
import { adminPatch } from "@/lib/admin-data";

export type ActionState = { ok?: boolean; message?: string } | null;

export async function blockConversationAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await resolveAdminAction();
  if ("error" in auth) return { ok: false, message: auth.error };
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim() || "Bloqueado pelo admin";
  if (!id) return { ok: false, message: "ID em falta." };

  await adminPatch("conversations", id, {
    is_blocked: true,
    blocked_reason: reason,
    blocked_at: new Date().toISOString(),
  });
  await logAudit({
    action: "conversation.block",
    entity: "conversations",
    entityId: id,
    payload: { reason },
  });
  revalidatePath("/conversations");
  revalidatePath(`/conversations/${id}`);
  return { ok: true, message: "Conversa bloqueada. Novas mensagens impedidas." };
}

export async function unblockConversationAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const auth = await resolveAdminAction();
  if ("error" in auth) return { ok: false, message: auth.error };
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "ID em falta." };

  await adminPatch("conversations", id, {
    is_blocked: false,
    blocked_reason: null,
    blocked_at: null,
    blocked_by: null,
  });
  await logAudit({
    action: "conversation.unblock",
    entity: "conversations",
    entityId: id,
  });
  revalidatePath("/conversations");
  revalidatePath(`/conversations/${id}`);
  return { ok: true, message: "Conversa desbloqueada." };
}

export async function hideMessageAction(formData: FormData): Promise<void> {
  const auth = await resolveAdminAction();
  if ("error" in auth) return;
  const id = String(formData.get("id") ?? "");
  const conversationId = String(formData.get("conversation_id") ?? "");
  if (!id) return;

  const resource = conversationId
    ? `conversations/${conversationId}/messages`
    : "messages";
  await adminPatch(resource, id, {
    hidden_at: new Date().toISOString(),
  });
  await logAudit({
    action: "chat_message.hide",
    entity: "chat_messages",
    entityId: id,
  });
  revalidatePath("/conversations");
  if (conversationId) revalidatePath(`/conversations/${conversationId}`);
}

export async function unhideMessageAction(formData: FormData): Promise<void> {
  const auth = await resolveAdminAction();
  if ("error" in auth) return;
  const id = String(formData.get("id") ?? "");
  const conversationId = String(formData.get("conversation_id") ?? "");
  if (!id) return;

  const resource = conversationId
    ? `conversations/${conversationId}/messages`
    : "messages";
  await adminPatch(resource, id, { hidden_at: null, hidden_by: null });
  await logAudit({
    action: "chat_message.unhide",
    entity: "chat_messages",
    entityId: id,
  });
  revalidatePath("/conversations");
  if (conversationId) revalidatePath(`/conversations/${conversationId}`);
}
