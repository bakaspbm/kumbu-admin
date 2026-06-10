"use server";

import { revalidatePath } from "next/cache";
import { resolveAdminAction, logAudit } from "@/lib/auth";
import { adminDelete, adminPatch } from "@/lib/admin-data";
import { notifyReportOutcome } from "@/lib/report-notify";
import type { ActionState } from "@/lib/action-state";
import { formDataString, toActionState } from "@/lib/kumbu-api/errors";
import type { ContentReportStatus } from "@/lib/types";

export type { ActionState };

async function patchReport(
  id: string,
  patch: {
    status: ContentReportStatus;
    admin_notes?: string | null;
  },
  auditAction: string,
  extraPayload?: Record<string, unknown>,
): Promise<ActionState> {
  try {
    const auth = await resolveAdminAction();
    if ("error" in auth) return { ok: false, message: auth.error };
    if (!id) return { ok: false, message: "ID em falta." };

    await adminPatch("reports", id, {
      status: patch.status,
      admin_notes: patch.admin_notes ?? null,
    });
    await notifyReportOutcome(id, patch.status, patch.admin_notes ?? null);
    await logAudit({
      action: auditAction,
      entity: "content_reports",
      entityId: id,
      payload: { status: patch.status, ...extraPayload },
    });
    revalidatePath("/reports");
    revalidatePath(`/reports/${id}`);
    return { ok: true, message: "Denúncia actualizada. Denunciante notificado na app." };
  } catch (e) {
    return toActionState(e);
  }
}

export async function markReportReviewingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = formDataString(formData, "id");
  return patchReport(id, { status: "reviewing" }, "report.reviewing");
}

export async function resolveReportAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = formDataString(formData, "id");
  const notes = formDataString(formData, "admin_notes") || null;
  return patchReport(id, { status: "resolved", admin_notes: notes }, "report.resolve", {
    admin_notes: notes,
  });
}

export async function dismissReportAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = formDataString(formData, "id");
  const notes = formDataString(formData, "admin_notes") || null;
  return patchReport(id, { status: "dismissed", admin_notes: notes }, "report.dismiss", {
    admin_notes: notes,
  });
}

export async function removeListingFromReportAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const auth = await resolveAdminAction();
    if ("error" in auth) return { ok: false, message: auth.error };

    const reportId = formDataString(formData, "report_id");
    const productId = formDataString(formData, "product_id");
    if (!reportId || !productId) {
      return { ok: false, message: "IDs em falta." };
    }

    await adminDelete("products", productId);
    await logAudit({
      action: "product.delete_from_report",
      entity: "catalog_products",
      entityId: productId,
      payload: { report_id: reportId },
    });
    const notes =
      formDataString(formData, "admin_notes") ||
      "Anúncio removido após denúncia.";
    return patchReport(
      reportId,
      { status: "resolved", admin_notes: notes },
      "report.resolve_remove_listing",
      { product_id: productId },
    );
  } catch (e) {
    return toActionState(e);
  }
}

export async function suspendUserFromReportAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const auth = await resolveAdminAction();
    if ("error" in auth) return { ok: false, message: auth.error };

    const reportId = formDataString(formData, "report_id");
    const userId = formDataString(formData, "user_id");
    const deleteAuth = formData.get("delete_auth") === "on";
    if (!reportId || !userId) {
      return { ok: false, message: "IDs em falta." };
    }

    await adminDelete("users", userId);
    await logAudit({
      action: "user.suspend_from_report",
      entity: "users",
      entityId: userId,
      payload: { report_id: reportId, delete_auth: deleteAuth },
    });
    revalidatePath("/users");
    revalidatePath(`/users/${userId}`);
    const notes =
      formDataString(formData, "admin_notes") ||
      "Conta suspensa (soft delete) após denúncia.";
    return patchReport(
      reportId,
      { status: "resolved", admin_notes: notes },
      "report.resolve_suspend_user",
      { user_id: userId, delete_auth: deleteAuth },
    );
  } catch (e) {
    return toActionState(e);
  }
}
