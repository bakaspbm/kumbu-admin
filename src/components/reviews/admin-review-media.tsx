import type { ReviewMediaItem } from "@/lib/product-reviews";

export function AdminReviewMedia({ media }: { media: ReviewMediaItem[] }) {
  if (media.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {media.map((item, i) =>
        item.type === "video" ? (
          <video
            key={`${item.url}-${i}`}
            src={item.url}
            controls
            playsInline
            className="max-h-40 max-w-full rounded-lg border border-slate-200 bg-black"
            preload="metadata"
          />
        ) : (
          <a
            key={`${item.url}-${i}`}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-lg border border-slate-200"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt=""
              className="h-24 w-24 object-cover sm:h-28 sm:w-28"
            />
          </a>
        ),
      )}
    </div>
  );
}
