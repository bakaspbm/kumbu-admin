"use client";

import { useState } from "react";
import { seedLegalDocumentsAction } from "./actions";

export function SeedLegalButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={loading}
        className="kumbu-btn-secondary"
        onClick={() => {
          setLoading(true);
          setMessage(null);
          void seedLegalDocumentsAction().then((r) => {
            setLoading(false);
            const result = r ?? undefined;
            setMessage(result?.message ?? (result?.ok ? "OK" : "Erro"));
          });
        }}
      >
        {loading ? "A importar…" : "Importar textos por defeito"}
      </button>
      {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
    </div>
  );
}
