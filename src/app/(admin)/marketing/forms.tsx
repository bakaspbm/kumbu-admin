"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import {
  upsertMarketingAction,
  deleteMarketingAction,
  type ActionState,
} from "./actions";
import { FeedbackBanner } from "@/components/ui/toast";
import type { MarketingBlock } from "@/lib/types";

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
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
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

export function MarketingForm({
  block,
  isNew,
}: {
  block?: MarketingBlock;
  isNew?: boolean;
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    upsertMarketingAction,
    null
  );
  const [, del] = useActionState<ActionState, FormData>(
    deleteMarketingAction,
    null
  );

  return (
    <div className="kumbu-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {isNew ? "Novo bloco" : block?.title}
        </p>
        {!isNew && block && (
          <form
            action={del}
            onSubmit={(e) => {
              if (!confirm("Eliminar este bloco?")) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={block.id} />
            <Submit icon={Trash2} className="kumbu-btn-danger text-xs py-1.5">
              Eliminar
            </Submit>
          </form>
        )}
      </div>
      <FeedbackBanner feedback={state} />
      <form action={action} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field
            label="ID"
            name="id"
            defaultValue={block?.id ?? ""}
            required
            hint="ex.: hero-main"
          />
          <label className="block space-y-1.5">
            <span className="kumbu-label">Tipo</span>
            <select
              name="kind"
              defaultValue={block?.kind ?? "hero"}
              className="kumbu-input"
            >
              <option value="hero">Hero</option>
              <option value="offers">Offers</option>
            </select>
          </label>
          <Field
            label="Ordem"
            name="sort_order"
            type="number"
            defaultValue={String(block?.sort_order ?? 10)}
          />
        </div>
        <Field
          label="Título"
          name="title"
          defaultValue={block?.title ?? ""}
          required
        />
        <Field
          label="Subtítulo"
          name="subtitle"
          defaultValue={block?.subtitle ?? ""}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Cor inicial (hex)"
            name="gradient_from"
            defaultValue={block?.gradient_from ?? "1565C0"}
          />
          <Field
            label="Cor final (hex)"
            name="gradient_to"
            defaultValue={block?.gradient_to ?? "0D47A1"}
          />
        </div>
        <Submit icon={isNew ? Plus : Save}>
          {isNew ? "Criar bloco" : "Guardar"}
        </Submit>
      </form>
      {block && (
        <div
          className="mt-3 rounded-card p-5 text-white"
          style={{
            background: `linear-gradient(90deg, #${block.gradient_from}, #${block.gradient_to})`,
          }}
        >
          <p className="text-xs uppercase tracking-widest opacity-80">
            {block.kind === "hero" ? "Hero" : "Ofertas"}
          </p>
          <h3 className="text-lg font-bold leading-tight">{block.title}</h3>
          <p className="text-sm opacity-90">{block.subtitle}</p>
        </div>
      )}
    </div>
  );
}
