function required(value: string | undefined, name: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error(
      `[kumbu-admin] Variável de ambiente em falta: ${name}. Verifica .env.local.`
    );
  }
  return value;
}

export const env = {
  supabaseUrl: required(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL"
  ),
  supabaseAnonKey: required(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ),
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  superAdminEmail: process.env.SUPER_ADMIN_EMAIL?.trim() || "admin@kumbu.app",
} as const;

export function hasServiceRole(): boolean {
  return env.serviceRoleKey.trim().length > 0;
}
