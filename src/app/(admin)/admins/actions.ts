"use server";

import { revalidatePath } from "next/cache";
import { logAudit, requireAdmin } from "@/lib/auth";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import { hasServiceRole } from "@/lib/env";

export type ActionState = { ok?: boolean; message?: string } | null;

export async function changeRoleAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdmin();
  if (session.role !== "super_admin") {
    return { ok: false, message: "Apenas super admins podem alterar funções." };
  }
  const user_id = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!user_id || !["super_admin", "admin", "support"].includes(role)) {
    return { ok: false, message: "Dados inválidos." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("admin_users")
    .update({ role })
    .eq("user_id", user_id);
  if (error) return { ok: false, message: error.message };
  await logAudit({
    action: "admin.change_role",
    entity: "admin_users",
    entityId: user_id,
    payload: { role },
  });
  revalidatePath("/admins");
  return { ok: true, message: "Função atualizada." };
}

export async function removeAdminAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdmin();
  if (session.role !== "super_admin") {
    return { ok: false, message: "Apenas super admins podem remover." };
  }
  const user_id = String(formData.get("user_id") ?? "");
  if (!user_id) return { ok: false, message: "ID em falta." };
  if (user_id === session.userId) {
    return { ok: false, message: "Não podes remover a tua própria conta." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("admin_users")
    .delete()
    .eq("user_id", user_id);
  if (error) return { ok: false, message: error.message };
  await logAudit({
    action: "admin.remove",
    entity: "admin_users",
    entityId: user_id,
  });
  revalidatePath("/admins");
  return { ok: true, message: "Removido." };
}

/**
 * Cria uma nova conta de admin (Auth + admin_users). Requer SERVICE ROLE.
 */
export async function inviteAdminAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdmin();
  if (session.role !== "super_admin") {
    return { ok: false, message: "Apenas super admins podem convidar." };
  }
  if (!hasServiceRole()) {
    return {
      ok: false,
      message:
        "Configura SUPABASE_SERVICE_ROLE_KEY em .env.local para criar contas de admin.",
    };
  }
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "admin");
  if (!email || !password) {
    return { ok: false, message: "E-mail e palavra-passe são obrigatórios." };
  }
  if (!["super_admin", "admin", "support"].includes(role)) {
    return { ok: false, message: "Função inválida." };
  }
  const admin = createSupabaseServiceClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    return { ok: false, message: error?.message ?? "Falha ao criar utilizador." };
  }

  const supabase = await createSupabaseServerClient();
  const { error: insErr } = await supabase.from("admin_users").insert({
    user_id: data.user.id,
    email,
    role,
    created_by: session.userId,
  });
  if (insErr) return { ok: false, message: insErr.message };

  await logAudit({
    action: "admin.invite",
    entity: "admin_users",
    entityId: data.user.id,
    payload: { email, role },
  });
  revalidatePath("/admins");
  return { ok: true, message: "Administrador criado." };
}
