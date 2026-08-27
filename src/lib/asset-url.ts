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

/**
 * Origem pública para URLs no browser.
 * Nunca usar KUMBU_API_URL (pode ser IP do VPS para bypass Cloudflare no servidor).
 */
function publicBackendOrigin(): string {
  const publicApi =
    process.env.NEXT_PUBLIC_KUMBU_API_URL?.trim() ||
    "https://api.kumbu-market.com/api/v1";
  return publicApi.replace(/\/api\/v1\/?$/, "");
}

function isPrivateOrLocalHost(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) return true;
  return false;
}

/** Quebra cache CDN de respostas 5xx antigas em /files/ (mesmo padrão do site). */
export function withAssetCacheBust(url: string): string {
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname === "api.kumbu-market.com" &&
      parsed.pathname.startsWith("/files/") &&
      !parsed.searchParams.has("v")
    ) {
      parsed.searchParams.set("v", "2");
      return parsed.href;
    }
  } catch {
    /* ignore */
  }
  return url;
}

/** Normaliza URLs de fotos guardadas pelo backend (localhost, IP local ou path relativo). */
export function resolveAssetUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  const origin = publicBackendOrigin();

  if (trimmed.startsWith("/files/")) {
    return withAssetCacheBust(`${origin}${trimmed}`);
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith("/files/")) {
      // Reescreve só hosts internos/IP; mantém CDN e api.kumbu-market.com públicos
      if (isPrivateOrLocalHost(parsed.hostname)) {
        return withAssetCacheBust(`${origin}${parsed.pathname}${parsed.search}`);
      }
      return withAssetCacheBust(trimmed);
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

type ProductImageFields = {
  image_url?: string | null;
  image_urls?: string[] | null;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
};

function firstImageUrl(product: ProductImageFields): string | null {
  const list = product.image_urls ?? product.imageUrls;
  const fromList = list?.find((url) => url?.trim());
  return fromList ?? product.image_url ?? product.imageUrl ?? null;
}

export function getProductCoverUrl(product: ProductImageFields): string | null {
  return resolveAssetUrl(firstImageUrl(product));
}

export function getProductImageUrls(product: ProductImageFields): string[] {
  const list = product.image_urls ?? product.imageUrls;
  const raw =
    list?.length
      ? list
      : product.image_url || product.imageUrl
        ? [product.image_url ?? product.imageUrl!]
        : [];
  return raw
    .map((url) => resolveAssetUrl(url))
    .filter((url): url is string => Boolean(url));
}
