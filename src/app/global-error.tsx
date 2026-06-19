"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-kumbu-bg px-4 text-center text-kumbu-ink">
        <h1 className="text-xl font-semibold">Erro no painel admin</h1>
        <p className="max-w-md text-sm text-slate-600">
          O incidente foi registado. Recarregue ou tente novamente.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-kumbu-red px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
