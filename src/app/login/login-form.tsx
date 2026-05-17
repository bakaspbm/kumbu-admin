"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, LogIn } from "lucide-react";
import { loginAction, type LoginState } from "./actions";
import { useAuthRedirect } from "./use-auth-redirect";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="kumbu-btn-primary w-full" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogIn className="h-4 w-4" />
      )}
      Entrar
    </button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState<LoginState, FormData>(
    loginAction,
    undefined
  );
  useAuthRedirect(state);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div className="space-y-1.5">
        <label htmlFor="email" className="kumbu-label">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="kumbu-input"
          placeholder="admin@kumbu.app"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="kumbu-label">
          Palavra-passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          className="kumbu-input"
          placeholder="••••••••"
        />
      </div>
      {state?.error && (
        <p className="rounded-chip bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
