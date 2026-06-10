"use client";

import { useState } from "react";
import {
  updateMonetizationSettingsAction,
  updatePaymentProviderAction,
} from "../actions";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

type Props = {
  settings: Record<string, unknown>;
  providers: unknown[];
};

export function MonetizationSettingsClient({ settings: initialSettings, providers: initialProviders }: Props) {
  const [settings, setSettings] = useState(asRecord(initialSettings));
  const [providers, setProviders] = useState(initialProviders.map(asRecord));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function saveSettings() {
    setBusy(true);
    setMessage(null);
    try {
      const updated = await updateMonetizationSettingsAction({
        paymentSlaHours: settings.payment_sla_hours,
        companyLegalName: settings.company_legal_name,
        supportEmail: settings.support_email,
      });
      setSettings(asRecord(updated));
      setMessage("Definições guardadas.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erro ao guardar.");
    } finally {
      setBusy(false);
    }
  }

  async function saveProvider(provider: Record<string, unknown>) {
    const id = String(provider.id ?? "");
    setBusy(true);
    try {
      const updated = await updatePaymentProviderAction(id, {
        accountNumber: provider.account_number,
        accountName: provider.account_name,
        instructions: provider.instructions,
        active: provider.active !== false,
      });
      setProviders((prev) => prev.map((p) => (String(p.id) === id ? asRecord(updated) : p)));
      setMessage("Provedor actualizado.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erro ao actualizar provedor.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {message && <p className="text-sm text-emerald-700">{message}</p>}

      <section className="kumbu-card p-5 space-y-3">
        <h2 className="text-lg font-bold">Empresa & SLA</h2>
        <label className="block text-sm">
          Nome legal
          <input
            className="kumbu-input mt-1 w-full"
            value={String(settings.company_legal_name ?? "")}
            onChange={(e) => setSettings((s) => ({ ...s, company_legal_name: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          Email suporte
          <input
            className="kumbu-input mt-1 w-full"
            value={String(settings.support_email ?? "")}
            onChange={(e) => setSettings((s) => ({ ...s, support_email: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          SLA pagamentos (horas)
          <input
            type="number"
            className="kumbu-input mt-1 w-full"
            value={String(settings.payment_sla_hours ?? 24)}
            onChange={(e) => setSettings((s) => ({ ...s, payment_sla_hours: Number(e.target.value) }))}
          />
        </label>
        <button type="button" className="kumbu-btn-primary" disabled={busy} onClick={() => void saveSettings()}>
          Guardar definições
        </button>
      </section>

      <section className="kumbu-card p-5 space-y-4">
        <h2 className="text-lg font-bold">Contas de recebimento (Multicaixa, etc.)</h2>
        {providers.map((p) => {
          const id = String(p.id ?? "");
          return (
            <div key={id} className="rounded-lg border p-4 space-y-2">
              <p className="font-semibold">{String(p.name ?? id)}</p>
              <label className="block text-sm">
                Nº conta
                <input
                  className="kumbu-input mt-1 w-full"
                  defaultValue={String(p.account_number ?? "")}
                  onBlur={(e) => {
                    p.account_number = e.target.value;
                  }}
                />
              </label>
              <label className="block text-sm">
                Titular
                <input
                  className="kumbu-input mt-1 w-full"
                  defaultValue={String(p.account_name ?? "")}
                  onBlur={(e) => {
                    p.account_name = e.target.value;
                  }}
                />
              </label>
              <label className="block text-sm">
                Instruções
                <textarea
                  className="kumbu-input mt-1 w-full min-h-[80px]"
                  defaultValue={String(p.instructions ?? "")}
                  onBlur={(e) => {
                    p.instructions = e.target.value;
                  }}
                />
              </label>
              <button
                type="button"
                className="kumbu-btn-secondary text-sm"
                disabled={busy}
                onClick={() => void saveProvider(p)}
              >
                Guardar {String(p.name ?? "provedor")}
              </button>
            </div>
          );
        })}
      </section>
    </div>
  );
}
