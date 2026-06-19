"use client";

import { useState } from "react";
import {
  confirmPaymentAction,
  disableChargingAction,
  enableChargingAction,
  refreshMetricsAction,
  rejectPaymentAction,
} from "./actions";
import { GrowthGatePanel } from "@/components/monetization/growth-gate-panel";

type Props = {
  overview: Record<string, unknown>;
  gate: Record<string, unknown>;
  pendingPayments: unknown[];
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export function MonetizationOverview({ overview, gate, pendingPayments }: Props) {
  const [busy, setBusy] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const settings = asRecord(overview.settings);
  const routine = asRecord(overview.routine);
  const metrics = asRecord(overview.key_metrics);

  async function run(action: () => Promise<unknown>, label: string) {
    setBusy(label);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await action();
      setSuccessMessage(`${label} concluído.`);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Não foi possível concluir esta acção. Tente novamente.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <GrowthGatePanel gate={gate} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cobrança activa" value={settings.charging_enabled ? "Sim" : "Não"} />
        <StatCard label="Gate pronto" value={gate.gate_ready ? "Sim" : "Não"} />
        <StatCard label="DAU" value={String(metrics.dau ?? "—")} />
        <StatCard label="Pagamentos pendentes" value={String(pendingPayments.length)} />
      </div>

      <section className="kumbu-card p-5 space-y-3">
        <h2 className="text-lg font-bold">Rotina admin</h2>
        <p className="text-sm text-muted-foreground">
          {String(routine.weekly ?? "Segunda: rever overview, confirmar pagamentos >24h, rever preços mensalmente.")}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="kumbu-btn-primary"
            disabled={!!busy}
            onClick={() => run(() => refreshMetricsAction(), "Actualizar métricas")}
          >
            Actualizar métricas
          </button>
          <button
            type="button"
            className="kumbu-btn-secondary"
            disabled={!!busy || Boolean(settings.charging_enabled)}
            onClick={() => run(() => enableChargingAction(), "Activar cobrança")}
          >
            Activar cobrança
          </button>
          <button
            type="button"
            className="kumbu-btn-secondary"
            disabled={!!busy || !settings.charging_enabled}
            onClick={() => run(() => disableChargingAction(), "Desactivar cobrança")}
          >
            Desactivar cobrança
          </button>
        </div>
        {successMessage ? (
          <p className="text-sm text-emerald-700">{successMessage}</p>
        ) : null}
        {errorMessage ? (
          <p className="text-sm text-red-700">{errorMessage}</p>
        ) : null}
      </section>

      <section className="kumbu-card p-5">
        <h2 className="text-lg font-bold mb-3">Pagamentos pendentes</h2>
        {pendingPayments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum pagamento aguarda confirmação.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 pr-3">Referência</th>
                  <th className="py-2 pr-3">Valor</th>
                  <th className="py-2 pr-3">Estado</th>
                  <th className="py-2">Acções</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.map((raw, idx) => {
                  const row = asRecord(raw);
                  const id = String(row.id ?? idx);
                  return (
                    <tr key={id} className="border-b border-border/60">
                      <td className="py-2 pr-3">{String(row.reference_code ?? id)}</td>
                      <td className="py-2 pr-3">{String(row.amount_label ?? row.amount_kz ?? "—")}</td>
                      <td className="py-2 pr-3">{String(row.status ?? "—")}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="kumbu-btn-primary text-xs px-3 py-1.5"
                            disabled={!!busy}
                            onClick={() =>
                              run(() => confirmPaymentAction(id), "Confirmar pagamento")
                            }
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            className="kumbu-btn-secondary text-xs px-3 py-1.5"
                            disabled={!!busy}
                            onClick={() =>
                              run(
                                () => rejectPaymentAction(id, "Comprovativo inválido"),
                                "Rejeitar pagamento",
                              )
                            }
                          >
                            Rejeitar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="kumbu-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
