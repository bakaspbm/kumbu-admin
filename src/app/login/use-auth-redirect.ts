"use client";

import { useEffect } from "react";
import { sanitizeInternalPath } from "@/lib/auth/safe-redirect";

/** Navegação completa após login/bootstrap — garante cookies e termina o estado pending do formulário. */
export function useAuthRedirect(
  state: { success?: boolean; redirectTo?: string } | undefined
) {
  useEffect(() => {
    if (state?.success && state.redirectTo) {
      window.location.assign(sanitizeInternalPath(state.redirectTo, "/dashboard"));
    }
  }, [state]);
}
