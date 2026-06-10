"use server";



import { revalidatePath } from "next/cache";

import { redirect } from "next/navigation";

import { logAudit, requireAdmin } from "@/lib/auth";

import { adminDelete, adminPatch } from "@/lib/admin-data";

import type { ActionState } from "@/lib/action-state";

import { formDataNumber, formDataString, toActionState } from "@/lib/kumbu-api/errors";

import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";



export type { ActionState };



function buildProductPayload(formData: FormData) {

  const subcategory = formDataString(formData, "subcategory_id");

  const oldPrice = formDataString(formData, "old_price_label");

  const discount = formData.get("discount_percent");

  const delivery = formDataString(formData, "delivery_text");

  const imageColor = formData.get("image_color");

  return {

    id: formDataString(formData, "id"),

    category_id: formDataString(formData, "category_id"),

    subcategory_id: subcategory || null,

    title: formDataString(formData, "title"),

    rating: formDataNumber(formData, "rating", 4.5),

    price_label: formDataString(formData, "price_label"),

    old_price_label: oldPrice || null,

    discount_percent:

      discount == null || discount === "" ? null : formDataNumber(formData, "discount_percent"),

    delivery_text: delivery || null,

    image_color:

      imageColor == null || imageColor === "" ? null : formDataNumber(formData, "image_color"),

    is_featured: formData.get("is_featured") === "on",

    is_out_of_stock: formData.get("is_out_of_stock") === "on",

    sort_order: formDataNumber(formData, "sort_order"),

  };

}



export async function createProductAction(

  _prev: ActionState,

  _formData: FormData

): Promise<ActionState> {

  try {

    await requireAdmin();

    return {

      ok: false,

      message:

        "Os produtos são criados pelos utilizadores na app. O admin apenas modera (editar, destaque, remover).",

    };

  } catch (e) {

    return toActionState(e);

  }

}



export async function updateProductAction(

  _prev: ActionState,

  formData: FormData

): Promise<ActionState> {

  try {

    await requireAdmin();

    const payload = buildProductPayload(formData);

    if (!payload.id) return { ok: false, message: "ID em falta." };

    const { id, ...rest } = payload;



    await adminPatch("products", id, rest as Record<string, unknown>);

    await logAudit({

      action: "product.update",

      entity: "catalog_products",

      entityId: id,

    });

    revalidatePath("/products");

    revalidatePath(`/products/${id}`);

    return { ok: true, message: "Produto atualizado." };

  } catch (e) {

    return toActionState(e);

  }

}



export async function deleteProductAction(

  _prev: ActionState,

  formData: FormData

): Promise<ActionState> {

  try {

    await requireAdmin();

    const id = formDataString(formData, "id");

    if (!id) return { ok: false, message: "ID em falta." };



    await adminDelete("products", id);

    await logAudit({

      action: "product.delete",

      entity: "catalog_products",

      entityId: id,

    });

    revalidatePath("/products");

    redirect("/products");

  } catch (e) {

    return toActionState(e);

  }

}



export async function toggleProductFlagAction(

  _prev: ActionState,

  formData: FormData

): Promise<ActionState> {

  try {

    await requireAdmin();

    const id = formDataString(formData, "id");

    const field = formDataString(formData, "field");

    if (!id || !["is_featured", "is_out_of_stock"].includes(field)) {

      return { ok: false, message: "Inválido." };

    }



    const value = formData.get("value") === "true";
    const actionPath =
      field === "is_featured" ? "featured" : "out-of-stock";

    await kumbuApiFetch<void>(
      `/admin/products/${id}/${actionPath}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      },
      { withAuth: true },
    );

    await logAudit({

      action: "product.toggle",

      entity: "catalog_products",

      entityId: id,

      payload: { field },

    });

    revalidatePath("/products");

    return { ok: true };

  } catch (e) {

    return toActionState(e);

  }

}

