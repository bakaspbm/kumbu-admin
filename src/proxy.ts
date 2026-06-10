import type { NextRequest } from "next/server";
import { handleAdminAuth } from "@/lib/auth-middleware";

export async function proxy(request: NextRequest) {
  return handleAdminAuth(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
