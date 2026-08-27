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

function parseJsonBody(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    throw new KumbuApiError("Resposta inválida do servidor.", 502);
  }
}

function parseErrorBody(text: string): ApiErrorBody | null {
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as ApiErrorBody;
  } catch {
    return null;
  }
}

function throwForStatus(status: number, path: string, text: string): never {
  const body = parseErrorBody(text);
  const message =
    body?.message ||
    (status === 403
      ? `Acesso bloqueado (403) em ${path}. Se persistir, desactiva Bot Fight Mode no Cloudflare.`
      : `Kumbu API request failed (${status}) for ${path}.`);
  throw new KumbuApiError(message, status, body?.code, body?.fields);
}

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

  const text = await response.text();

  if (!response.ok) {
    throwForStatus(response.status, path, text);
  }

  if (response.status === 204 || response.status === 205 || !text.trim()) {
    return undefined as unknown as T;
  }

  return parseJsonBody(text) as T;
}

export { parseJsonBody, parseErrorBody, throwForStatus };
