"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type ActionResult = { ok?: boolean } | null | undefined;

/** Após server action com sucesso, actualiza RSC sem F5. */
export function useRouterRefreshOnActions(...states: ActionResult[]) {
  const router = useRouter();
  const ok = states.some((s) => s?.ok);

  useEffect(() => {
    if (ok) router.refresh();
  }, [ok, router]);
}
