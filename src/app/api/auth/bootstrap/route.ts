import { ensureAdminAccessToken } from "@/lib/kumbu-api/admin-session";
import { NextResponse } from "next/server";

export async function GET() {
  const token = await ensureAdminAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Sem sessão" }, { status: 401 });
  }
  return NextResponse.json({ accessToken: token }, { status: 200 });
}

