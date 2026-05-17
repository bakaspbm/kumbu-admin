"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAudit, requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionState = { ok?: boolean; message?: string } | null;

const schema = z.object({
  id: z.string().min(1).max(40),
  kind: z.enum(["hero", "offers"]),
  title: z.string().min(1).max(120),
  subtitle: z.string().max(160).default(""),
  gradient_from: z.string().regex(/^[0-9a-fA-F]{6}$/, "Cor hex 6 dígitos"),
  gradient_to: z.string().regex(/^[0-9a-fA-F]{6}$/, "Cor hex 6 dígitos"),
  sort_order: z.coerce.number().int().default(0),
});

export async function upsertMarketingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const parsed = schema.safeParse({
    id: formData.get("id") ?? "",
    kind: formData.get("kind") ?? "hero",
    title: formData.get("title") ?? "",
    subtitle: formData.get("subtitle") ?? "",
    gradient_from: formData.get("gradient_from") ?? "1565C0",
    gradient_to: formData.get("gradient_to") ?? "0D47A1",
    sort_order: formData.get("sort_order") ?? 0,
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("app_marketing_blocks").upsert(parsed.data);
  if (error) return { ok: false, message: error.message };
  await logAudit({
    action: "marketing.upsert",
    entity: "app_marketing_blocks",
    entityId: parsed.data.id,
  });
  revalidatePath("/marketing");
  return { ok: true, message: "Bloco guardado." };
}

export async function deleteMarketingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "ID em falta." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("app_marketing_blocks")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  await logAudit({
    action: "marketing.delete",
    entity: "app_marketing_blocks",
    entityId: id,
  });
  revalidatePath("/marketing");
  return { ok: true, message: "Bloco eliminado." };
}
