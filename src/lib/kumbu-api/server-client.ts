import "server-only";

import { cookies } from "next/headers";
import { KumbuApiError } from "@/lib/kumbu-api/api-error";
import { kumbuApiFetchBase, type KumbuFetchOptions } from "@/lib/kumbu-api/fetch";
import {
  ensureAdminAccessToken,
  refreshAdminAccessToken,
} from "@/lib/kumbu-api/admin-session";
import { ADMIN_ACCESS_COOKIE } from "@/lib/kumbu-api/session-cookies";

export { KumbuApiError } from "@/lib/kumbu-api/api-error";
export { getKumbuApiBaseUrl } from "@/lib/kumbu-api/config";
export { ensureAdminAccessToken } from "@/lib/kumbu-api/admin-session";

export async function getKumbuAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_COOKIE)?.value ?? null;
}

export async function kumbuApiFetch<T>(
  path: string,
  init: RequestInit = {},
  options: Omit<KumbuFetchOptions, "accessToken"> = {},
): Promise<T> {
  if (!options.withAuth) {
    return kumbuApiFetchBase<T>(path, init, options);
  }

  let accessToken = await ensureAdminAccessToken();

  try {
    return await kumbuApiFetchBase<T>(path, init, { ...options, accessToken });
  } catch (error) {
    if (error instanceof KumbuApiError && error.status === 401) {
      const refreshed = await refreshAdminAccessToken();
      if (refreshed) {
        return kumbuApiFetchBase<T>(path, init, { ...options, accessToken: refreshed });
      }
    }
    throw error;
  }
}
