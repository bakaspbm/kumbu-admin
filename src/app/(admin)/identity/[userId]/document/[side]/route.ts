import { requireAdmin } from "@/lib/auth";
import { ensureAdminAccessToken } from "@/lib/kumbu-api/admin-session";
import { getKumbuApiBaseUrl } from "@/lib/kumbu-api/server-client";
import { NextResponse } from "next/server";

const ALLOWED_SIDES = new Set(["front", "back", "selfie"]);

export async function GET(
  _request: Request,
  context: { params: Promise<{ userId: string; side: string }> },
) {
  await requireAdmin();
  const { userId, side } = await context.params;
  if (!ALLOWED_SIDES.has(side)) {
    return new Response("Not found", { status: 404 });
  }

  const token = await ensureAdminAccessToken();
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = `${getKumbuApiBaseUrl()}/admin/identity/users/${userId}/documents/${side}`;
  const upstream = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!upstream.ok) {
    return new Response("Not found", { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const buffer = await upstream.arrayBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    },
  });
}
