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
  mfaToken?: string | null;
  message?: string;
};

function normalizeAuth(raw: AuthPayload | null | undefined) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const accessToken = String(raw.accessToken ?? raw.access_token ?? "").trim();
  const refreshToken = String(raw.refreshToken ?? raw.refresh_token ?? "").trim();
  return {
    accessToken: accessToken || null,
    refreshToken: refreshToken || null,
    admin: Boolean(raw.admin),
  };
}

/** Verificação 2FA via servidor (evita Cloudflare no browser). */
export async function POST(request: Request) {
  if (!assertSameOriginRequest(request)) {
    return NextResponse.json({ error: "Pedido não autorizado" }, { status: 403 });
  }

  let body: { mfaToken?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
  }

  const mfaToken = String(body.mfaToken ?? "").trim();
  const code = String(body.code ?? "").trim();
  if (!mfaToken || !code) {
    return NextResponse.json(
      { error: "Indique o código 2FA da app autenticadora." },
      { status: 400 },
    );
  }

  try {
    const raw = await kumbuApiFetch<AuthPayload>(
      "/auth/mfa/verify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mfaToken, code }),
      },
      { withAuth: false },
    );
    const normalized = normalizeAuth(raw);
    if (!normalized?.accessToken || !normalized.refreshToken) {
      return NextResponse.json(
        { error: "Resposta 2FA sem tokens." },
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
      { error: error instanceof Error ? error.message : "Falha na verificação 2FA." },
      { status: 502 },
    );
  }
}
