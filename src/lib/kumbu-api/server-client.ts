import "server-only";

import { KumbuApiError } from "@/lib/kumbu-api/api-error";
import { kumbuApiFetchBase, type KumbuFetchOptions } from "@/lib/kumbu-api/fetch";
import { readAdminAccessToken } from "@/lib/kumbu-api/admin-session";

export { KumbuApiError } from "@/lib/kumbu-api/api-error";
export { getKumbuApiBaseUrl } from "@/lib/kumbu-api/config";
export { readAdminAccessToken, ensureAdminAccessToken } from "@/lib/kumbu-api/admin-session";

export async function getKumbuAccessToken(): Promise<string | null> {
  return readAdminAccessToken();
}

export async function kumbuApiFetch<T>(
  path: string,
  init: RequestInit = {},
  options: Omit<KumbuFetchOptions, "accessToken"> = {},
): Promise<T> {
  if (!options.withAuth) {
    return kumbuApiFetchBase<T>(path, init, options);
  }

  const accessToken = await readAdminAccessToken();
  if (!accessToken) {
    throw new KumbuApiError("Sessão expirada.", 401);
  }

  return kumbuApiFetchBase<T>(path, init, { ...options, accessToken });
}
