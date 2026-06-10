"use client";

import { useActionState } from "react";
import { useRouterRefreshOnActions } from "@/hooks/use-router-refresh-on-actions";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import {
  createProductAction,
  updateProductAction,
  type ActionState,
} from "./actions";
import { FeedbackBanner } from "@/components/ui/toast";
import type { CatalogCategory, CatalogProduct, CatalogSubcategory } from "@/lib/types";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="kumbu-btn-primary" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {label}
    </button>
  );
}

export function ProductForm({
  mode,
  product,
  categories,
  subcategories,
}: {
  mode: "create" | "edit";
  product?: CatalogProduct;
  categories: CatalogCategory[];
  subcategories: CatalogSubcategory[];
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    mode === "create" ? createProductAction : updateProductAction,
    null
  );
  useRouterRefreshOnActions(state);

  return (
    <form action={action} className="space-y-4">
      <FeedbackBanner feedback={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="ID interno"
          name="id"
          defaultValue={product?.id ?? ""}
          required
          readOnly={mode === "edit"}
          hint="Slug único (ex.: p-phone-1). Não pode mudar depois de criado."
        />
        <Field
          label="Título"
          name="title"
          defaultValue={product?.title ?? ""}
          required
        />
        <Select
          label="Categoria"
          name="category_id"
          defaultValue={product?.category_id ?? categories[0]?.id ?? ""}
          required
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          label="Subcategoria"
          name="subcategory_id"
          defaultValue={product?.subcategory_id ?? ""}
        >
          <option value="">— sem subcategoria —</option>
          {subcategories.map((s) => (
            <option key={`${s.category_id}-${s.id}`} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
        <Field
          label="Preço (texto)"
          name="price_label"
          defaultValue={product?.price_label ?? ""}
          required
          hint="Ex.: €399"
        />
        <Field
          label="Preço antigo (opcional)"
          name="old_price_label"
          defaultValue={product?.old_price_label ?? ""}
        />
        <Field
          label="Desconto %"
          name="discount_percent"
          type="number"
          min={0}
          max={99}
          defaultValue={
            product?.discount_percent !== null &&
            product?.discount_percent !== undefined
              ? String(product.discount_percent)
              : ""
          }
        />
        <Field
          label="Rating"
          name="rating"
          type="number"
          step="0.1"
          min={0}
          max={5}
          defaultValue={product?.rating?.toString() ?? "4.5"}
        />
        <Field
          label="Texto de entrega"
          name="delivery_text"
          defaultValue={product?.delivery_text ?? ""}
        />
        <Field
          label="Cor (ARGB int)"
          name="image_color"
          type="number"
          defaultValue={
            product?.image_color !== null && product?.image_color !== undefined
              ? String(product.image_color)
              : ""
          }
          hint="Opcional. Ex.: 4281944491"
        />
        <Field
          label="Ordem"
          name="sort_order"
          type="number"
          defaultValue={product?.sort_order?.toString() ?? "0"}
        />
      </div>
      <div className="flex items-center gap-6 pt-1">
        <Toggle
          label="Em destaque"
          name="is_featured"
          defaultChecked={product?.is_featured ?? false}
        />
        <Toggle
          label="Esgotado"
          name="is_out_of_stock"
          defaultChecked={product?.is_out_of_stock ?? false}
        />
      </div>
      <div className="flex items-center gap-2 pt-2">
        <Submit label={mode === "create" ? "Criar produto" : "Guardar alterações"} />
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  readOnly,
  hint,
  min,
  max,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  readOnly?: boolean;
  hint?: string;
  min?: number;
  max?: number;
  step?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="kumbu-label">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        readOnly={readOnly}
        min={min}
        max={max}
        step={step}
        className="kumbu-input"
      />
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

function Select({
  label,
  name,
  defaultValue,
  required,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="kumbu-label">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="kumbu-input"
      >
        {children}
      </select>
    </label>
  );
}

function Toggle({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-slate-300 text-kumbu-red focus:ring-kumbu-red"
      />
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}
