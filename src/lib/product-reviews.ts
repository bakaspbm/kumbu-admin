export type ReviewMediaItem = { type: "image" | "video"; url: string };

export type AdminProductReview = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  media: ReviewMediaItem[];
  seller_reply: string | null;
  seller_reply_at: string | null;
  created_at: string;
  reviewer_name: string;
  product_title: string;
  seller_id: string | null;
};

export function parseReviewMedia(raw: unknown): ReviewMediaItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m): m is ReviewMediaItem => {
      if (!m || typeof m !== "object") return false;
      const item = m as ReviewMediaItem;
      return (
        (item.type === "image" || item.type === "video") &&
        typeof item.url === "string" &&
        item.url.length > 0
      );
    })
    .map((m) => ({
      type: m.type === "video" ? "video" : "image",
      url: m.url,
    }));
}

export function mapAdminProductReview(
  row: Record<string, unknown>,
  reviewer?: { display_name?: string | null; email?: string | null } | null,
  product?: { title?: string | null; seller_id?: string | null } | null,
): AdminProductReview {
  return {
    id: String(row.id),
    product_id: String(row.product_id),
    user_id: String(row.user_id),
    rating: Number(row.rating),
    comment: (row.comment as string) ?? null,
    media: parseReviewMedia(row.media),
    seller_reply: (row.seller_reply as string) ?? null,
    seller_reply_at: (row.seller_reply_at as string) ?? null,
    created_at: String(row.created_at),
    reviewer_name:
      reviewer?.display_name?.trim() ||
      reviewer?.email?.trim() ||
      String(row.user_id).slice(0, 8),
    product_title: product?.title?.trim() || String(row.product_id),
    seller_id: product?.seller_id ? String(product.seller_id) : null,
  };
}
