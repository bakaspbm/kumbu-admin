import { hasServiceRole } from "@/lib/env";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export type BootstrapStatus = {
  needsBootstrap: boolean;
  canBootstrap: boolean;
  /** false quando a tabela admin_users ainda não existe no Supabase */
  schemaReady: boolean;
};

const SCHEMA_SETUP_HINT =
  "Executa supabase/admin_schema_minimal.sql no SQL Editor do Supabase (Dashboard → SQL → New query → colar → Run). Depois recarrega esta página.";

function isMissingAdminTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    (error.message?.includes("admin_users") &&
      error.message?.includes("schema cache")) === true
  );
}

/** Verifica se ainda não existe nenhum administrador (requer service role). */
export async function getBootstrapStatus(): Promise<BootstrapStatus> {
  if (!hasServiceRole()) {
    return { needsBootstrap: false, canBootstrap: false, schemaReady: false };
  }
  try {
    const admin = createSupabaseServiceClient();
    const { count, error } = await admin
      .from("admin_users")
      .select("*", { count: "exact", head: true });
    if (isMissingAdminTable(error)) {
      return {
        needsBootstrap: true,
        canBootstrap: false,
        schemaReady: false,
      };
    }
    if (error) {
      return { needsBootstrap: false, canBootstrap: true, schemaReady: true };
    }
    return {
      needsBootstrap: (count ?? 0) === 0,
      canBootstrap: true,
      schemaReady: true,
    };
  } catch {
    return { needsBootstrap: false, canBootstrap: false, schemaReady: false };
  }
}

export async function createAdminAccount(input: {
  email: string;
  password: string;
  role: "super_admin" | "admin" | "support";
  createdBy?: string | null;
}): Promise<{ userId: string } | { error: string }> {
  if (!hasServiceRole()) {
    return {
      error:
        "Configura SUPABASE_SERVICE_ROLE_KEY em .env.local para criar administradores.",
    };
  }

  const admin = createSupabaseServiceClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });
  if (error || !data.user) {
    return { error: error?.message ?? "Falha ao criar utilizador." };
  }

  const { error: insErr } = await admin.from("admin_users").insert({
    user_id: data.user.id,
    email: input.email,
    role: input.role,
    created_by: input.createdBy ?? data.user.id,
  });
  if (insErr) {
    await admin.auth.admin.deleteUser(data.user.id);
    if (isMissingAdminTable(insErr)) {
      return { error: SCHEMA_SETUP_HINT };
    }
    return { error: insErr.message };
  }

  return { userId: data.user.id };
}
