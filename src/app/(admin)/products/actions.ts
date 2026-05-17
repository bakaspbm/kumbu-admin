"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logAudit, requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionState = { ok?: boolean; message?: string } | null;

const baseSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9_-]+$/i, "Use apenas letras, números, hífen ou underscore"),
  category_id: z.string().min(1),
  subcategory_id: z.string().optional().nullable(),
  title: z.string().min(1).max(200),
  rating: z.coerce.number().min(0).max(5),
  price_label: z.string().min(1).max(60),
  old_price_label: z.string().max(60).optional().nullable(),
  discount_percent: z.coerce.number().int().min(0).max(99).optional().nullable(),
  delivery_text: z.string().max(120).optional().nullable(),
  image_color: z.coerce.number().int().min(0).max(0xffffffff).optional().nullable(),
  is_featured: z.coerce.boolean().default(false),
  is_out_of_stock: z.coerce.boolean().default(false),
  sort_order: z.coerce.number().int().default(0),
});

function parseProduct(formData: FormData) {
  return baseSchema.safeParse({
    id: formData.get("id") ?? "",
    category_id: formData.get("category_id") ?? "",
    subcategory_id: formData.get("subcategory_id") || null,
    title: formData.get("title") ?? "",
    rating: formData.get("rating") ?? 4.5,
    price_label: formData.get("price_label") ?? "",
    old_price_label: formData.get("old_price_label") || null,
    discount_percent: formData.get("discount_percent") || null,
    delivery_text: formData.get("delivery_text") || null,
    image_color: formData.get("image_color") || null,
    is_featured: formData.get("is_featured") === "on",
    is_out_of_stock: formData.get("is_out_of_stock") === "on",
    sort_order: formData.get("sort_order") ?? 0,
  });
}

export async function createProductAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const parsed = parseProduct(formData);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("catalog_products").insert(parsed.data);
  if (error) return { ok: false, message: error.message };
  await logAudit({
    action: "product.create",
    entity: "catalog_products",
    entityId: parsed.data.id,
    payload: { title: parsed.data.title },
  });
  revalidatePath("/products");
  redirect("/products");
}

export async function updateProductAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const parsed = parseProduct(formData);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  const supabase = await createSupabaseServerClient();
  const { id, ...rest } = parsed.data;
  const { error } = await supabase
    .from("catalog_products")
    .update(rest)
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  await logAudit({
    action: "product.update",
    entity: "catalog_products",
    entityId: id,
  });
  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  return { ok: true, message: "Produto atualizado." };
}

export async function deleteProductAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "ID em falta." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("catalog_products")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  await logAudit({
    action: "product.delete",
    entity: "catalog_products",
    entityId: id,
  });
  revalidatePath("/products");
  redirect("/products");
}

export async function toggleProductFlagAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const field = String(formData.get("field") ?? "");
  if (!id || !["is_featured", "is_out_of_stock"].includes(field)) {
    return { ok: false, message: "Inválido." };
  }
  const supabase = await createSupabaseServerClient();
  const { data: existing, error: getErr } = await supabase
    .from("catalog_products")
    .select(field)
    .eq("id", id)
    .maybeSingle();
  if (getErr || !existing) return { ok: false, message: "Não encontrado." };
  const current = (existing as unknown as Record<string, boolean>)[field];
  const { error } = await supabase
    .from("catalog_products")
    .update({ [field]: !current })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  await logAudit({
    action: "product.toggle",
    entity: "catalog_products",
    entityId: id,
    payload: { field, value: !current },
  });
  revalidatePath("/products");
  return { ok: true };
}
