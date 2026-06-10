"use client";

import { useState } from "react";
import { updateMonetizationProductAction } from "../actions";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

type Props = {
  products: unknown[];
};

export function MonetizationProductsClient({ products: initial }: Props) {
  const [products, setProducts] = useState(initial.map(asRecord));
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function toggleActive(product: Record<string, unknown>) {
    const id = String(product.id ?? "");
    setBusy(id);
    try {
      const updated = await updateMonetizationProductAction(id, {
        active: product.is_active === false,
      });
      setProducts((prev) => prev.map((p) => (String(p.id) === id ? asRecord(updated) : p)));
      setMessage("Plano actualizado.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erro ao actualizar.");
    } finally {
      setBusy(null);
    }
  }

  async function savePrice(product: Record<string, unknown>, priceKz: string) {
    const id = String(product.id ?? "");
    const value = Number(priceKz.replace(/\D/g, ""));
    if (!value) return;
    setBusy(id);
    try {
      const updated = await updateMonetizationProductAction(id, { priceKz: value });
      setProducts((prev) => prev.map((p) => (String(p.id) === id ? asRecord(updated) : p)));
      setMessage("Preço actualizado.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erro ao actualizar preço.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {message && <p className="text-sm text-emerald-700">{message}</p>}
      <div className="kumbu-card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-3">ID</th>
              <th className="p-3">Nome</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Activo</th>
              <th className="p-3">Acções</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const id = String(p.id ?? "");
              return (
                <tr key={id} className="border-b">
                  <td className="p-3 font-mono text-xs">{id}</td>
                  <td className="p-3">{String(p.name ?? "—")}</td>
                  <td className="p-3">{String(p.feature_type ?? "—")}</td>
                  <td className="p-3">{String(p.price_label ?? p.price_kz ?? "—")}</td>
                  <td className="p-3">{p.is_active === false ? "Não" : "Sim"}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="kumbu-btn-secondary text-xs"
                        disabled={busy === id}
                        onClick={() => void toggleActive(p)}
                      >
                        {p.is_active === false ? "Activar" : "Desactivar"}
                      </button>
                      <button
                        type="button"
                        className="kumbu-btn-secondary text-xs"
                        disabled={busy === id}
                        onClick={() => {
                          const next = prompt("Novo preço (Kz):", String(p.price_kz ?? ""));
                          if (next) void savePrice(p, next);
                        }}
                      >
                        Editar preço
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">Nenhum plano premium configurado.</p>
        )}
      </div>
    </div>
  );
}
