"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import type { ActionState } from "@/lib/action-state";
import { toActionState } from "@/lib/kumbu-api/errors";
import { jobsApi } from "@/lib/kumbu-api/jobs";

export async function updateJobListingStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const id = String(formData.get("id") ?? "").trim();
    const status = String(formData.get("status") ?? "").trim();
    if (!id || !["active", "filled_hidden"].includes(status)) {
      return { ok: false, message: "Dados inválidos." };
    }

    await jobsApi.updateListingStatus(id, status as "active" | "filled_hidden");

    revalidatePath("/jobs");
    return { ok: true, message: "Estado da vaga actualizado." };
  } catch (e) {
    return toActionState(e);
  }
}

export async function deleteJobListingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const id = String(formData.get("id") ?? "").trim();
    if (!id) return { ok: false, message: "ID em falta." };

    await jobsApi.deleteListing(id);

    revalidatePath("/jobs");
    return { ok: true, message: "Vaga removida." };
  } catch (e) {
    return toActionState(e);
  }
}
