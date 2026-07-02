import { ensureAdminAccessToken, refreshAdminAccessToken } from "@/lib/kumbu-api/admin-session";
import { getKumbuApiBaseUrl } from "@/lib/kumbu-api/config";
import { NextRequest, NextResponse } from "next/server";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "host",
  "content-length",
]);

function backendBase(): string {
  return getKumbuApiBaseUrl().replace(/\/+$/, "");
}

async function proxyUpstream(request: NextRequest, path: string) {
  let accessToken = await ensureAdminAccessToken();

  const target = `${backendBase()}/${path}${request.nextUrl.search}`;
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower) || lower === "accept-encoding") {
      return;
    }
    headers.set(key, value);
  });
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let body: BodyInit | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.arrayBuffer();
  }

  const upstreamInit = (): RequestInit => ({
    method: request.method,
    headers,
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  });

  let upstream = await fetch(target, upstreamInit());

  if (upstream.status === 401) {
    const refreshed = await refreshAdminAccessToken();
    if (refreshed) {
      headers.set("Authorization", `Bearer ${refreshed}`);
      upstream = await fetch(target, upstreamInit());
    }
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower) || lower === "content-encoding") {
      return;
    }
    responseHeaders.set(key, value);
  });

  const responseBody = await upstream.arrayBuffer();
  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

async function proxy(request: NextRequest, path: string) {
  try {
    return await proxyUpstream(request, path);
  } catch (err) {
    const message = err instanceof Error ? err.message : "upstream failed";
    return NextResponse.json({ code: "UPSTREAM_ERROR", message }, { status: 502 });
  }
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path.join("/"));
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path.join("/"));
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path.join("/"));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path.join("/"));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path.join("/"));
}
