import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
} from "@/lib/kumbu-api/session-cookies";

function isServerActionRequest(request: NextRequest) {
  return (
    request.method === "POST" &&
    (request.headers.has("next-action") || request.headers.has("Next-Action"))
  );
}

function isPublicPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/public") ||
    pathname.startsWith("/api/auth/") ||
    pathname === "/favicon.ico" ||
    pathname === "/forbidden"
  );
}

function isAccessTokenValid(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  if (!token) return false;
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return false;
    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(base64)) as { exp?: number };
    if (typeof json.exp !== "number") return false;
    return json.exp > Math.floor(Date.now() / 1000) + 60;
  } catch {
    return false;
  }
}

function hasAdminSession(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get(ADMIN_ACCESS_COOKIE)?.value ||
      request.cookies.get(ADMIN_REFRESH_COOKIE)?.value,
  );
}

/** Protege rotas privadas com cookies de sessão admin (separado do site). */
export function handleAdminAuth(request: NextRequest) {
  const hasSession = hasAdminSession(request);
  const pathname = request.nextUrl.pathname;
  const isPublic = isPublicPath(pathname);

  if (!hasSession && !isPublic && !isServerActionRequest(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAccessTokenValid(request) && pathname === "/login" && request.method === "GET") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
