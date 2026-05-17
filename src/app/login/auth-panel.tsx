"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LoginForm } from "./login-form";
import { SetupAdminForm } from "./setup-admin-form";
import type { BootstrapStatus } from "@/lib/admin-setup";

type Tab = "login" | "setup";

export function AuthPanel({
  next,
  bootstrap,
  defaultEmail,
}: {
  next: string;
  bootstrap: BootstrapStatus;
  defaultEmail: string;
}) {
  const showSetup = bootstrap.needsBootstrap;
  const [tab, setTab] = useState<Tab>(showSetup ? "setup" : "login");

  return (
    <div className="space-y-4">
      {showSetup && (
        <div className="space-y-3">
          <div className="flex rounded-chip border border-slate-200 bg-slate-50 p-1">
            <TabButton
              active={tab === "login"}
              onClick={() => setTab("login")}
            >
              Entrar
            </TabButton>
            <TabButton
              active={tab === "setup"}
              onClick={() => setTab("setup")}
            >
              Criar administrador
            </TabButton>
          </div>
          {!bootstrap.schemaReady && (
            <p className="rounded-chip border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              A tabela <code className="text-xs">admin_users</code> ainda não
              existe no Supabase. Abre o{" "}
              <strong>SQL Editor</strong>, corre o ficheiro{" "}
              <code className="text-xs">supabase/admin_schema_minimal.sql</code>{" "}
              deste projeto e recarrega esta página.
            </p>
          )}
          {bootstrap.schemaReady && !bootstrap.canBootstrap && (
            <p className="rounded-chip border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Falta a{" "}
              <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code> no{" "}
              <code className="text-xs">.env.local</code> para criar a primeira
              conta pelo formulário.
            </p>
          )}
          {bootstrap.canBootstrap && tab === "setup" && (
            <p className="text-sm text-slate-500">
              Primeira configuração: cria a conta de{" "}
              <strong className="text-kumbu-ink">super admin</strong>. Depois
              disso este separador desaparece.
            </p>
          )}
        </div>
      )}

      {tab === "login" || !showSetup ? (
        <LoginForm next={next} />
      ) : (
        <SetupAdminForm
          next={next}
          defaultEmail={defaultEmail}
          disabled={!bootstrap.canBootstrap || !bootstrap.schemaReady}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-chip px-3 py-2 text-sm font-semibold transition",
        active
          ? "bg-white text-kumbu-ink shadow-sm"
          : "text-slate-500 hover:text-kumbu-ink"
      )}
    >
      {children}
    </button>
  );
}
