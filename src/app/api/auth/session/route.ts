import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { assertSameOriginRequest } from "@/lib/security/request-origin";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
} from "@/lib/kumbu-api/session-cookies";

/** Define cookies httpOnly após login feito no browser (evita 403 Cloudflare no IP Vercel). */
export async function POST(request: Request) {
  if (!assertSameOriginRequest(request)) {
    return NextResponse.json({ error: "Pedido não autorizado" }, { status: 403 });
  }

  let body: { accessToken?: string; refreshToken?: string; admin?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
  }

  const accessToken = String(body.accessToken ?? "").trim();
  const refreshToken = String(body.refreshToken ?? "").trim();
  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "Tokens em falta" }, { status: 400 });
  }
  if (body.admin === false) {
    return NextResponse.json(
      { error: "Esta conta não tem permissões de administrador." },
      { status: 403 },
    );
  }

  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  cookieStore.set(ADMIN_ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
  cookieStore.set(ADMIN_REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  return NextResponse.json({ ok: true });
}
