"use client";

import { LoginForm } from "./login-form";

export function AuthPanel({ next }: { next: string }) {
  return (
    <div className="space-y-4">
      <p className="rounded-chip border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
        Usa a conta de administrador do backend (ex.:{" "}
        <code className="text-xs">admin@kumbu.app</code> /{" "}
        <code className="text-xs">Admin123!</code>). Contas do site utilizador
        não entram aqui.
      </p>
      <LoginForm next={next} />
    </div>
  );
}
