"use server";

import { revalidatePath } from "next/cache";
import {
  resolveAdminAction,
  resolveSuperAdminAction,
  logAudit,
} from "@/lib/auth";
import { adminAction, adminDelete, adminPatch, adminUpsert } from "@/lib/admin-data";
import type { ActionState } from "@/lib/action-state";
import { formDataString, formDataToObject, toActionState } from "@/lib/kumbu-api/errors";
import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";
import {
  type BanDurationKey,
  BAN_DURATION_OPTIONS,
  computeBannedUntil,
} from "@/lib/user-ban";

const VALID_DURATIONS = new Set<BanDurationKey>(
  BAN_DURATION_OPTIONS.map((o) => o.value),
);

export async function updateUserAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const auth = await resolveAdminAction();
    if ("error" in auth) return { ok: false, message: auth.error };
    const id = formDataString(formData, "id");
    if (!id) return { ok: false, message: "ID em falta." };

    const raw = formDataToObject(formData);
    delete raw.id;
    await adminPatch("users", id, raw);
    await logAudit({
      action: "user.update",
      entity: "users",
      entityId: id,
      payload: {
        display_name: raw.display_name,
        phone: raw.phone,
      },
    });
    revalidatePath("/users");
    revalidatePath(`/users/${id}`);
    return { ok: true, message: "Utilizador atualizado." };
  } catch (e) {
    return toActionState(e);
  }
}

export async function deleteUserAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const auth = await resolveAdminAction();
    if ("error" in auth) return { ok: false, message: auth.error };
    const id = formDataString(formData, "id");
    if (!id) return { ok: false, message: "ID em falta." };

    await adminDelete("users", id);
    await logAudit({ action: "user.delete", entity: "users", entityId: id });
    revalidatePath("/users");
    return { ok: true, message: "Utilizador eliminado." };
  } catch (e) {
    return toActionState(e);
  }
}

export async function promoteAdminAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const auth = await resolveSuperAdminAction();
    if ("error" in auth) return { ok: false, message: auth.error };
    const session = auth.session;
    const id = formDataString(formData, "id");
    const email = formDataString(formData, "email");
    const role = formDataString(formData, "role") || "admin";
    if (!id) return { ok: false, message: "ID em falta." };

    await adminUpsert("admins", {
      user_id: id,
      email,
      role,
      created_by: session.userId,
    });
    await logAudit({
      action: "admin.promote",
      entity: "admin_users",
      entityId: id,
      payload: { role },
    });
    revalidatePath("/users");
    revalidatePath("/admins");
    return { ok: true, message: `Promovido a ${role}.` };
  } catch (e) {
    return toActionState(e);
  }
}

export async function demoteAdminAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const auth = await resolveSuperAdminAction();
    if ("error" in auth) return { ok: false, message: auth.error };
    const session = auth.session;
    const id = formDataString(formData, "id");
    if (!id) return { ok: false, message: "ID em falta." };

    if (id === session.userId) {
      return { ok: false, message: "Não podes revogar a tua própria conta." };
    }

    await adminDelete("admins", id, "user_id");
    await logAudit({
      action: "admin.demote",
      entity: "admin_users",
      entityId: id,
    });
    revalidatePath("/users");
    revalidatePath("/admins");
    return { ok: true, message: "Permissões revogadas." };
  } catch (e) {
    return toActionState(e);
  }
}

export async function banUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const auth = await resolveAdminAction();
    if ("error" in auth) return { ok: false, message: auth.error };

    const id = formDataString(formData, "id");
    const duration = formDataString(formData, "duration") as BanDurationKey;
    const reason = formDataString(formData, "reason");
    if (!id || !VALID_DURATIONS.has(duration)) {
      return { ok: false, message: "Dados inválidos." };
    }

    if (id === auth.session.userId) {
      return { ok: false, message: "Não pode banir a sua própria conta." };
    }

    const now = new Date();
    const bannedUntil = computeBannedUntil(duration, now);
    await adminAction(
      "users",
      id,
      "ban",
      { reason: reason.trim() || null, until: bannedUntil },
      "POST",
    );
    await logAudit({
      action: "user.ban",
      entity: "users",
      entityId: id,
      payload: { duration, banned_until: bannedUntil, reason: reason.trim() },
    });
    revalidatePath("/users");
    revalidatePath(`/users/${id}`);
    revalidatePath("/control");
    const label =
      duration === "permanent"
        ? "Utilizador banido permanentemente."
        : `Utilizador banido até ${bannedUntil ? new Date(bannedUntil).toLocaleString("pt-PT") : "—"}.`;
    return { ok: true, message: label };
  } catch (e) {
    return toActionState(e);
  }
}

export async function unbanUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const auth = await resolveAdminAction();
    if ("error" in auth) return { ok: false, message: auth.error };

    const id = formDataString(formData, "id");
    if (!id) return { ok: false, message: "ID em falta." };

    await adminAction("users", id, "unban", {}, "POST");
    await logAudit({
      action: "user.unban",
      entity: "users",
      entityId: id,
    });
    revalidatePath("/users");
    revalidatePath(`/users/${id}`);
    revalidatePath("/control");
    return {
      ok: true,
      message: "Suspensão cancelada. O utilizador pode voltar a usar a plataforma.",
    };
  } catch (e) {
    return toActionState(e);
  }
}

export async function restoreUserAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const auth = await resolveSuperAdminAction();
    if ("error" in auth) return { ok: false, message: auth.error };
    const id = formDataString(formData, "id");
    if (!id) return { ok: false, message: "ID em falta." };

    await adminAction("users", id, "restore", {}, "POST");
    await logAudit({
      action: "user.restore",
      entity: "users",
      entityId: id,
    });
    revalidatePath("/users");
    revalidatePath(`/users/${id}`);
    revalidatePath("/control");
    return { ok: true, message: "Conta restaurada. O utilizador pode voltar a usar a app." };
  } catch (e) {
    return toActionState(e);
  }
}

export async function sendPasswordResetAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const auth = await resolveAdminAction();
    if ("error" in auth) return { ok: false, message: auth.error };
    const email = formDataString(formData, "email");
    if (!email) return { ok: false, message: "E-mail em falta." };

    await kumbuApiFetch<void>(
      "/auth/forgot-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
      { withAuth: true },
    );
    await logAudit({
      action: "user.password_reset",
      entity: "users",
      payload: { email },
    });
    return { ok: true, message: "E-mail de reposição enviado." };
  } catch (e) {
    return toActionState(e);
  }
}

export async function sendEmailVerificationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const auth = await resolveAdminAction();
    if ("error" in auth) return { ok: false, message: auth.error };
    const id = formDataString(formData, "id");
    if (!id) return { ok: false, message: "ID em falta." };

    const result = await kumbuApiFetch<{
      message?: string;
      email_action_link?: string;
    }>(`/admin/users/${id}/resend-email-verification`, { method: "POST" }, { withAuth: true });

    await logAudit({
      action: "user.email_verification_sent",
      entity: "users",
      entityId: id,
    });
    revalidatePath("/users");
    revalidatePath(`/users/${id}`);

    const link = result.email_action_link?.trim();
    if (link) {
      return {
        ok: true,
        message: `${result.message ?? "Link gerado."} (dev) ${link}`,
      };
    }
    return {
      ok: true,
      message: result.message ?? "Link de confirmação enviado por e-mail.",
    };
  } catch (e) {
    return toActionState(e);
  }
}
