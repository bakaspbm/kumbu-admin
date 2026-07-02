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
    pathname.startsWith("/api/auth/refresh") ||
    pathname === "/favicon.ico" ||
    pathname === "/forbidden"
  );
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

  if (hasSession && pathname === "/login" && request.method === "GET") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
