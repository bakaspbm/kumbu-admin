"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import {
  upsertCategoryAction,
  deleteCategoryAction,
  upsertSubcategoryAction,
  deleteSubcategoryAction,
  type ActionState,
} from "./actions";
import { FeedbackBanner } from "@/components/ui/toast";
import type { CatalogCategory, CatalogSubcategory } from "@/lib/types";

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

export function CategoryRow({
  category,
  subs,
}: {
  category: CatalogCategory;
  subs: CatalogSubcategory[];
}) {
  const [, action] = useActionState<ActionState, FormData>(
    upsertCategoryAction,
    null
  );
  const [, del] = useActionState<ActionState, FormData>(
    deleteCategoryAction,
    null
  );
  const [showSubForm, setShowSubForm] = useState(false);

  return (
    <div className="kumbu-card p-4 space-y-4">
      <form action={action} className="grid gap-3 sm:grid-cols-6">
        <input type="hidden" name="id" value={category.id} />
        <FieldCompact label="Nome" name="name" defaultValue={category.name} />
        <FieldCompact label="Ícone" name="icon_key" defaultValue={category.icon_key} />
        <FieldCompact label="Cor (hex)" name="accent_hex" defaultValue={category.accent_hex} />
        <FieldCompact
          label="Ordem"
          name="sort_order"
          type="number"
          defaultValue={String(category.sort_order)}
        />
        <label className="block space-y-1">
          <span className="kumbu-label">Tipo</span>
          <select
            name="kind"
            defaultValue={category.kind}
            className="kumbu-input py-1.5"
          >
            <option value="product">Produto</option>
            <option value="stay">Estadia</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <span
            className="inline-block h-8 w-8 rounded border border-slate-200"
            style={{ background: `#${category.accent_hex}` }}
            aria-hidden
          />
          <Submit icon={Save}>Guardar</Submit>
        </div>
      </form>

      <div className="rounded-chip border border-slate-100 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold">Subcategorias</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSubForm((v) => !v)}
              className="kumbu-btn-ghost text-xs py-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </button>
            <form
              action={del}
              onSubmit={(e) => {
                if (!confirm("Eliminar esta categoria?")) e.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={category.id} />
              <Submit icon={Trash2} className="kumbu-btn-danger text-xs py-1.5">
                Eliminar categoria
              </Submit>
            </form>
          </div>
        </div>

        {showSubForm && (
          <SubcategoryCreateForm categoryId={category.id} onDone={() => setShowSubForm(false)} />
        )}

        {subs.length === 0 ? (
          <p className="py-2 text-xs text-slate-500">
            Sem subcategorias. Adiciona acima.
          </p>
        ) : (
          <ul className="space-y-2">
            {subs.map((s) => (
              <SubcategoryRow key={`${s.category_id}-${s.id}`} sub={s} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function NewCategoryForm() {
  const [state, action] = useActionState<ActionState, FormData>(
    upsertCategoryAction,
    null
  );
  return (
    <form action={action} className="kumbu-card p-4 space-y-3">
      <p className="text-sm font-semibold">Nova categoria</p>
      <FeedbackBanner feedback={state} />
      <div className="grid gap-3 sm:grid-cols-6">
        <FieldCompact label="ID" name="id" required placeholder="ex.: beauty" />
        <FieldCompact label="Nome" name="name" required placeholder="Beleza" />
        <FieldCompact
          label="Ícone (Material)"
          name="icon_key"
          defaultValue="category"
        />
        <FieldCompact
          label="Cor (hex)"
          name="accent_hex"
          defaultValue="C62828"
        />
        <FieldCompact
          label="Ordem"
          name="sort_order"
          type="number"
          defaultValue="100"
        />
        <label className="block space-y-1">
          <span className="kumbu-label">Tipo</span>
          <select name="kind" defaultValue="product" className="kumbu-input py-1.5">
            <option value="product">Produto</option>
            <option value="stay">Estadia</option>
          </select>
        </label>
      </div>
      <Submit icon={Plus}>Criar categoria</Submit>
    </form>
  );
}

function SubcategoryCreateForm({
  categoryId,
  onDone,
}: {
  categoryId: string;
  onDone: () => void;
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    upsertSubcategoryAction,
    null
  );
  return (
    <form
      action={(fd) => {
        action(fd);
        onDone();
      }}
      className="mb-2 grid gap-3 rounded-chip bg-slate-50 p-3 sm:grid-cols-5"
    >
      <input type="hidden" name="category_id" value={categoryId} />
      <FieldCompact label="ID" name="id" required placeholder="hotel" />
      <FieldCompact label="Etiqueta" name="label" required placeholder="Hotéis" />
      <FieldCompact label="Ordem" name="sort_order" type="number" defaultValue="10" />
      <div className="sm:col-span-2 flex items-end gap-2">
        <Submit icon={Plus}>Adicionar</Submit>
        {state?.message && (
          <span className="text-xs text-slate-500">{state.message}</span>
        )}
      </div>
    </form>
  );
}

function SubcategoryRow({ sub }: { sub: CatalogSubcategory }) {
  const [, action] = useActionState<ActionState, FormData>(
    upsertSubcategoryAction,
    null
  );
  const [, del] = useActionState<ActionState, FormData>(
    deleteSubcategoryAction,
    null
  );
  return (
    <li>
      <form action={action} className="grid gap-2 sm:grid-cols-5 items-end">
        <input type="hidden" name="category_id" value={sub.category_id} />
        <FieldCompact label="ID" name="id" defaultValue={sub.id} readOnly />
        <FieldCompact label="Etiqueta" name="label" defaultValue={sub.label} />
        <FieldCompact
          label="Ordem"
          name="sort_order"
          type="number"
          defaultValue={String(sub.sort_order)}
        />
        <Submit icon={Save}>Guardar</Submit>
        <SubDelete categoryId={sub.category_id} id={sub.id} del={del} />
      </form>
    </li>
  );
}

function SubDelete({
  categoryId,
  id,
  del,
}: {
  categoryId: string;
  id: string;
  del: (fd: FormData) => void;
}) {
  return (
    <form
      action={del}
      onSubmit={(e) => {
        if (!confirm("Eliminar subcategoria?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="category_id" value={categoryId} />
      <input type="hidden" name="id" value={id} />
      <Submit icon={Trash2} className="kumbu-btn-danger">
        Eliminar
      </Submit>
    </form>
  );
}

function FieldCompact({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  readOnly,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="kumbu-label">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        readOnly={readOnly}
        placeholder={placeholder}
        className="kumbu-input py-1.5 text-sm"
      />
    </label>
  );
}
