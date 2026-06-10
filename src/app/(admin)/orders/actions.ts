"use server";



import { revalidatePath } from "next/cache";

import { logAudit, requireAdmin } from "@/lib/auth";

import { adminDelete, adminPatch } from "@/lib/admin-data";

import type { ActionState } from "@/lib/action-state";

import { formDataString, toActionState } from "@/lib/kumbu-api/errors";



export type { ActionState };



export async function updateOrderStatusAction(

  _prev: ActionState,

  formData: FormData

): Promise<ActionState> {

  try {

    await requireAdmin();

    const id = formDataString(formData, "id");

    const status = formDataString(formData, "status");

    if (!id) return { ok: false, message: "ID em falta." };

    const show_track = status !== "delivered" && status !== "cancelled";



    await adminPatch("orders", id, { status, show_track });

    await logAudit({

      action: "order.update_status",

      entity: "orders",

      entityId: id,

      payload: { status },

    });

    revalidatePath("/orders");

    revalidatePath("/dashboard");

    return { ok: true, message: "Estado atualizado." };

  } catch (e) {

    return toActionState(e);

  }

}



export async function deleteOrderAction(

  _prev: ActionState,

  formData: FormData

): Promise<ActionState> {

  try {

    await requireAdmin();

    const id = formDataString(formData, "id");

    if (!id) return { ok: false, message: "ID em falta." };



    await adminDelete("orders", id);

    await logAudit({ action: "order.delete", entity: "orders", entityId: id });

    revalidatePath("/orders");

    revalidatePath("/dashboard");

    return { ok: true, message: "Pedido eliminado." };

  } catch (e) {

    return toActionState(e);

  }

}

