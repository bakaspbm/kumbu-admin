import { env } from "@/lib/env";

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
