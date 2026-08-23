"use server";



import { revalidatePath } from "next/cache";

import { logAudit, requireAdmin } from "@/lib/auth";

import { adminAction, adminDelete, adminList, adminPatch, adminUpsert } from "@/lib/admin-data";

import type { ActionState } from "@/lib/action-state";

import { KumbuApiError } from "@/lib/kumbu-api/server-client";
import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";
import { formDataString, toActionState } from "@/lib/kumbu-api/errors";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveUserId(raw: string): Promise<string | null> {
  const value = raw.trim();
  if (!value) return null;
  if (UUID_RE.test(value)) return value;

  const users = await adminList<{ id: string; email: string | null }>("users", {
    q: value,
    limit: 10,
  });
  const exact = users.find(
    (user) => user.email?.trim().toLowerCase() === value.toLowerCase(),
  );
  return exact?.id ?? users[0]?.id ?? null;
}

export async function sendNotificationAction(

  _prev: ActionState,

  formData: FormData

): Promise<ActionState> {

  try {

    await requireAdmin();

    const audience = formDataString(formData, "audience") || "all";

    const rawUserId = formDataString(formData, "user_id");

    const title = formDataString(formData, "title");

    const body = formDataString(formData, "body");

    const icon_key = formDataString(formData, "icon_key") || "notifications_outlined";

    if (!title || !body) {
      return { ok: false, message: "Título e mensagem são obrigatórios." };
    }

    const payload: Record<string, unknown> = {
      title,
      body,
      icon_key,
    };

    if (audience === "single" || audience === "user") {
      const user_id = await resolveUserId(rawUserId);
      if (!user_id) {
        throw new KumbuApiError(
          "Utilizador não encontrado. Indique o e-mail ou UID exacto.",
          400,
        );
      }
      payload.audience = "user";
      payload.user_id = user_id;
    } else {
      payload.audience = "all";
    }

    await adminUpsert("notifications", payload);

    await logAudit({

      action: "notification.send",

      entity: "user_notifications",

      payload: { audience, title },

    });

    revalidatePath("/notifications");

    return {

      ok: true,

      message: "Notificação enviada.",

    };

  } catch (e) {

    return toActionState(e);

  }

}



export async function markAsReadAction(formData: FormData): Promise<void> {

  try {

    await requireAdmin();

    const id = formDataString(formData, "id");

    if (!id) return;



    await adminAction("notifications", id, "read", {}, "POST");

    revalidatePath("/notifications");

    revalidatePath("/users", "layout");

  } catch {

    /* non-blocking */

  }

}



export async function hideNotificationAction(formData: FormData): Promise<void> {

  try {

    await requireAdmin();

    const id = formDataString(formData, "id");

    if (!id) return;



    await adminPatch("notifications", id, { hidden_at: new Date().toISOString() });

    await logAudit({

      action: "notification.hide",

      entity: "user_notifications",

      entityId: id,

    });

    revalidatePath("/notifications");

    revalidatePath("/users", "layout");

  } catch {

    /* non-blocking */

  }

}



export async function unhideNotificationAction(formData: FormData): Promise<void> {

  try {

    await requireAdmin();

    const id = formDataString(formData, "id");

    if (!id) return;



    await adminPatch("notifications", id, { hidden_at: null });

    revalidatePath("/notifications");

    revalidatePath("/users", "layout");

  } catch {

    /* non-blocking */

  }

}



export async function deleteNotificationAction(formData: FormData): Promise<void> {
  try {
    await requireAdmin();
    const id = formDataString(formData, "id");
    if (!id) return;

    await adminDelete("notifications", id);
    await logAudit({
      action: "notification.delete",
      entity: "user_notifications",
      entityId: id,
    });
    revalidatePath("/notifications");
    revalidatePath("/users", "layout");
  } catch {
    /* non-blocking */
  }
}

export async function updateEmailNewListingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const raw = formDataString(formData, "enabled");
    const enabled = raw === "true" || raw === "1";
    await kumbuApiFetch<{ email_new_listings_enabled?: boolean }>(
      "/admin/notifications/email-settings",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_new_listings_enabled: enabled }),
      },
      { withAuth: true },
    );
    await logAudit({
      action: "notification.email_new_listings",
      entity: "platform_email_settings",
      payload: { enabled },
    });
    revalidatePath("/notifications");
    return {
      ok: true,
      message: enabled
        ? "Emails de novos anúncios activados."
        : "Emails de novos anúncios desactivados.",
    };
  } catch (e) {
    return toActionState(e);
  }
}

