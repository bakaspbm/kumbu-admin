"use server";

import { revalidatePath } from "next/cache";
import { logAudit, requireAdmin } from "@/lib/auth";
import { adminDelete } from "@/lib/admin-data";

export type ActionState = { ok?: boolean; message?: string } | null;

export async function deleteProductReviewAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, message: "ID em falta." };

  await adminDelete("reviews", id);
  await logAudit({
    action: "review.delete",
    entity: "product_review",
    entityId: id,
  });
  revalidatePath("/reviews");
  return { ok: true, message: "Avaliação eliminada." };
}
