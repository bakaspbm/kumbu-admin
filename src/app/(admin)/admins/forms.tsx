"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save, Trash2, UserPlus } from "lucide-react";
import {
  changeRoleAction,
  removeAdminAction,
  inviteAdminAction,
  type ActionState,
} from "./actions";
import { FeedbackBanner } from "@/components/ui/toast";
import type { AdminUserRow } from "@/lib/types";

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

export function InviteAdminForm() {
  const [state, action] = useActionState<ActionState, FormData>(
    inviteAdminAction,
    null
  );
  return (
    <div className="kumbu-card p-5 space-y-3">
      <p className="text-sm font-semibold">Promover utilizador existente a admin</p>
      <p className="text-xs text-slate-500">
        A conta tem de estar registada na app. Indica o e-mail do utilizador.
      </p>
      <FeedbackBanner feedback={state} />
      <form action={action} className="grid gap-3 sm:grid-cols-3 items-end">
        <label className="space-y-1.5 sm:col-span-2">
          <span className="kumbu-label">E-mail</span>
          <input type="email" name="email" required className="kumbu-input" />
        </label>
        <label className="space-y-1.5">
          <span className="kumbu-label">Função</span>
          <select name="role" defaultValue="admin" className="kumbu-input">
            <option value="admin">Admin</option>
            <option value="support">Suporte</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </label>
        <Submit icon={UserPlus}>Promover</Submit>
      </form>
    </div>
  );
}

export function AdminRow({
  row,
  selfId,
  canManage,
}: {
  row: AdminUserRow;
  selfId: string;
  canManage: boolean;
}) {
  const [changeState, change] = useActionState<ActionState, FormData>(
    changeRoleAction,
    null
  );
  const [removeState, remove] = useActionState<ActionState, FormData>(
    removeAdminAction,
    null
  );

  const isSelf = row.user_id === selfId;

  return (
    <tr>
      <td>
        <p className="font-semibold">{row.email}</p>
        <p className="text-xs text-slate-500 font-mono">
          {row.user_id.slice(0, 8)}…
        </p>
      </td>
      <td>
        {canManage ? (
          <form action={change} className="flex items-center gap-2">
            <input type="hidden" name="user_id" value={row.user_id} />
            <select
              name="role"
              defaultValue={row.role}
              className="kumbu-input py-1.5 text-sm"
            >
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="support">Suporte</option>
            </select>
            <Submit icon={Save}>Guardar</Submit>
          </form>
        ) : (
          <span className="kumbu-badge bg-slate-100 text-slate-600">
            {row.role}
          </span>
        )}
        {changeState?.message && (
          <p className="mt-1 text-xs text-slate-500">{changeState.message}</p>
        )}
      </td>
      <td className="text-right">
        {canManage && !isSelf && (
          <form
            action={remove}
            onSubmit={(e) => {
              if (!confirm(`Remover ${row.email} dos administradores?`))
                e.preventDefault();
            }}
          >
            <input type="hidden" name="user_id" value={row.user_id} />
            <Submit icon={Trash2} className="kumbu-btn-danger">
              Remover
            </Submit>
          </form>
        )}
        {removeState?.message && (
          <p className="mt-1 text-xs text-slate-500">{removeState.message}</p>
        )}
      </td>
    </tr>
  );
}
