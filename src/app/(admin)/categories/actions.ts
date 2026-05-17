"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAudit, requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionState = { ok?: boolean; message?: string } | null;

const categorySchema = z.object({
  id: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9_-]+$/i, "Use letras, números, hífen ou underscore"),
  name: z.string().min(1).max(80),
  icon_key: z.string().min(1).max(60),
  accent_hex: z
    .string()
    .regex(/^[0-9a-fA-F]{6}$/, "Cor em HEX sem # (6 dígitos)"),
  sort_order: z.coerce.number().int().default(0),
  kind: z.enum(["product", "stay"]).default("product"),
});

export async function upsertCategoryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    id: formData.get("id") ?? "",
    name: formData.get("name") ?? "",
    icon_key: formData.get("icon_key") ?? "category",
    accent_hex: formData.get("accent_hex") ?? "5C6BC0",
    sort_order: formData.get("sort_order") ?? 0,
    kind: formData.get("kind") ?? "product",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("catalog_categories")
    .upsert(parsed.data);
  if (error) return { ok: false, message: error.message };
  await logAudit({
    action: "category.upsert",
    entity: "catalog_categories",
    entityId: parsed.data.id,
  });
  revalidatePath("/categories");
  revalidatePath("/products");
  return { ok: true, message: "Categoria guardada." };
}

export async function deleteCategoryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "ID em falta." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("catalog_categories")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  await logAudit({
    action: "category.delete",
    entity: "catalog_categories",
    entityId: id,
  });
  revalidatePath("/categories");
  return { ok: true, message: "Categoria eliminada." };
}

const subSchema = z.object({
  category_id: z.string().min(1),
  id: z.string().min(1).max(40),
  label: z.string().min(1).max(80),
  sort_order: z.coerce.number().int().default(0),
});

export async function upsertSubcategoryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const parsed = subSchema.safeParse({
    category_id: formData.get("category_id") ?? "",
    id: formData.get("id") ?? "",
    label: formData.get("label") ?? "",
    sort_order: formData.get("sort_order") ?? 0,
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("catalog_subcategories")
    .upsert(parsed.data);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/categories");
  return { ok: true, message: "Subcategoria guardada." };
}

export async function deleteSubcategoryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const category_id = String(formData.get("category_id") ?? "");
  const id = String(formData.get("id") ?? "");
  if (!category_id || !id) return { ok: false, message: "ID em falta." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("catalog_subcategories")
    .delete()
    .eq("category_id", category_id)
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/categories");
  return { ok: true, message: "Subcategoria eliminada." };
}
