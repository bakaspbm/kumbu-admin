import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Em Server Components puros (sem route handler) o set é ignorado.
        }
      },
    },
  });
}

/**
 * Cliente com SERVICE ROLE — usa APENAS em server actions / route handlers.
 * Nunca importes este módulo em código de browser.
 */
export function createSupabaseServiceClient() {
  if (!env.serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY em falta. Define-a em .env.local para operações privilegiadas."
    );
  }
  return createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
