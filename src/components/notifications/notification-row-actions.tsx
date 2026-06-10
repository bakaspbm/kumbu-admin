"use client";

import { useFormStatus } from "react-dom";
import { EyeOff, Eye, MailOpen, Trash2, Loader2 } from "lucide-react";
import {
  hideNotificationAction,
  unhideNotificationAction,
  markAsReadAction,
  deleteNotificationAction,
} from "@/app/(admin)/notifications/actions";
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

export function NotificationRowActions({ item }: { item: UserNotification }) {
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
