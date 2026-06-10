"use client";

import { useState } from "react";
import { updateCategoryStrategyAction } from "../actions";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

type Props = {
  matrix: Record<string, unknown>;
};

export function MonetizationCategoriesClient({ matrix: initial }: Props) {
  const [matrix, setMatrix] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const rows = (matrix.categories as unknown[] | undefined)?.map(asRecord) ?? [];

  async function saveRow(row: Record<string, unknown>) {
    const categoryId = String(row.category_id ?? "");
    setBusy(categoryId);
    try {
      const fresh = await updateCategoryStrategyAction(categoryId, {
        strategyTitle: row.strategy_title,
        ctaMessage: row.cta_message,
        isActive: row.is_active !== false,
      });
      setMatrix(fresh);
      setMessage("Estratégia actualizada.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erro ao guardar.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{String(matrix.rule ?? "")}</p>
      {message && <p className="text-sm text-emerald-700">{message}</p>}
      <div className="space-y-4">
        {rows.map((row) => {
          const id = String(row.category_id ?? "");
          const products = (row.products as unknown[] | undefined) ?? [];
          return (
            <section key={id} className="kumbu-card p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold">{String(row.strategy_title ?? id)}</h3>
                  <p className="text-xs text-muted-foreground">
                    {id} · {String(row.primary_monetization ?? "")} · tier{" "}
                    {String(row.revenue_tier ?? "—")}
                  </p>
                </div>
                <span className="text-xs font-semibold">
                  {row.is_active === false ? "Inactiva" : "Activa"}
                </span>
              </div>
              <p className="text-sm">{String(row.cta_message ?? "")}</p>
              {products.length > 0 && (
                <ul className="text-xs text-muted-foreground">
                  {products.map((p) => {
                    const pr = asRecord(p);
                    return (
                      <li key={String(pr.id)}>
                        {String(pr.name)} — {String(pr.price_label ?? pr.price_kz)}
                      </li>
                    );
                  })}
                </ul>
              )}
              <button
                type="button"
                className="kumbu-btn-secondary text-sm"
                disabled={busy === id}
                onClick={() => {
                  const title = prompt("Título da estratégia:", String(row.strategy_title ?? ""));
                  const cta = prompt("Mensagem CTA:", String(row.cta_message ?? ""));
                  if (title == null && cta == null) return;
                  void saveRow({
                    ...row,
                    strategy_title: title ?? row.strategy_title,
                    cta_message: cta ?? row.cta_message,
                  });
                }}
              >
                Editar estratégia
              </button>
            </section>
          );
        })}
      </div>
    </div>
  );
}
