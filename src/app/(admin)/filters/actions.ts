"use server";



import { revalidatePath } from "next/cache";

import { logAudit, requireAdmin } from "@/lib/auth";

import { adminDelete, adminUpsert } from "@/lib/admin-data";

import type { ActionState } from "@/lib/action-state";

import { formDataNumber, formDataString, toActionState } from "@/lib/kumbu-api/errors";





export async function upsertFilterAction(

  _prev: ActionState,

  formData: FormData

): Promise<ActionState> {

  try {

    await requireAdmin();

    const payload = {

      id: formDataString(formData, "id"),

      label: formDataString(formData, "label"),

      sort_mode: formDataString(formData, "sort_mode") || "default",

      sort_order: formDataNumber(formData, "sort_order"),

    };

    if (!payload.id) return { ok: false, message: "ID em falta." };



    await adminUpsert("filters", payload as Record<string, unknown>);

    await logAudit({

      action: "filter.upsert",

      entity: "app_category_sort_filters",

      entityId: payload.id,

    });

    revalidatePath("/filters");

    return { ok: true, message: "Filtro guardado." };

  } catch (e) {

    return toActionState(e);

  }

}



export async function deleteFilterAction(

  _prev: ActionState,

  formData: FormData

): Promise<ActionState> {

  try {

    await requireAdmin();

    const id = formDataString(formData, "id");

    if (!id) return { ok: false, message: "ID em falta." };



    await adminDelete("filters", id);

    await logAudit({

      action: "filter.delete",

      entity: "app_category_sort_filters",

      entityId: id,

    });

    revalidatePath("/filters");

    return { ok: true, message: "Eliminado." };

  } catch (e) {

    return toActionState(e);

  }

}

