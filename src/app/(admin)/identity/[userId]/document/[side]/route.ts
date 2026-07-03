import { ensureAdminAccessToken, refreshAdminAccessToken } from "@/lib/kumbu-api/admin-session";
import { getKumbuApiBaseUrl } from "@/lib/kumbu-api/server-client";
import { NextResponse } from "next/server";

const ALLOWED_SIDES = new Set(["front", "back", "selfie"]);

async function fetchDocument(userId: string, side: string, token: string) {
  const url = `${getKumbuApiBaseUrl()}/admin/identity/users/${userId}/documents/${side}`;
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ userId: string; side: string }> },
) {
  const { userId, side } = await context.params;
  if (!ALLOWED_SIDES.has(side)) {
    return new Response("Not found", { status: 404 });
  }

  let token = await ensureAdminAccessToken();
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  let upstream = await fetchDocument(userId, side, token);
  if (upstream.status === 401) {
    const refreshed = await refreshAdminAccessToken();
    if (refreshed) {
      token = refreshed;
      upstream = await fetchDocument(userId, side, token);
    }
  }

  if (!upstream.ok) {
    return new Response(upstream.status === 401 ? "Unauthorized" : "Not found", {
      status: upstream.status,
    });
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const buffer = await upstream.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    },
  });
}
