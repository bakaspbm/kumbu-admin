import Link from "next/link";
import { Star } from "lucide-react";
import { AdminReviewMedia } from "@/components/reviews/admin-review-media";
import { DeleteReviewButton } from "@/components/reviews/delete-review-button";
import { formatDateTime } from "@/lib/utils";
import type { AdminProductReview } from "@/lib/product-reviews";
import { cn } from "@/lib/utils";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "h-4 w-4",
            n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200",
          )}
          aria-hidden
        />
      ))}
    </span>
  );
}

export function AdminReviewCard({
  review,
  showProductLink = true,
}: {
  review: AdminProductReview;
  showProductLink?: boolean;
}) {
  return (
    <article className="kumbu-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-slate-900">{review.reviewer_name}</span>
            <Stars rating={review.rating} />
            <span className="text-slate-500">{formatDateTime(review.created_at)}</span>
          </div>
          {showProductLink && (
            <p className="mt-1 text-sm">
              <span className="text-slate-500">Anúncio: </span>
              <Link
                href={`/products/${review.product_id}`}
                className="font-medium text-kumbu-red hover:underline"
              >
                {review.product_title}
              </Link>
              {review.seller_id && (
                <>
                  {" "}
                  ·{" "}
                  <Link
                    href={`/users/${review.seller_id}`}
                    className="text-slate-600 hover:text-kumbu-red"
                  >
                    Vendedor
                  </Link>
                </>
              )}
            </p>
          )}
          {review.comment && (
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{review.comment}</p>
          )}
          <AdminReviewMedia media={review.media} />
          {review.seller_reply && (
            <div className="mt-3 rounded-lg border-l-4 border-kumbu-red bg-slate-50 px-3 py-2">
              <p className="text-xs font-bold text-kumbu-red">Resposta do vendedor</p>
              <p className="mt-1 text-sm text-slate-800">{review.seller_reply}</p>
              {review.seller_reply_at && (
                <p className="mt-1 text-xs text-slate-500">
                  {formatDateTime(review.seller_reply_at)}
                </p>
              )}
            </div>
          )}
          {!review.seller_reply && (
            <p className="mt-2 text-xs text-slate-400">Sem resposta do vendedor.</p>
          )}
        </div>
        <DeleteReviewButton reviewId={review.id} />
      </div>
    </article>
  );
}
