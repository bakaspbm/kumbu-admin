import { redirect } from "next/navigation";
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
export async function requireAdmin(): Promise<AdminSession> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("user_id, email, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !admin) redirect("/forbidden");

  return {
    userId: admin.user_id,
    email: admin.email,
    role: admin.role as AdminRole,
  };
}

export async function getOptionalAdmin(): Promise<AdminSession | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: admin } = await supabase
      .from("admin_users")
      .select("user_id, email, role")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!admin) return null;
    return {
      userId: admin.user_id,
      email: admin.email,
      role: admin.role as AdminRole,
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
