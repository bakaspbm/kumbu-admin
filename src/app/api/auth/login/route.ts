import { NextResponse } from "next/server";
import { assertSameOriginRequest } from "@/lib/security/request-origin";
import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";
import { KumbuApiError } from "@/lib/kumbu-api/api-error";

type AuthPayload = {
  accessToken?: string | null;
  refreshToken?: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
  admin?: boolean;
  mfaRequired?: boolean | null;
  mfa_required?: boolean | null;
  mfaToken?: string | null;
  mfa_token?: string | null;
  message?: string;
  userId?: string;
  email?: string | null;
  displayName?: string | null;
};

function normalizeAuth(raw: AuthPayload | null | undefined) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const accessToken = String(raw.accessToken ?? raw.access_token ?? "").trim();
  const refreshToken = String(raw.refreshToken ?? raw.refresh_token ?? "").trim();
  const mfaRequired = Boolean(raw.mfaRequired ?? raw.mfa_required);
  const mfaToken = String(raw.mfaToken ?? raw.mfa_token ?? "").trim();
  return {
    accessToken: accessToken || null,
    refreshToken: refreshToken || null,
    admin: Boolean(raw.admin),
    mfaRequired,
    mfaToken: mfaToken || null,
    userId: raw.userId ?? null,
    email: raw.email ?? null,
    displayName: raw.displayName ?? null,
  };
}

/** Login admin via servidor (KUMBU_API_URL/IP) — evita Bot Fight no browser. */
export async function POST(request: Request) {
  if (!assertSameOriginRequest(request)) {
    return NextResponse.json({ error: "Pedido não autorizado" }, { status: 403 });
  }

  let body: { email?: string; password?: string; source?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!email || !password) {
    return NextResponse.json(
      { error: "Indique o e-mail e a palavra-passe." },
      { status: 400 },
    );
  }

  try {
    const raw = await kumbuApiFetch<AuthPayload>(
      "/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kumbu-Client": "web",
        },
        body: JSON.stringify({ email, password, source: "web" }),
      },
      { withAuth: false },
    );
    const normalized = normalizeAuth(raw);
    if (!normalized) {
      return NextResponse.json(
        { error: "Resposta de login inválida da API." },
        { status: 502 },
      );
    }
    return NextResponse.json(normalized);
  } catch (error) {
    if (error instanceof KumbuApiError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status || 401 },
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha no login." },
      { status: 502 },
    );
  }
}
