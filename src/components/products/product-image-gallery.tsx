import { getProductImageUrls } from "@/lib/asset-url";
import type { CatalogProduct } from "@/lib/types";

export function ProductImageGallery({
  product,
}: {
  product: Pick<CatalogProduct, "image_url" | "image_urls" | "title">;
}) {
  const images = getProductImageUrls(product);
  if (images.length === 0) return null;

  return (
    <div className="kumbu-card mb-4 overflow-hidden p-4">
      <p className="kumbu-label mb-3">Fotos do anúncio</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((src) => (
          <a
            key={src}
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
            title="Abrir imagem em tamanho real"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={product.title}
              className="aspect-[4/3] w-full object-cover transition hover:scale-[1.02]"
              loading="lazy"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
