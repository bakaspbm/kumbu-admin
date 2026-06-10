import "server-only";

import { cookies } from "next/headers";
import { kumbuApiFetchBase, type KumbuFetchOptions } from "@/lib/kumbu-api/fetch";
import { ADMIN_ACCESS_COOKIE } from "@/lib/kumbu-api/session-cookies";

export { KumbuApiError } from "@/lib/kumbu-api/api-error";
export { getKumbuApiBaseUrl } from "@/lib/kumbu-api/config";

export async function getKumbuAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_ACCESS_COOKIE)?.value ?? null;
}

export async function kumbuApiFetch<T>(
  path: string,
  init: RequestInit = {},
  options: Omit<KumbuFetchOptions, "accessToken"> = {},
): Promise<T> {
  const accessToken = options.withAuth ? await getKumbuAccessToken() : null;
  return kumbuApiFetchBase<T>(path, init, { ...options, accessToken });
}
