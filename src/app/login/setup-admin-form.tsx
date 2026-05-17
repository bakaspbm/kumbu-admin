"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, UserPlus } from "lucide-react";
import { bootstrapAdminAction, type BootstrapState } from "./actions";
import { useAuthRedirect } from "./use-auth-redirect";

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="kumbu-btn-primary w-full"
      disabled={pending || disabled}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      Criar e entrar
    </button>
  );
}

export function SetupAdminForm({
  next,
  defaultEmail,
  disabled,
}: {
  next: string;
  defaultEmail: string;
  disabled?: boolean;
}) {
  const [state, action] = useActionState<BootstrapState, FormData>(
    bootstrapAdminAction,
    undefined
  );
  useAuthRedirect(state);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div className="space-y-1.5">
        <label htmlFor="setup-email" className="kumbu-label">
          E-mail
        </label>
        <input
          id="setup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={disabled}
          defaultValue={defaultEmail}
          className="kumbu-input"
          placeholder="admin@kumbu.app"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="setup-password" className="kumbu-label">
          Palavra-passe
        </label>
        <input
          id="setup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={disabled}
          className="kumbu-input"
          placeholder="Mínimo 8 caracteres"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="setup-confirm" className="kumbu-label">
          Confirmar palavra-passe
        </label>
        <input
          id="setup-confirm"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={disabled}
          className="kumbu-input"
        />
      </div>
      {state?.error && (
        <p className="rounded-chip border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      )}
      <SubmitButton disabled={disabled} />
    </form>
  );
}
