"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Mail, Power, PowerOff } from "lucide-react";
import { updateEmailNewListingsAction } from "./actions";
import { FeedbackBanner } from "@/components/ui/toast";
import type { ActionState } from "@/lib/action-state";

function BusyButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function EmailSettingsCard({
  emailNewListingsEnabled,
}: {
  emailNewListingsEnabled: boolean;
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    updateEmailNewListingsAction,
    null,
  );

  return (
    <div className="kumbu-card space-y-4 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-kumbu-red/10 text-kumbu-red">
          <Mail className="h-5 w-5" />
        </span>
        <div>
          <p className="kumbu-label">Email — novos anúncios</p>
          <h3 className="text-base font-semibold">Alertas por email quando alguém publica</h3>
          <p className="mt-1 text-sm text-slate-500">
            Se activo, a API envia email a utilizadores com email verificado que activaram
            «novos anúncios» nas definições do site. Cada utilizador pode desligar na conta.
            Por defeito isto fica desligado.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={
            emailNewListingsEnabled
              ? "rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300"
              : "rounded-full bg-slate-500/15 px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300"
          }
        >
          {emailNewListingsEnabled ? "Activo" : "Desligado"}
        </span>
        <FeedbackBanner feedback={state} />
        <form action={action}>
          <input
            type="hidden"
            name="enabled"
            value={emailNewListingsEnabled ? "false" : "true"}
          />
          <BusyButton
            className={
              emailNewListingsEnabled
                ? "kumbu-btn-secondary inline-flex items-center gap-1.5 text-sm"
                : "kumbu-btn-primary inline-flex items-center gap-1.5 text-sm"
            }
          >
            {emailNewListingsEnabled ? (
              <>
                <PowerOff className="h-4 w-4" /> Desactivar emails de novos anúncios
              </>
            ) : (
              <>
                <Power className="h-4 w-4" /> Activar emails de novos anúncios
              </>
            )}
          </BusyButton>
        </form>
      </div>
    </div>
  );
}
