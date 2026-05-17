"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAudit, requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionState = { ok?: boolean; message?: string } | null;

const schema = z.object({
  audience: z.enum(["all", "single"]),
  user_id: z.string().optional(),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(500),
  icon_key: z.string().min(1).max(60).default("notifications_outlined"),
});

export async function sendNotificationAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const parsed = schema.safeParse({
    audience: formData.get("audience") ?? "all",
    user_id: formData.get("user_id") || undefined,
    title: formData.get("title") ?? "",
    body: formData.get("body") ?? "",
    icon_key: formData.get("icon_key") ?? "notifications_outlined",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  const supabase = await createSupabaseServerClient();
  const broadcastId = crypto.randomUUID();

  let targets: string[] = [];
  if (parsed.data.audience === "single") {
    if (!parsed.data.user_id) {
      return { ok: false, message: "Indica o utilizador (e-mail ou UID)." };
    }
    const uid = parsed.data.user_id.trim();
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid);
    if (isUuid) {
      targets = [uid];
    } else {
      const { data: user, error } = await supabase
        .from("users")
        .select("id")
        .ilike("email", uid)
        .is("deleted_at", null)
        .maybeSingle();
      if (error || !user) {
        return { ok: false, message: "Utilizador não encontrado." };
      }
      targets = [user.id];
    }
  } else {
    const { data: ids, error: e } = await supabase
      .from("users")
      .select("id")
      .is("deleted_at", null);
    if (e) return { ok: false, message: e.message };
    targets = (ids ?? []).map((r) => r.id as string);
  }

  if (targets.length === 0) {
    return { ok: false, message: "Sem destinatários." };
  }

  const rows = targets.map((uid) => ({
    user_id: uid,
    title: parsed.data.title,
    body: parsed.data.body,
    icon_key: parsed.data.icon_key,
    broadcast_id: broadcastId,
  }));

  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("user_notifications").insert(chunk);
    if (error) return { ok: false, message: error.message };
  }

  await logAudit({
    action: "notification.send",
    entity: "user_notifications",
    payload: {
      audience: parsed.data.audience,
      count: rows.length,
      title: parsed.data.title,
      broadcast_id: broadcastId,
    },
  });

  revalidatePath("/notifications");
  return {
    ok: true,
    message: `Enviado para ${rows.length} utilizador(es).`,
  };
}

export async function markAsReadAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("user_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/notifications");
}

export async function hideNotificationAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("user_notifications")
    .update({ hidden_at: new Date().toISOString() })
    .eq("id", id);
  if (!error) {
    await logAudit({
      action: "notification.hide",
      entity: "user_notifications",
      entityId: id,
    });
  }
  revalidatePath("/notifications");
}

export async function unhideNotificationAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("user_notifications")
    .update({ hidden_at: null })
    .eq("id", id);
  revalidatePath("/notifications");
}

export async function deleteNotificationAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("user_notifications").delete().eq("id", id);
  if (!error) {
    await logAudit({
      action: "notification.delete",
      entity: "user_notifications",
      entityId: id,
    });
  }
  revalidatePath("/notifications");
}
