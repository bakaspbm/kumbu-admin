import { assertSameOriginRequest } from "@/lib/security/request-origin";
import { ensureAdminAccessToken } from "@/lib/kumbu-api/admin-session";
import { NextResponse } from "next/server";

/** Renova silenciosamente a sessão admin (um pedido em voo no servidor). */
export async function POST(request: Request) {
  if (!assertSameOriginRequest(request)) {
    return NextResponse.json({ error: "Pedido não autorizado" }, { status: 403 });
  }

  const token = await ensureAdminAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Sessão expirada" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
