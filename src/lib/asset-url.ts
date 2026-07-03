import { env } from "@/lib/env";

const SECURE_CHAT_FILE_PATH = /\/api\/v1\/files\/chat\/(.+)$/;

/** Documentos KYC — proxy Next com token admin (cookies HttpOnly). */
export function toBrowserIdentityDocumentUrl(userId: string, side: string): string {
  return `/api/kumbu/admin/identity/users/${encodeURIComponent(userId)}/documents/${encodeURIComponent(side)}`;
}

/** Anexos de chat exigem sessão — no browser usam o proxy Next (cookies HttpOnly). */
export function toBrowserSecureFileUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith("/api/kumbu/files/chat/")) return trimmed;

  let relativePath: string | null = null;
  try {
    const parsed = new URL(trimmed);
    const match = parsed.pathname.match(SECURE_CHAT_FILE_PATH);
    if (match) relativePath = match[1];
  } catch {
    const match = trimmed.match(/^\/?api\/v1\/files\/chat\/(.+)$/);
    if (match) relativePath = match[1];
  }

  if (!relativePath) return trimmed;
  return `/api/kumbu/files/chat/${relativePath}`;
}

function backendOrigin(): string {
  return env.kumbuApiUrl.replace(/\/api\/v1\/?$/, "");
}

/** Normaliza URLs de fotos guardadas pelo backend (localhost, IP local ou path relativo). */
export function resolveAssetUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  const origin = backendOrigin();

  if (trimmed.startsWith("/files/")) {
    return `${origin}${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith("/files/")) {
      return `${origin}${parsed.pathname}${parsed.search}`;
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

export function getProductCoverUrl(product: {
  image_url?: string | null;
  image_urls?: string[] | null;
}): string | null {
  const fromList = product.image_urls?.find((url) => url?.trim());
  return resolveAssetUrl(fromList ?? product.image_url ?? null);
}

export function getProductImageUrls(product: {
  image_url?: string | null;
  image_urls?: string[] | null;
}): string[] {
  const raw =
    product.image_urls?.length
      ? product.image_urls
      : product.image_url
        ? [product.image_url]
        : [];
  return raw
    .map((url) => resolveAssetUrl(url))
    .filter((url): url is string => Boolean(url));
}
