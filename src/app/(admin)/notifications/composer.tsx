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

export function NotificationComposer({
  userOptions,
}: {
  userOptions: { id: string; email: string; name: string }[];
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    sendNotificationAction,
    null
  );
  const [audience, setAudience] = useState<"all" | "single">("all");

  return (
    <div className="kumbu-card p-5 space-y-4">
      <p className="text-sm font-semibold">Compor notificação</p>
      <p className="text-xs text-slate-500">
        Os utilizadores veem isto em <strong>Conta → Alertas</strong> (site) ou no
        separador de notificações na app — não na lista de Mensagens (chat com
        vendedores).
      </p>
      <FeedbackBanner feedback={state} />
      <form action={action} className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
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
            <span className="text-sm">Um utilizador</span>
          </label>
        </div>

        {audience === "single" && (
          <label className="block space-y-1.5">
            <span className="kumbu-label">E-mail ou UID</span>
            <input
              name="user_id"
              list="kumbu-user-list"
              required={audience === "single"}
              placeholder="utilizador@email.com"
              className="kumbu-input"
            />
            <datalist id="kumbu-user-list">
              {userOptions.map((u) => (
                <option
                  key={u.id}
                  value={u.email || u.id}
                  label={u.name || u.email || u.id}
                />
              ))}
            </datalist>
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
