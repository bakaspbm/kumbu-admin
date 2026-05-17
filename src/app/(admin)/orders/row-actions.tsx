"use client";

import { useActionState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  updateOrderStatusAction,
  deleteOrderAction,
  type ActionState,
} from "./actions";
import type { OrderStatus } from "@/lib/types";

const OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "processing", label: "Em processamento" },
  { value: "shipping", label: "Em trânsito" },
  { value: "delivered", label: "Entregue" },
  { value: "cancelled", label: "Cancelado" },
];

export function StatusSelect({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const [, action, pending] = useActionState<ActionState, FormData>(
    updateOrderStatusAction,
    null
  );
  const [isPending, start] = useTransition();
  return (
    <form
      action={(fd) => start(() => action(fd))}
      className="inline-flex items-center gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        className="kumbu-input py-1.5 text-sm"
        onChange={(e) => {
          (e.currentTarget.form as HTMLFormElement).requestSubmit();
        }}
        disabled={pending || isPending}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {(pending || isPending) && (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
      )}
    </form>
  );
}

export function DeleteOrderButton({ id }: { id: string }) {
  const [, action, pending] = useActionState<ActionState, FormData>(
    deleteOrderAction,
    null
  );
  const [isPending, start] = useTransition();
  return (
    <form
      action={(fd) => {
        if (!confirm(`Eliminar pedido ${id}?`)) return;
        start(() => action(fd));
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        title="Eliminar"
        className="inline-flex items-center justify-center rounded-chip p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
        disabled={pending || isPending}
      >
        {pending || isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </form>
  );
}
