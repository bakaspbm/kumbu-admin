"use client";

import type { ActionState } from "@/lib/action-state";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { deleteHolidayAction, upsertHolidayAction } from "./holiday-actions";
import { FeedbackBanner } from "@/components/ui/toast";
import type { HolidayCampaign } from "@/lib/types";

function Submit({
  icon: Icon,
  children,
  className = "kumbu-btn-primary",
}: {
  icon: typeof Save;
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | boolean;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  if (type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name={name}
          defaultChecked={Boolean(defaultValue)}
          className="h-4 w-4 rounded border-slate-300 text-kumbu-red"
        />
        {label}
      </label>
    );
  }

  return (
    <label className="block space-y-1.5">
      <span className="kumbu-label">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue == null ? undefined : String(defaultValue)}
        required={required}
        className="kumbu-input"
      />
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export function HolidayForm({ campaign, isNew }: { campaign?: HolidayCampaign; isNew?: boolean }) {
  const [state, action] = useActionState<ActionState, FormData>(upsertHolidayAction, null);
  const [, del] = useActionState<ActionState, FormData>(deleteHolidayAction, null);

  return (
    <div className="kumbu-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="kumbu-label">{isNew ? "Novo feriado" : "Feriado"}</p>
          <h3 className="text-base font-semibold text-kumbu-ink">
            {campaign?.name ?? "Campanha sazonal"}
          </h3>
        </div>
        {!isNew && campaign ? (
          <form action={del}>
            <input type="hidden" name="id" value={campaign.id} />
            <Submit icon={Trash2} className="kumbu-btn-secondary text-rose-700">
              Eliminar
            </Submit>
          </form>
        ) : null}
      </div>

      <form action={action} className="grid gap-4 sm:grid-cols-2">
        <FeedbackBanner feedback={state} />
        <Field label="ID" name="id" defaultValue={campaign?.id} required hint="ex.: natal_2026" />
        <Field label="Nome" name="name" defaultValue={campaign?.name} required />
        <Field
          label="Data (MM-DD)"
          name="month_day"
          defaultValue={campaign?.month_day}
          required
          hint="Repete todos os anos"
        />
        <label className="block space-y-1.5">
          <span className="kumbu-label">Âmbito</span>
          <select
            name="scope"
            defaultValue={campaign?.scope ?? "national"}
            className="kumbu-input"
          >
            <option value="national">Nacional</option>
            <option value="international">Internacional</option>
          </select>
        </label>
        <Field
          label="País (código)"
          name="country_code"
          defaultValue={campaign?.country_code ?? ""}
          hint="Ex.: AO para Angola"
        />
        <label className="block space-y-1.5 sm:col-span-2">
          <span className="kumbu-label">Mensagem na app</span>
          <textarea
            name="message"
            defaultValue={campaign?.message ?? ""}
            rows={2}
            className="kumbu-input"
            required
          />
        </label>
        <label className="block space-y-1.5">
          <span className="kumbu-label">Modo de exibição</span>
          <select
            name="display_mode"
            defaultValue={campaign?.display_mode ?? "banner"}
            className="kumbu-input"
          >
            <option value="banner">Banner / mensagem</option>
            <option value="theme">Tema (cores)</option>
            <option value="both">Banner + tema</option>
          </select>
        </label>
        <Field label="Ordem" name="sort_order" type="number" defaultValue={campaign?.sort_order ?? 10} />
        <Field label="Cor inicial (HEX)" name="gradient_from" defaultValue={campaign?.gradient_from ?? "1565C0"} />
        <Field label="Cor final (HEX)" name="gradient_to" defaultValue={campaign?.gradient_to ?? "0D47A1"} />
        <div className="sm:col-span-2">
          <Field label="Activo" name="active" type="checkbox" defaultValue={campaign?.active !== false} />
        </div>
        <div className="sm:col-span-2">
          <Submit icon={isNew ? Plus : Save}>{isNew ? "Criar feriado" : "Guardar"}</Submit>
        </div>
      </form>
    </div>
  );
}
