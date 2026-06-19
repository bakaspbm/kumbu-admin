"use client";

import { LoginForm } from "./login-form";

export function AuthPanel({ next }: { next: string }) {
  return (
    <div className="space-y-4">
      <p className="kumbu-panel kumbu-panel-info px-3 py-2 text-sm">
        Inicia sessão com uma conta de administrador autorizada no backend. Contas
        do site utilizador não entram aqui.
      </p>
      <LoginForm next={next} />
    </div>
  );
}
