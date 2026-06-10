"use server";



import { revalidatePath } from "next/cache";

import { logAudit, requireAdmin } from "@/lib/auth";

import { adminDelete, adminUpsert } from "@/lib/admin-data";

import type { ActionState } from "@/lib/action-state";

import { formDataNumber, formDataString, toActionState } from "@/lib/kumbu-api/errors";



export type { ActionState };



export async function upsertMarketingAction(

  _prev: ActionState,

  formData: FormData

): Promise<ActionState> {

  try {

    await requireAdmin();

    const payload = {

      id: formDataString(formData, "id"),

      kind: formDataString(formData, "kind") || "hero",

      title: formDataString(formData, "title"),

      subtitle: formDataString(formData, "subtitle"),

      gradient_from: formDataString(formData, "gradient_from") || "1565C0",

      gradient_to: formDataString(formData, "gradient_to") || "0D47A1",

      sort_order: formDataNumber(formData, "sort_order"),

    };

    if (!payload.id) return { ok: false, message: "ID em falta." };



    await adminUpsert("marketing", payload as Record<string, unknown>);

    await logAudit({

      action: "marketing.upsert",

      entity: "app_marketing_blocks",

      entityId: payload.id,

    });

    revalidatePath("/marketing");

    return { ok: true, message: "Bloco guardado." };

  } catch (e) {

    return toActionState(e);

  }

}



export async function deleteMarketingAction(

  _prev: ActionState,

  formData: FormData

): Promise<ActionState> {

  try {

    await requireAdmin();

    const id = formDataString(formData, "id");

    if (!id) return { ok: false, message: "ID em falta." };



    await adminDelete("marketing", id);

    await logAudit({

      action: "marketing.delete",

      entity: "app_marketing_blocks",

      entityId: id,

    });

    revalidatePath("/marketing");

    return { ok: true, message: "Bloco eliminado." };

  } catch (e) {

    return toActionState(e);

  }

}

