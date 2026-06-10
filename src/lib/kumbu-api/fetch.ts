import { KumbuApiError } from "@/lib/kumbu-api/api-error";
import { getKumbuApiBaseUrl } from "@/lib/kumbu-api/config";

type ApiErrorBody = {
  code?: string;
  message?: string;
  fields?: Record<string, string>;
};

export type KumbuFetchOptions = {
  withAuth?: boolean;
  accessToken?: string | null;
};

/** Fetch base — sem next/headers; seguro para importar em qualquer bundle. */
export async function kumbuApiFetchBase<T>(
  path: string,
  init: RequestInit = {},
  options: KumbuFetchOptions = {},
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${getKumbuApiBaseUrl()}${normalizedPath}`;
  const headers = new Headers(init.headers ?? {});

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (options.withAuth && options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  const response = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = null;
    }
    const message =
      body?.message ||
      `Kumbu API request failed (${response.status}) for ${path}.`;
    throw new KumbuApiError(message, response.status, body?.code, body?.fields);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return (await response.json()) as T;
}
