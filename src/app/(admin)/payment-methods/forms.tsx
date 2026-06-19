"use client";


import type { ActionState } from "@/lib/action-state";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2, Plus, Save, Trash2 } from "lucide-react";
import {
  upsertPaymentAction,
  deletePaymentAction,
} from "./actions";
import { FeedbackBanner } from "@/components/ui/toast";
import type { PaymentMethod } from "@/lib/types";

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
  defaultValue?: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="kumbu-label">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="kumbu-input"
      />
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export function PaymentForm({
  method,
  isNew,
}: {
  method?: PaymentMethod;
  isNew?: boolean;
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    upsertPaymentAction,
    null
  );
  const [, del, isDeleting] = useActionState<ActionState, FormData>(
    deletePaymentAction,
    null
  );
  return (
    <div className="kumbu-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{isNew ? "Novo método" : method?.label}</p>
        {!isNew && method?.is_default && (
          <span className="kumbu-badge bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Por defeito
          </span>
        )}
      </div>
      <FeedbackBanner feedback={state} />
      <form action={action} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field
            label="ID"
            name="id"
            defaultValue={method?.id ?? ""}
            required
            hint="ex.: paypay"
          />
          <Field
            label="Etiqueta"
            name="label"
            defaultValue={method?.label ?? ""}
            required
          />
          <Field
            label="Ícone (Material)"
            name="icon_key"
            defaultValue={method?.icon_key ?? "credit_card_rounded"}
            required
          />
          <Field
            label="Ordem"
            name="sort_order"
            type="number"
            defaultValue={String(method?.sort_order ?? 10)}
          />
          <label className="inline-flex items-center gap-2 mt-7">
            <input
              type="checkbox"
              name="is_default"
              defaultChecked={method?.is_default ?? false}
              className="h-4 w-4 rounded border-slate-300 text-kumbu-red"
            />
            <span className="text-sm font-medium">Pré-selecionado</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Submit icon={isNew ? Plus : Save}>
            {isNew ? "Criar" : "Guardar"}
          </Submit>
          {!isNew && method && (
            <button
              type="submit"
              formAction={del}
              disabled={isDeleting}
              className="kumbu-btn-danger"
              onClick={(e) => {
                if (!confirm("Eliminar este método?")) e.preventDefault();
              }}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Eliminar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
