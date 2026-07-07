import { redirect } from "next/navigation";
import { adminMe } from "@/lib/kumbu-api/admin";
import { KumbuApiError, kumbuApiFetch } from "@/lib/kumbu-api/server-client";
import { readAdminAccessToken } from "@/lib/kumbu-api/admin-session";

export type AdminRole = "super_admin" | "admin" | "support";

export interface AdminSession {
  userId: string;
  email: string;
  role: AdminRole;
}

export async function requireSuperAdmin(): Promise<AdminSession> {
  const session = await requireAdmin();
  if (session.role !== "super_admin") redirect("/dashboard");
  return session;
}

export async function requireAdmin(): Promise<AdminSession> {
  const token = await readAdminAccessToken();
  if (!token) {
    redirect("/login?expired=1");
  }

  try {
    const me = await adminMe();
    return {
      userId: me.userId,
      email: me.email,
      role: (me.role as AdminRole | undefined) ?? "admin",
    };
  } catch (error) {
    if (error instanceof KumbuApiError) {
      if (error.status === 401) redirect("/login?expired=1");
      if (error.status === 403) redirect("/forbidden");
    }
    redirect("/login");
  }
}

export async function getOptionalAdmin(): Promise<AdminSession | null> {
  try {
    const token = await readAdminAccessToken();
    if (!token) return null;
    const me = await adminMe();
    return {
      userId: me.userId,
      email: me.email,
      role: (me.role as AdminRole | undefined) ?? "admin",
    };
  } catch {
    return null;
  }
}

export async function resolveAdminAction(): Promise<
  { ok: true; session: AdminSession } | { ok: false; error: string }
> {
  const session = await getOptionalAdmin();
  if (!session) {
    return {
      ok: false,
      error: "Sessão expirada ou sem permissão. Entra novamente no painel.",
    };
  }
  return { ok: true, session };
}

export async function resolveSuperAdminAction(): Promise<
  { ok: true; session: AdminSession } | { ok: false; error: string }
> {
  const auth = await resolveAdminAction();
  if (!auth.ok) return auth;
  if (auth.session.role !== "super_admin") {
    return { ok: false, error: "Apenas super admins podem executar esta acção." };
  }
  return auth;
}

export async function logAudit(input: {
  action: string;
  entity?: string;
  entityId?: string;
  payload?: Record<string, unknown>;
}) {
  try {
    await kumbuApiFetch<void>(
      "/admin/system/audit-log",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: input.action,
          entity: input.entity ?? null,
          entity_id: input.entityId ?? null,
          payload: input.payload ?? {},
        }),
      },
      { withAuth: true },
    );
  } catch {
    // não bloqueia o fluxo principal por causa de auditoria
  }
}
