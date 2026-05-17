"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Send } from "lucide-react";
import { sendNotificationAction, type ActionState } from "./actions";
import { FeedbackBanner } from "@/components/ui/toast";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="kumbu-btn-primary" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
      Enviar
    </button>
  );
}

export function NotificationComposer() {
  const [state, action] = useActionState<ActionState, FormData>(
    sendNotificationAction,
    null
  );
  const [audience, setAudience] = useState<"all" | "single">("all");

  return (
    <div className="kumbu-card p-5 space-y-4">
      <p className="text-sm font-semibold">Compor notificação</p>
      <FeedbackBanner feedback={state} />
      <form action={action} className="space-y-4">
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="audience"
              value="all"
              checked={audience === "all"}
              onChange={() => setAudience("all")}
              className="h-4 w-4 border-slate-300 text-kumbu-red"
            />
            <span className="text-sm">Todos os utilizadores</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="audience"
              value="single"
              checked={audience === "single"}
              onChange={() => setAudience("single")}
              className="h-4 w-4 border-slate-300 text-kumbu-red"
            />
            <span className="text-sm">Utilizador específico</span>
          </label>
        </div>

        {audience === "single" && (
          <label className="block space-y-1.5">
            <span className="kumbu-label">UID do utilizador</span>
            <input
              name="user_id"
              required={audience === "single"}
              placeholder="00000000-0000-0000-0000-000000000000"
              className="kumbu-input font-mono"
            />
          </label>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="kumbu-label">Título</span>
            <input
              name="title"
              required
              maxLength={120}
              className="kumbu-input"
              placeholder="Promoção especial!"
            />
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="kumbu-label">Mensagem</span>
            <textarea
              name="body"
              required
              maxLength={500}
              rows={3}
              className="kumbu-input"
              placeholder="20% de desconto em tudo este fim-de-semana."
            />
          </label>
          <label className="block space-y-1.5">
            <span className="kumbu-label">Ícone (Material)</span>
            <input
              name="icon_key"
              defaultValue="notifications_outlined"
              className="kumbu-input"
            />
          </label>
        </div>

        <Submit />
      </form>
    </div>
  );
}
