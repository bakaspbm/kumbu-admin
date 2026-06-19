"use server";



import { revalidatePath } from "next/cache";

import { logAudit, requireAdmin } from "@/lib/auth";

import { adminUpsert } from "@/lib/admin-data";

import type { ActionState } from "@/lib/action-state";

import { formDataString, toActionState } from "@/lib/kumbu-api/errors";





export async function saveSupportAction(

  _prev: ActionState,

  formData: FormData

): Promise<ActionState> {

  try {

    await requireAdmin();

    const id = formDataString(formData, "id") || "default";

    const welcome_message = formDataString(formData, "welcome_message");

    const auto_reply_message = formDataString(formData, "auto_reply_message");

    const quick_actions_raw = formDataString(formData, "quick_actions_raw");

    const quick_actions = quick_actions_raw

      .split("\n")

      .map((s) => s.trim())

      .filter(Boolean);



    await adminUpsert("support", {

      id,

      welcome_message,

      auto_reply_message,

      quick_actions,

    });

    await logAudit({

      action: "support.update",

      entity: "app_support_settings",

      entityId: id,

    });

    revalidatePath("/support");

    return { ok: true, message: "Configuração guardada." };

  } catch (e) {

    return toActionState(e);

  }

}

