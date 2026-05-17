import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminRole } from "@/lib/auth";
import { hasServiceRole } from "@/lib/env";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export type AdminRecord = {
  user_id: string;
  email: string;
  role: AdminRole;
};

/**
 * Obtém o registo de admin do utilizador autenticado.
 * Usa RPC `admin_me` (security definer) para evitar falhas de RLS no login.
 */
export async function getAdminRecord(
  supabase: SupabaseClient,
  userId: string
): Promise<AdminRecord | null> {
  const { data: rpcRows, error: rpcError } = await supabase.rpc("admin_me");
  if (!rpcError && rpcRows?.[0]) {
    const row = rpcRows[0] as AdminRecord;
    if (row.user_id === userId) return row;
  }

  const { data: row, error } = await supabase
    .from("admin_users")
    .select("user_id, email, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (!error && row) {
    return {
      user_id: row.user_id,
      email: row.email,
      role: row.role as AdminRole,
    };
  }

  // Fallback servidor: confirma em admin_users quando RLS/RPC ainda não estão corrigidos
  if (hasServiceRole()) {
    try {
      const service = createSupabaseServiceClient();
      const { data: svcRow } = await service
        .from("admin_users")
        .select("user_id, email, role")
        .eq("user_id", userId)
        .maybeSingle();
      if (svcRow) {
        return {
          user_id: svcRow.user_id,
          email: svcRow.email,
          role: svcRow.role as AdminRole,
        };
      }
    } catch {
      // ignora
    }
  }

  return null;
}
