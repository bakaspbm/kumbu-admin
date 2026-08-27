"use client";

import { useState } from "react";
import { getProductCoverUrl } from "@/lib/asset-url";
import type { CatalogProduct } from "@/lib/types";

export function ProductCover({
  product,
  accentHex = "5C6BC0",
  className = "aspect-[4/3] w-full",
}: {
  product: Pick<CatalogProduct, "image_url" | "image_urls" | "title"> & {
    imageUrl?: string | null;
    imageUrls?: string[] | null;
  };
  accentHex?: string;
  className?: string;
}) {
  const src = getProductCoverUrl(product);
  const accent = accentHex.replace("#", "");
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={product.title}
        className={`${className} object-cover bg-slate-100`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        background: `linear-gradient(135deg, #${accent}33 0%, #${accent}aa 100%)`,
      }}
      aria-hidden
    />
  );
}
