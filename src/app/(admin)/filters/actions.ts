"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAudit, requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionState = { ok?: boolean; message?: string } | null;

const schema = z.object({
  id: z.string().min(1).max(40),
  label: z.string().min(1).max(60),
  sort_mode: z.enum(["default", "rating_desc", "price_asc"]),
  sort_order: z.coerce.number().int().default(0),
});

export async function upsertFilterAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const parsed = schema.safeParse({
    id: formData.get("id") ?? "",
    label: formData.get("label") ?? "",
    sort_mode: formData.get("sort_mode") ?? "default",
    sort_order: formData.get("sort_order") ?? 0,
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("app_category_sort_filters")
    .upsert(parsed.data);
  if (error) return { ok: false, message: error.message };
  await logAudit({
    action: "filter.upsert",
    entity: "app_category_sort_filters",
    entityId: parsed.data.id,
  });
  revalidatePath("/filters");
  return { ok: true, message: "Filtro guardado." };
}

export async function deleteFilterAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "ID em falta." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("app_category_sort_filters")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  await logAudit({
    action: "filter.delete",
    entity: "app_category_sort_filters",
    entityId: id,
  });
  revalidatePath("/filters");
  return { ok: true, message: "Eliminado." };
}
