"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { sanitizeInternalPath } from "@/lib/auth/safe-redirect";

type LoginApiResponse = {
  accessToken?: string | null;
  refreshToken?: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
  admin?: boolean;
  mfaRequired?: boolean | null;
  mfaToken?: string | null;
  error?: string;
  message?: string;
  code?: string;
};

function pickTokens(data: LoginApiResponse | null | undefined): {
  accessToken: string;
  refreshToken: string;
} | null {
  if (!data || typeof data !== "object") return null;
  const accessToken = String(data.accessToken ?? data.access_token ?? "").trim();
  const refreshToken = String(data.refreshToken ?? data.refresh_token ?? "").trim();
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

async function postSameOrigin(
  path: string,
  body: unknown,
): Promise<{ ok: true; data: LoginApiResponse } | { ok: false; message: string }> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await response.text();
  let parsed: LoginApiResponse | null = null;
  try {
    parsed = text ? (JSON.parse(text) as LoginApiResponse) : null;
  } catch {
    parsed = null;
  }
  if (!response.ok) {
    const message =
      parsed?.error ||
      parsed?.message ||
      (response.status === 403
        ? "Acesso bloqueado (403). Confirme as credenciais ou a configuração Cloudflare da API."
        : `Falha no login (${response.status}).`);
    return { ok: false, message };
  }
  return { ok: true, data: parsed ?? {} };
}

async function establishSession(data: LoginApiResponse): Promise<string | null> {
  const tokens = pickTokens(data);
  if (!tokens) {
    return "Resposta de login sem tokens.";
  }
  if (data.admin === false) {
    return "Esta conta não tem permissões de administrador. Contacte um super admin.";
  }
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      admin: true,
    }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    return body?.error || "Não foi possível gravar a sessão.";
  }
  return null;
}

export function LoginForm({ next }: { next: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  function finishRedirect() {
    window.location.assign(sanitizeInternalPath(next, "/dashboard"));
  }

  function onLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await postSameOrigin("/api/auth/login", {
          email: email.trim().toLowerCase(),
          password,
        });
        if (!result.ok) {
          setError(result.message);
          return;
        }
        if (result.data.mfaRequired && result.data.mfaToken) {
          setMfaToken(result.data.mfaToken);
          return;
        }
        const sessionError = await establishSession(result.data);
        if (sessionError) {
          setError(sessionError);
          return;
        }
        finishRedirect();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado.");
      }
    });
  }

  function onMfa(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        if (!mfaToken) {
          setError("Sessão 2FA expirada. Volte a entrar.");
          return;
        }
        const result = await postSameOrigin("/api/auth/mfa", {
          mfaToken,
          code: code.trim(),
        });
        if (!result.ok) {
          setError(result.message);
          return;
        }
        const sessionError = await establishSession(result.data);
        if (sessionError) {
          setError(sessionError);
          return;
        }
        finishRedirect();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado.");
      }
    });
  }

  if (mfaToken) {
    return (
      <form onSubmit={onMfa} className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <p className="inline-flex items-center gap-1.5 font-medium text-kumbu-ink">
            <ShieldCheck className="h-4 w-4 text-kumbu-red" />
            Verificação em dois passos
          </p>
          <p className="mt-1 text-xs">Abra a app autenticadora e introduza o código de 6 dígitos.</p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="code" className="kumbu-label">
            Código 2FA
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            pattern="\d{6}"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="kumbu-input tracking-[0.3em]"
            placeholder="000000"
          />
        </div>
        {error ? (
          <p className="rounded-chip border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        ) : null}
        <button type="submit" className="kumbu-btn-primary w-full" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {pending ? "A entrar…" : "Confirmar código"}
        </button>
        <button
          type="button"
          className="kumbu-btn-ghost w-full text-sm"
          onClick={() => {
            setMfaToken(null);
            setCode("");
            setError(null);
          }}
        >
          Voltar
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onLogin} className="space-y-4">
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="kumbu-input"
          placeholder="admin@kumbu-market.com"
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
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="kumbu-input"
          placeholder="••••••••"
        />
      </div>
      {error ? (
        <p className="rounded-chip border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      ) : null}
      <button type="submit" className="kumbu-btn-primary w-full" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        {pending ? "A entrar…" : "Entrar"}
      </button>
    </form>
  );
}
