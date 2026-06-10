"use server";



import { revalidatePath } from "next/cache";

import { logAudit, requireAdmin } from "@/lib/auth";

import { adminAction, adminDelete, adminPatch, adminUpsert } from "@/lib/admin-data";

import type { ActionState } from "@/lib/action-state";

import { formDataString, toActionState } from "@/lib/kumbu-api/errors";



export type { ActionState };



export async function sendNotificationAction(

  _prev: ActionState,

  formData: FormData

): Promise<ActionState> {

  try {

    await requireAdmin();

    const audience = formDataString(formData, "audience") || "all";

    const user_id = formDataString(formData, "user_id") || undefined;

    const title = formDataString(formData, "title");

    const body = formDataString(formData, "body");

    const icon_key = formDataString(formData, "icon_key") || "notifications_outlined";



    await adminUpsert("notifications", {

      audience,

      user_id: user_id ?? null,

      title,

      body,

      icon_key,

    });

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

