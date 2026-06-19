"use server";

import { sanitizeInternalPath } from "@/lib/auth/safe-redirect";
import { redirect } from "next/navigation";
import { loginWithKumbuApi, logoutFromKumbuApi, clearKumbuApiAuthCookies } from "@/lib/kumbu-api/auth";
import { toLoginError } from "@/lib/kumbu-api/errors";
import type { BootstrapState, LoginState } from "@/lib/action-state";

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const next = String(formData.get("next") ?? "/dashboard");

    if (!email || !password) {
      return { error: "Indica o e-mail e a palavra-passe." };
    }

    const response = await loginWithKumbuApi({ email, password });
    if (!response.admin) {
      await clearKumbuApiAuthCookies();
      return {
        error:
          "Esta conta não tem permissões de administrador. Contacta um super admin.",
      };
    }

    const redirectTo = sanitizeInternalPath(next, "/dashboard");
    return { success: true, redirectTo };
  } catch (e) {
    return toLoginError(e);
  }
}

export async function logoutAction() {
  await logoutFromKumbuApi();
  redirect("/login");
}

/** Bootstrap é feito automaticamente pelo backend na primeira execução. */
export async function bootstrapAdminAction(): Promise<BootstrapState> {
  return {
    error:
      "O super admin é criado automaticamente pelo backend. Usa as credenciais definidas em KUMBU_ADMIN_EMAIL / KUMBU_ADMIN_PASSWORD.",
  };
}
