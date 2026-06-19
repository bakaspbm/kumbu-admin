"use server";



import { revalidatePath } from "next/cache";

import { logAudit, requireAdmin } from "@/lib/auth";

import { adminDelete, adminList, adminPatch, adminUpsert } from "@/lib/admin-data";

import type { ActionState } from "@/lib/action-state";

import { formDataString, toActionState } from "@/lib/kumbu-api/errors";





export async function changeRoleAction(

  _prev: ActionState,

  formData: FormData

): Promise<ActionState> {

  try {

    const session = await requireAdmin();

    if (session.role !== "super_admin") {

      return { ok: false, message: "Apenas super admins podem alterar funções." };

    }

    const user_id = formDataString(formData, "user_id");

    const role = formDataString(formData, "role");

    if (!user_id || !["super_admin", "admin", "support"].includes(role)) {

      return { ok: false, message: "Dados inválidos." };

    }



    await adminPatch("admins", user_id, { role });

    await logAudit({

      action: "admin.change_role",

      entity: "admin_users",

      entityId: user_id,

      payload: { role },

    });

    revalidatePath("/admins");

    return { ok: true, message: "Função atualizada." };

  } catch (e) {

    return toActionState(e);

  }

}



export async function removeAdminAction(

  _prev: ActionState,

  formData: FormData

): Promise<ActionState> {

  try {

    const session = await requireAdmin();

    if (session.role !== "super_admin") {

      return { ok: false, message: "Apenas super admins podem remover." };

    }

    const user_id = formDataString(formData, "user_id");

    if (!user_id) return { ok: false, message: "ID em falta." };

    if (user_id === session.userId) {

      return { ok: false, message: "Não podes remover a tua própria conta." };

    }



    await adminDelete("admins", user_id, "user_id");

    await logAudit({

      action: "admin.remove",

      entity: "admin_users",

      entityId: user_id,

    });

    revalidatePath("/admins");

    return { ok: true, message: "Removido." };

  } catch (e) {

    return toActionState(e);

  }

}



export async function inviteAdminAction(

  _prev: ActionState,

  formData: FormData

): Promise<ActionState> {

  try {

    const session = await requireAdmin();

    if (session.role !== "super_admin") {

      return { ok: false, message: "Apenas super admins podem convidar." };

    }

    const email = formDataString(formData, "email").toLowerCase();

    const role = formDataString(formData, "role") || "admin";

    if (!email) {

      return { ok: false, message: "E-mail é obrigatório." };

    }

    if (!["super_admin", "admin", "support"].includes(role)) {

      return { ok: false, message: "Função inválida." };

    }



    const matches = await adminList<{ id: string; email: string | null }>("users", {

      q: email,

    });

    const user = matches.find((u) => u.email?.toLowerCase() === email);

    if (!user) {

      return {

        ok: false,

        message:

          "Utilizador não encontrado. A conta deve existir na app antes de promover a admin.",

      };

    }



    await adminUpsert("admins", {

      user_id: user.id,

      role,

    });

    await logAudit({

      action: "admin.invite",

      entity: "admin_users",

      payload: { email, role },

    });

    revalidatePath("/admins");

    return { ok: true, message: "Administrador promovido." };

  } catch (e) {

    return toActionState(e);

  }

}

