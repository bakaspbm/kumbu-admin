import "server-only";

import { cookies } from "next/headers";
import { kumbuApiFetchBase } from "@/lib/kumbu-api/fetch";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
} from "@/lib/kumbu-api/session-cookies";

const REFRESH_BUFFER_SECONDS = 10 * 60;

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
};

export async function clearAdminAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  cookieStore.set(ADMIN_ACCESS_COOKIE, "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  cookieStore.set(ADMIN_REFRESH_COOKIE, "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

function decodeTokenExp(token: string): number | null {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const json = JSON.parse(
      Buffer.from(payloadPart.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
        "utf8",
      ),
    ) as { exp?: number };
    return typeof json.exp === "number" ? json.exp : null;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  const exp = decodeTokenExp(token);
  if (exp == null) return true;
  const nowSec = Math.floor(Date.now() / 1000);
  return exp <= nowSec;
}

function isTokenExpiredOrExpiringSoon(token: string | null): boolean {
  if (!token) return true;
  const exp = decodeTokenExp(token);
  if (exp == null) return true;
  const nowSec = Math.floor(Date.now() / 1000);
  return exp <= nowSec + REFRESH_BUFFER_SECONDS;
}

/** Leitura segura em Server Components — nunca escreve cookies. */
export async function readAdminAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const current = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value ?? null;
  if (!current || isTokenExpired(current)) return null;
  return current;
}

async function persistAdminTokens(accessToken: string, refreshToken: string) {
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
}

let refreshInFlight: Promise<string | null> | null = null;

export async function refreshAdminAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const cookieStore = await cookies();
      const refreshToken = cookieStore.get(ADMIN_REFRESH_COOKIE)?.value;
      if (!refreshToken) return null;

      const response = await kumbuApiFetchBase<RefreshResponse>(
        "/auth/refresh",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        },
        { withAuth: false },
      );

      if (!response.accessToken?.trim() || !response.refreshToken?.trim()) {
        await clearAdminAuthCookies();
        return null;
      }

      await persistAdminTokens(response.accessToken, response.refreshToken);
      return response.accessToken;
    } catch {
      await clearAdminAuthCookies();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function ensureAdminAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value ?? null;
  if (raw && !isTokenExpiredOrExpiringSoon(raw)) {
    return raw;
  }
  const refreshed = await refreshAdminAccessToken();
  if (!refreshed) {
    await clearAdminAuthCookies();
  }
  return refreshed;
}
