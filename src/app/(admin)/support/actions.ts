"use server";

import { revalidatePath } from "next/cache";
import { logAudit, requireAdmin } from "@/lib/auth";
import { adminUpsert } from "@/lib/admin-data";
import type { ActionState } from "@/lib/action-state";
import { formDataString, toActionState } from "@/lib/kumbu-api/errors";
import type { SupportQuickAction } from "@/lib/types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseQuickActionsFromForm(formData: FormData): SupportQuickAction[] {
  const jsonRaw = formDataString(formData, "quick_actions_json");
  if (jsonRaw) {
    try {
      const parsed = JSON.parse(jsonRaw) as SupportQuickAction[];
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallback to indexed fields
    }
  }

  const actions: SupportQuickAction[] = [];
  for (let index = 0; index < 20; index += 1) {
    const label = formDataString(formData, `faq_label_${index}`);
    const answer = formDataString(formData, `faq_answer_${index}`);
    const keywordsRaw = formDataString(formData, `faq_keywords_${index}`);
    const escalate = formData.get(`faq_escalate_${index}`) === "on";
    if (!label && !answer) {
      if (index > 0 && !formData.has(`faq_label_${index}`)) break;
      continue;
    }
    if (!label) continue;
    actions.push({
      id: slugify(label) || `faq_${index + 1}`,
      label,
      answer,
      keywords: keywordsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      escalate,
    });
  }
  return actions;
}

export async function saveSupportAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const id = formDataString(formData, "id") || "default";
    const welcome_message = formDataString(formData, "welcome_message");
    const auto_reply_message = formDataString(formData, "auto_reply_message");
    const offline_message = formDataString(formData, "offline_message");
    const enabled = formData.get("enabled") === "on";
    const quick_actions = parseQuickActionsFromForm(formData);

    await adminUpsert("support", {
      id,
      welcome_message,
      auto_reply_message,
      offline_message,
      enabled,
      quick_actions,
    });

    await logAudit({
      action: "support.update",
      entity: "app_support_settings",
      entityId: id,
    });

    revalidatePath("/support");
    revalidatePath("/support/inbox");
    return { ok: true, message: "Configuração guardada." };
  } catch (e) {
    return toActionState(e);
  }
}
