import { redirect } from "next/navigation";
import { getAdminRecord } from "@/lib/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminRole = "super_admin" | "admin" | "support";

export interface AdminSession {
  userId: string;
  email: string;
  role: AdminRole;
}

/**
 * Garante que existe sessão e que o utilizador é admin. Caso contrário
 * redireciona para /login (ou /forbidden quando autenticado mas sem permissão).
 */
export async function requireSuperAdmin(): Promise<AdminSession> {
  const session = await requireAdmin();
  if (session.role !== "super_admin") redirect("/dashboard");
  return session;
}

export async function requireAdmin(): Promise<AdminSession> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = await getAdminRecord(supabase, user.id);
  if (!admin) redirect("/forbidden");

  return {
    userId: admin.user_id,
    email: admin.email,
    role: admin.role,
  };
}

export async function getOptionalAdmin(): Promise<AdminSession | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const admin = await getAdminRecord(supabase, user.id);
    if (!admin) return null;
    return {
      userId: admin.user_id,
      email: admin.email,
      role: admin.role,
    };
  } catch {
    return null;
  }
}

export async function logAudit(input: {
  action: string;
  entity?: string;
  entityId?: string;
  payload?: Record<string, unknown>;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("admin_audit_log").insert({
      actor_id: user.id,
      actor_email: user.email ?? null,
      action: input.action,
      entity: input.entity ?? null,
      entity_id: input.entityId ?? null,
      payload: input.payload ?? {},
    });
  } catch {
    // não bloqueia o fluxo principal por causa de auditoria
  }
}
