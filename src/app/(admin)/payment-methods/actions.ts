"use server";



import { revalidatePath } from "next/cache";

import { logAudit, requireAdmin } from "@/lib/auth";

import { adminDelete, adminUpsert } from "@/lib/admin-data";

import type { ActionState } from "@/lib/action-state";

import { formDataNumber, formDataString, toActionState } from "@/lib/kumbu-api/errors";





export async function upsertPaymentAction(

  _prev: ActionState,

  formData: FormData

): Promise<ActionState> {

  try {

    await requireAdmin();

    const payload = {

      id: formDataString(formData, "id"),

      label: formDataString(formData, "label"),

      icon_key: formDataString(formData, "icon_key") || "credit_card_rounded",

      sort_order: formDataNumber(formData, "sort_order"),

      is_default: formData.get("is_default") === "on",

    };

    if (!payload.id) return { ok: false, message: "ID em falta." };



    await adminUpsert("payment-methods", payload as Record<string, unknown>);

    await logAudit({

      action: "payment_method.upsert",

      entity: "app_payment_methods",

      entityId: payload.id,

    });

    revalidatePath("/payment-methods");

    return { ok: true, message: "Método de pagamento guardado." };

  } catch (e) {

    return toActionState(e);

  }

}



export async function deletePaymentAction(

  _prev: ActionState,

  formData: FormData

): Promise<ActionState> {

  try {

    await requireAdmin();

    const id = formDataString(formData, "id");

    if (!id) return { ok: false, message: "ID em falta." };



    await adminDelete("payment-methods", id);

    await logAudit({

      action: "payment_method.delete",

      entity: "app_payment_methods",

      entityId: id,

    });

    revalidatePath("/payment-methods");

    return { ok: true, message: "Eliminado." };

  } catch (e) {

    return toActionState(e);

  }

}

