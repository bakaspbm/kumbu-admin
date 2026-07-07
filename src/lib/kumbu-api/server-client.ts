import "server-only";

import { headers } from "next/headers";
import { KumbuApiError } from "@/lib/kumbu-api/api-error";
import { kumbuApiFetchBase, type KumbuFetchOptions } from "@/lib/kumbu-api/fetch";
import { readAdminAccessToken } from "@/lib/kumbu-api/admin-session";

export { KumbuApiError } from "@/lib/kumbu-api/api-error";
export { getKumbuApiBaseUrl } from "@/lib/kumbu-api/config";
export { readAdminAccessToken, ensureAdminAccessToken } from "@/lib/kumbu-api/admin-session";

export async function getKumbuAccessToken(): Promise<string | null> {
  return readAdminAccessToken();
}

/** Renova cookies via Route Handler (seguro em RSC). */
async function tryRefreshAdminSession(): Promise<boolean> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const cookie = headerStore.get("cookie");
  if (!host || !cookie) return false;

  const proto = headerStore.get("x-forwarded-proto") ?? "https";
  const origin = `${proto}://${host.split(",")[0]?.trim() ?? host}`;

  try {
    const response = await fetch(`${origin}/api/auth/refresh`, {
      method: "POST",
      headers: {
        cookie,
        origin,
      },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function kumbuApiFetch<T>(
  path: string,
  init: RequestInit = {},
  options: Omit<KumbuFetchOptions, "accessToken"> = {},
): Promise<T> {
  if (!options.withAuth) {
    return kumbuApiFetchBase<T>(path, init, options);
  }

  let accessToken = await readAdminAccessToken();
  if (!accessToken) {
    await tryRefreshAdminSession();
    accessToken = await readAdminAccessToken();
  }
  if (!accessToken) {
    throw new KumbuApiError("Sessão expirada.", 401);
  }

  try {
    return await kumbuApiFetchBase<T>(path, init, { ...options, accessToken });
  } catch (error) {
    if (error instanceof KumbuApiError && error.status === 401) {
      if (await tryRefreshAdminSession()) {
        const refreshed = await readAdminAccessToken();
        if (refreshed) {
          return kumbuApiFetchBase<T>(path, init, {
            ...options,
            accessToken: refreshed,
          });
        }
      }
    }
    throw error;
  }
}