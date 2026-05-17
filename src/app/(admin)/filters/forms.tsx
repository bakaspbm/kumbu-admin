"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import {
  upsertFilterAction,
  deleteFilterAction,
  type ActionState,
} from "./actions";
import { FeedbackBanner } from "@/components/ui/toast";
import type { CategorySortFilter } from "@/lib/types";

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

export function FilterForm({
  filter,
  isNew,
}: {
  filter?: CategorySortFilter;
  isNew?: boolean;
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    upsertFilterAction,
    null
  );
  const [, del] = useActionState<ActionState, FormData>(
    deleteFilterAction,
    null
  );
  return (
    <div className="kumbu-card p-4 space-y-3">
      <p className="text-sm font-semibold">
        {isNew ? "Novo filtro" : filter?.label}
      </p>
      <FeedbackBanner feedback={state} />
      <form action={action} className="grid gap-3 sm:grid-cols-5 items-end">
        <label className="space-y-1.5">
          <span className="kumbu-label">ID</span>
          <input
            name="id"
            defaultValue={filter?.id ?? ""}
            required
            className="kumbu-input"
          />
        </label>
        <label className="space-y-1.5">
          <span className="kumbu-label">Etiqueta</span>
          <input
            name="label"
            defaultValue={filter?.label ?? ""}
            required
            className="kumbu-input"
          />
        </label>
        <label className="space-y-1.5">
          <span className="kumbu-label">Modo</span>
          <select
            name="sort_mode"
            defaultValue={filter?.sort_mode ?? "default"}
            className="kumbu-input"
          >
            <option value="default">default</option>
            <option value="rating_desc">rating_desc</option>
            <option value="price_asc">price_asc</option>
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="kumbu-label">Ordem</span>
          <input
            name="sort_order"
            type="number"
            defaultValue={String(filter?.sort_order ?? 10)}
            className="kumbu-input"
          />
        </label>
        <div className="flex items-center gap-2">
          <Submit icon={isNew ? Plus : Save}>
            {isNew ? "Criar" : "Guardar"}
          </Submit>
        </div>
      </form>
      {!isNew && filter && (
        <form
          action={del}
          onSubmit={(e) => {
            if (!confirm("Eliminar este filtro?")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={filter.id} />
          <Submit icon={Trash2} className="kumbu-btn-danger text-xs py-1.5">
            Eliminar
          </Submit>
        </form>
      )}
    </div>
  );
}
