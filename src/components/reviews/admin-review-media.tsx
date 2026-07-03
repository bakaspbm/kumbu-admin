import type { ReviewMediaItem } from "@/lib/product-reviews";
import { resolveAssetUrl } from "@/lib/asset-url";

export function AdminReviewMedia({ media }: { media: ReviewMediaItem[] }) {
  if (media.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {media.map((item, i) => {
        const src = resolveAssetUrl(item.url);
        if (!src) return null;

        return item.type === "video" ? (
          <video
            key={`${item.url}-${i}`}
            src={src}
            controls
            playsInline
            className="max-h-40 max-w-full rounded-lg border border-slate-200 bg-black"
            preload="metadata"
          />
        ) : (
          <a
            key={`${item.url}-${i}`}
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-lg border border-slate-200"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="h-24 w-24 object-cover sm:h-28 sm:w-28"
            />
          </a>
        );
      })}
    </div>
  );
}
