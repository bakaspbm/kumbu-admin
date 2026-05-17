"use server";

import { redirect } from "next/navigation";
import { getAdminRecord } from "@/lib/admin-access";
import { createAdminAccount, getBootstrapStatus } from "@/lib/admin-setup";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginState =
  | { error?: string; success?: never; redirectTo?: never }
  | { success: true; redirectTo: string; error?: never }
  | undefined;

export type BootstrapState =
  | { error?: string; success?: never; redirectTo?: never }
  | { success: true; redirectTo: string; error?: never }
  | undefined;

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) {
    return { error: "Indica o e-mail e a palavra-passe." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: "Credenciais inválidas." };
  }

  const admin = await getAdminRecord(supabase, data.user.id);

  if (!admin) {
    await supabase.auth.signOut();
    return {
      error:
        "Esta conta não tem permissões de administrador. Contacta um super admin.",
    };
  }

  const redirectTo = next.startsWith("/") ? next : "/dashboard";
  return { success: true, redirectTo };
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Cria o primeiro super admin quando ainda não existe nenhum em admin_users.
 * Só disponível no ecrã de login (bootstrap único).
 */
export async function bootstrapAdminAction(
  _prev: BootstrapState,
  formData: FormData
): Promise<BootstrapState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) {
    return { error: "E-mail e palavra-passe são obrigatórios." };
  }
  if (password.length < 8) {
    return { error: "A palavra-passe deve ter pelo menos 8 caracteres." };
  }
  if (password !== confirm) {
    return { error: "As palavras-passe não coincidem." };
  }

  const { needsBootstrap, canBootstrap } = await getBootstrapStatus();
  if (!canBootstrap) {
    return {
      error:
        "Configura SUPABASE_SERVICE_ROLE_KEY em .env.local e reinicia o servidor.",
    };
  }
  if (!needsBootstrap) {
    return {
      error:
        "Já existem administradores. Usa Entrar ou pede a um super admin para te convidar.",
    };
  }

  const created = await createAdminAccount({
    email,
    password,
    role: "super_admin",
  });
  if ("error" in created) {
    return { error: created.error };
  }

  const supabase = await createSupabaseServerClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInErr) {
    return {
      error:
        "Conta criada, mas o login automático falhou. Entra manualmente com as mesmas credenciais.",
    };
  }

  const redirectTo = next.startsWith("/") ? next : "/dashboard";
  return { success: true, redirectTo };
}
