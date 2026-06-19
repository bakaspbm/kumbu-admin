"use client";


import type { ActionState } from "@/lib/action-state";
import { useActionState } from "react";
import {
  deleteJobListingAction,
  updateJobListingStatusAction,
} from "./actions";

function ActionMessage({ state }: { state: ActionState }) {
  if (!state?.message) return null;
  return (
    <p className={`text-xs ${state.ok ? "text-emerald-600" : "text-rose-600"}`}>
      {state.message}
    </p>
  );
}

export function JobListingActions({ id, status }: { id: string; status: string }) {
  const [statusState, statusAction, statusPending] = useActionState(
    updateJobListingStatusAction,
    null,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteJobListingAction,
    null,
  );

  return (
    <div className="flex flex-col items-end gap-2">
      <form action={statusAction} className="flex items-center gap-1">
        <input type="hidden" name="id" value={id} />
        <select
          name="status"
          defaultValue={status}
          className="rounded-chip border border-slate-200 px-2 py-1 text-xs"
        >
          <option value="active">Activa</option>
          <option value="filled_hidden">Preenchida</option>
        </select>
        <button
          type="submit"
          disabled={statusPending}
          className="text-xs font-semibold text-kumbu-red hover:underline disabled:opacity-50"
        >
          Guardar
        </button>
      </form>
      <form action={deleteAction}>
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          disabled={deletePending}
          className="text-xs text-rose-600 hover:underline disabled:opacity-50"
        >
          Remover
        </button>
      </form>
      <ActionMessage state={statusState} />
      <ActionMessage state={deleteState} />
    </div>
  );
}
