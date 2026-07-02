import { cookies } from "next/headers";
import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
} from "@/lib/kumbu-api/session-cookies";

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
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
  cookieStore.set(ADMIN_REFRESH_COOKIE, response.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  return response;
}

export async function logoutFromKumbuApi(): Promise<void> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(ADMIN_REFRESH_COOKIE)?.value;
  if (refreshToken?.trim()) {
    try {
      await kumbuApiFetch<void>(
        "/auth/logout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        },
        { withAuth: false },
      );
    } catch {
      // Mesmo com falha de rede, limpamos cookies locais
    }
  }
  await clearKumbuApiAuthCookies();
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
