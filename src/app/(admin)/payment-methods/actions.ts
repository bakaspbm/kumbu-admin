"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAudit, requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionState = { ok?: boolean; message?: string } | null;

const schema = z.object({
  id: z.string().min(1).max(40),
  label: z.string().min(1).max(80),
  icon_key: z.string().min(1).max(60),
  sort_order: z.coerce.number().int().default(0),
  is_default: z.coerce.boolean().default(false),
});

export async function upsertPaymentAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const parsed = schema.safeParse({
    id: formData.get("id") ?? "",
    label: formData.get("label") ?? "",
    icon_key: formData.get("icon_key") ?? "credit_card_rounded",
    sort_order: formData.get("sort_order") ?? 0,
    is_default: formData.get("is_default") === "on",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  const supabase = await createSupabaseServerClient();

  if (parsed.data.is_default) {
    await supabase.from("app_payment_methods").update({ is_default: false }).neq("id", parsed.data.id);
  }
  const { error } = await supabase.from("app_payment_methods").upsert(parsed.data);
  if (error) return { ok: false, message: error.message };

  await logAudit({
    action: "payment_method.upsert",
    entity: "app_payment_methods",
    entityId: parsed.data.id,
  });
  revalidatePath("/payment-methods");
  return { ok: true, message: "Método de pagamento guardado." };
}

export async function deletePaymentAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "ID em falta." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("app_payment_methods")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  await logAudit({
    action: "payment_method.delete",
    entity: "app_payment_methods",
    entityId: id,
  });
  revalidatePath("/payment-methods");
  return { ok: true, message: "Eliminado." };
}
