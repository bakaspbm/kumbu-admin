"use client";

import { useFormStatus } from "react-dom";
import { EyeOff, Eye, MailOpen, Trash2, Loader2 } from "lucide-react";
import {
  hideNotificationAction,
  unhideNotificationAction,
  markAsReadAction,
  deleteNotificationAction,
} from "./actions";
import { formatDateTime } from "@/lib/utils";
import type { UserNotification } from "@/lib/types";

function ActionBtn({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      title={label}
      aria-label={label}
      disabled={pending}
      className={className}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}

function RowActions({ item }: { item: UserNotification }) {
  const hidden = Boolean(item.hidden_at);

  return (
    <div className="flex shrink-0 flex-wrap gap-1">
      {!item.read_at && (
        <form action={markAsReadAction}>
          <input type="hidden" name="id" value={item.id} />
          <ActionBtn
            label="Marcar como lida"
            className="rounded-chip p-2 text-slate-500 hover:bg-slate-100"
          >
            <MailOpen className="h-4 w-4" />
          </ActionBtn>
        </form>
      )}
      {hidden ? (
        <form action={unhideNotificationAction}>
          <input type="hidden" name="id" value={item.id} />
          <ActionBtn
            label="Mostrar na app"
            className="rounded-chip p-2 text-emerald-600 hover:bg-emerald-50"
          >
            <Eye className="h-4 w-4" />
          </ActionBtn>
        </form>
      ) : (
        <form action={hideNotificationAction}>
          <input type="hidden" name="id" value={item.id} />
          <ActionBtn
            label="Ocultar para utilizadores"
            className="rounded-chip p-2 text-amber-600 hover:bg-amber-50"
          >
            <EyeOff className="h-4 w-4" />
          </ActionBtn>
        </form>
      )}
      <form
        action={deleteNotificationAction}
        onSubmit={(e) => {
          if (!confirm("Eliminar esta notificação permanentemente?")) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={item.id} />
        <ActionBtn
          label="Eliminar"
          className="rounded-chip p-2 text-rose-600 hover:bg-rose-50"
        >
          <Trash2 className="h-4 w-4" />
        </ActionBtn>
      </form>
    </div>
  );
}

export function NotificationList({ items }: { items: UserNotification[] }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-sm text-slate-500">Ainda não enviaste notificações.</p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((n) => (
        <li key={n.id} className="flex items-start gap-3 py-3">
          <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-kumbu-red text-[10px] font-semibold uppercase">
            {n.icon_key.slice(0, 2)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{n.title}</p>
              {n.hidden_at && (
                <span className="kumbu-badge bg-amber-100 text-amber-800">
                  Oculta na app
                </span>
              )}
              {n.read_at && (
                <span className="kumbu-badge bg-slate-100 text-slate-600">Lida</span>
              )}
            </div>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{n.body}</p>
            <p className="mt-1 text-xs text-slate-400">
              {formatDateTime(n.created_at)} ·{" "}
              <span className="font-mono">{n.user_id.slice(0, 8)}…</span>
            </p>
          </div>
          <RowActions item={n} />
        </li>
      ))}
    </ul>
  );
}
