"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save } from "lucide-react";
import { saveSupportAction, type ActionState } from "./actions";
import { FeedbackBanner } from "@/components/ui/toast";
import type { SupportSettings } from "@/lib/types";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="kumbu-btn-primary" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      Guardar
    </button>
  );
}

export function SupportForm({ settings }: { settings: SupportSettings | null }) {
  const [state, action] = useActionState<ActionState, FormData>(
    saveSupportAction,
    null
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={settings?.id ?? "global"} />
      <FeedbackBanner feedback={state} />
      <label className="block space-y-1.5">
        <span className="kumbu-label">Mensagem de boas-vindas</span>
        <textarea
          name="welcome_message"
          defaultValue={settings?.welcome_message ?? ""}
          rows={3}
          className="kumbu-input"
          required
        />
      </label>
      <label className="block space-y-1.5">
        <span className="kumbu-label">Resposta automática</span>
        <textarea
          name="auto_reply_message"
          defaultValue={settings?.auto_reply_message ?? ""}
          rows={3}
          className="kumbu-input"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="kumbu-label">Atalhos rápidos (um por linha)</span>
        <textarea
          name="quick_actions_raw"
          defaultValue={settings?.quick_actions?.join("\n") ?? ""}
          rows={4}
          placeholder={"Rastrear pedido\nDevolução\nPagamento"}
          className="kumbu-input font-mono text-sm"
        />
      </label>
      <Submit />
    </form>
  );
}
