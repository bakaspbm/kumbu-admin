"use server";

import { revalidatePath } from "next/cache";
import { logAudit, requireAdmin } from "@/lib/auth";
import { adminDelete, adminUpsert } from "@/lib/admin-data";
import type { ActionState } from "@/lib/action-state";
import { formDataNumber, formDataString, toActionState } from "@/lib/kumbu-api/errors";
import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";

export async function upsertCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const payload = {
      id: formDataString(formData, "id"),
      name: formDataString(formData, "name"),
      icon_key: formDataString(formData, "icon_key") || "category",
      accent_hex: formDataString(formData, "accent_hex") || "5C6BC0",
      sort_order: formDataNumber(formData, "sort_order"),
      kind: formDataString(formData, "kind") || "product",
    };
    if (!payload.id || !payload.name) {
      return { ok: false, message: "ID e nome são obrigatórios." };
    }

    await adminUpsert("categories", payload);
    await logAudit({
      action: "category.upsert",
      entity: "catalog_categories",
      entityId: payload.id,
    });
    revalidatePath("/categories");
    revalidatePath("/products");
    return { ok: true, message: "Categoria guardada." };
  } catch (e) {
    return toActionState(e);
  }
}

export async function deleteCategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const id = formDataString(formData, "id");
    if (!id) return { ok: false, message: "ID em falta." };

    await adminDelete("categories", id);
    await logAudit({
      action: "category.delete",
      entity: "catalog_categories",
      entityId: id,
    });
    revalidatePath("/categories");
    return { ok: true, message: "Categoria eliminada." };
  } catch (e) {
    return toActionState(e);
  }
}

export async function upsertSubcategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const category_id = formDataString(formData, "category_id");
    const id = formDataString(formData, "id");
    const label = formDataString(formData, "label");
    const sort_order = formDataNumber(formData, "sort_order");
    if (!category_id || !id || !label) {
      return { ok: false, message: "Categoria, ID e etiqueta são obrigatórios." };
    }

    const payload = { id, label, sort_order };
    const isEdit = formData.get("existing") === "1";
    const path = isEdit
      ? `/admin/catalog/categories/${encodeURIComponent(category_id)}/subcategories/${encodeURIComponent(id)}`
      : `/admin/catalog/categories/${encodeURIComponent(category_id)}/subcategories`;

    await kumbuApiFetch<void>(
      path,
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      { withAuth: true },
    );
    revalidatePath("/categories");
    return { ok: true, message: "Subcategoria guardada." };
  } catch (e) {
    return toActionState(e);
  }
}

export async function deleteSubcategoryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const category_id = formDataString(formData, "category_id");
    const id = formDataString(formData, "id");
    if (!category_id || !id) return { ok: false, message: "ID em falta." };

    await kumbuApiFetch<void>(
      `/admin/catalog/categories/${encodeURIComponent(category_id)}/subcategories/${encodeURIComponent(id)}`,
      { method: "DELETE" },
      { withAuth: true },
    );
    revalidatePath("/categories");
    return { ok: true, message: "Subcategoria eliminada." };
  } catch (e) {
    return toActionState(e);
  }
}
