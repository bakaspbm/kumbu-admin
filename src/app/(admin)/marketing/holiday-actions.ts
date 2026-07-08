"use server";

import { revalidatePath } from "next/cache";
import { logAudit, requireAdmin } from "@/lib/auth";
import { adminDelete, adminUpsert } from "@/lib/admin-data";
import type { ActionState } from "@/lib/action-state";
import { formDataNumber, formDataString, toActionState } from "@/lib/kumbu-api/errors";

export async function upsertHolidayAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const payload = {
      id: formDataString(formData, "id"),
      name: formDataString(formData, "name"),
      message: formDataString(formData, "message"),
      month_day: formDataString(formData, "month_day"),
      scope: formDataString(formData, "scope") || "national",
      country_code: formDataString(formData, "country_code") || null,
      gradient_from: formDataString(formData, "gradient_from") || "1565C0",
      gradient_to: formDataString(formData, "gradient_to") || "0D47A1",
      display_mode: formDataString(formData, "display_mode") || "banner",
      sort_order: formDataNumber(formData, "sort_order"),
      active: formData.get("active") === "on",
    };
    if (!payload.id) return { ok: false, message: "ID em falta." };

    await adminUpsert("holidays", payload as Record<string, unknown>);
    await logAudit({
      action: "holiday.upsert",
      entity: "app_holiday_campaign",
      entityId: payload.id,
    });
    revalidatePath("/marketing");
    return { ok: true, message: "Feriado guardado." };
  } catch (e) {
    return toActionState(e);
  }
}

export async function deleteHolidayAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();
    const id = formDataString(formData, "id");
    if (!id) return { ok: false, message: "ID em falta." };

    await adminDelete("holidays", id);
    await logAudit({
      action: "holiday.delete",
      entity: "app_holiday_campaign",
      entityId: id,
    });
    revalidatePath("/marketing");
    return { ok: true, message: "Feriado eliminado." };
  } catch (e) {
    return toActionState(e);
  }
}
