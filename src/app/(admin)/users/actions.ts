"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, logAudit } from "@/lib/auth";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import { hasServiceRole } from "@/lib/env";

export type ActionState = { ok?: boolean; message?: string } | null;

const updateSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().max(120).optional().default(""),
  phone: z.string().max(40).optional().default(""),
  email: z.string().email().optional().or(z.literal("")),
});

export async function updateUserAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    display_name: formData.get("display_name") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, message: "Dados inválidos." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("users")
    .update({
      display_name: parsed.data.display_name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id);

  if (error) return { ok: false, message: error.message };

  await logAudit({
    action: "user.update",
    entity: "users",
    entityId: parsed.data.id,
    payload: { display_name: parsed.data.display_name, phone: parsed.data.phone },
  });

  revalidatePath("/users");
  revalidatePath(`/users/${parsed.data.id}`);
  return { ok: true, message: "Utilizador atualizado." };
}

export async function deleteUserAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "ID em falta." };

  if (!hasServiceRole()) {
    return {
      ok: false,
      message:
        "Configura SUPABASE_SERVICE_ROLE_KEY em .env.local para poder eliminar utilizadores do Auth.",
    };
  }

  const admin = createSupabaseServiceClient();
  const { error: authErr } = await admin.auth.admin.deleteUser(id);
  if (authErr) return { ok: false, message: authErr.message };

  await logAudit({ action: "user.delete", entity: "users", entityId: id });
  revalidatePath("/users");
  return { ok: true, message: "Utilizador eliminado." };
}

export async function promoteAdminAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdmin();
  if (session.role !== "super_admin") {
    return { ok: false, message: "Só super admins podem promover." };
  }
  const id = String(formData.get("id") ?? "");
  const email = String(formData.get("email") ?? "");
  const role = String(formData.get("role") ?? "admin");
  if (!id) return { ok: false, message: "ID em falta." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("admin_users")
    .upsert({ user_id: id, email, role, created_by: session.userId });
  if (error) return { ok: false, message: error.message };

  await logAudit({
    action: "admin.promote",
    entity: "admin_users",
    entityId: id,
    payload: { role },
  });
  revalidatePath("/users");
  revalidatePath("/admins");
  return { ok: true, message: `Promovido a ${role}.` };
}

export async function demoteAdminAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdmin();
  if (session.role !== "super_admin") {
    return { ok: false, message: "Só super admins podem revogar." };
  }
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "ID em falta." };

  if (id === session.userId) {
    return { ok: false, message: "Não podes revogar a tua própria conta." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("admin_users")
    .delete()
    .eq("user_id", id);
  if (error) return { ok: false, message: error.message };

  await logAudit({
    action: "admin.demote",
    entity: "admin_users",
    entityId: id,
  });
  revalidatePath("/users");
  revalidatePath("/admins");
  return { ok: true, message: "Permissões revogadas." };
}

export async function sendPasswordResetAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const email = String(formData.get("email") ?? "");
  if (!email) return { ok: false, message: "E-mail em falta." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return { ok: false, message: error.message };

  await logAudit({
    action: "user.password_reset",
    entity: "users",
    payload: { email },
  });
  return { ok: true, message: "E-mail de reposição enviado." };
}
