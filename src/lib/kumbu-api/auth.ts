import { cookies } from "next/headers";
import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
} from "@/lib/kumbu-api/session-cookies";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  userId: string;
  email: string | null;
  displayName: string | null;
  admin: boolean;
};

export async function loginWithKumbuApi(input: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const response = await kumbuApiFetch<LoginResponse>(
    "/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    { withAuth: false }
  );

  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  cookieStore.set(ADMIN_ACCESS_COOKIE, response.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(response.expiresInSeconds ?? 0, 1),
  });
  cookieStore.set(ADMIN_REFRESH_COOKIE, response.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}

export async function clearKumbuApiAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_ACCESS_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  cookieStore.set(ADMIN_REFRESH_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
