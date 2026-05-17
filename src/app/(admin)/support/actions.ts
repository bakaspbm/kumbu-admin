"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAudit, requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionState = { ok?: boolean; message?: string } | null;

const schema = z.object({
  id: z.string().default("global"),
  welcome_message: z.string().min(1).max(400),
  auto_reply_message: z.string().max(400).default(""),
  quick_actions_raw: z.string().default(""),
});

export async function saveSupportAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const parsed = schema.safeParse({
    id: formData.get("id") ?? "global",
    welcome_message: formData.get("welcome_message") ?? "",
    auto_reply_message: formData.get("auto_reply_message") ?? "",
    quick_actions_raw: formData.get("quick_actions_raw") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  const quick_actions = parsed.data.quick_actions_raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("app_support_settings").upsert({
    id: parsed.data.id,
    welcome_message: parsed.data.welcome_message,
    auto_reply_message: parsed.data.auto_reply_message,
    quick_actions,
  });
  if (error) return { ok: false, message: error.message };
  await logAudit({
    action: "support.update",
    entity: "app_support_settings",
    entityId: parsed.data.id,
  });
  revalidatePath("/support");
  return { ok: true, message: "Configuração guardada." };
}
