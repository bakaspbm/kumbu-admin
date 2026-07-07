import { clearAdminAuthCookies } from "@/lib/kumbu-api/admin-session";
import { assertSameOriginRequest } from "@/lib/security/request-origin";
import { NextResponse } from "next/server";

/** Limpa cookies de sessão admin (apenas em Route Handler). */
export async function POST(request: Request) {
  if (!assertSameOriginRequest(request)) {
    return NextResponse.json({ error: "Pedido não autorizado" }, { status: 403 });
  }

  await clearAdminAuthCookies();
  return NextResponse.json({ ok: true });
}
