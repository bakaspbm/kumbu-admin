import Link from "next/link";
import { adminList } from "@/lib/admin-data";
import { AdminReviewCard } from "@/components/reviews/admin-review-card";
import { mapAdminProductReview } from "@/lib/product-reviews";
import { EmptyState } from "@/components/ui/empty-state";
import { Star } from "lucide-react";

export async function ProductReviewsPanel({ productId }: { productId: string }) {
  const data = await adminList<Record<string, unknown>>("reviews", {
    product_id: productId,
    limit: 50,
  });

  const reviews = data.map((row) => {
    const reviewer = row.reviewer as { display_name?: string; email?: string } | null;
    const product = row.product as { title?: string; seller_id?: string } | null;
    return mapAdminProductReview(row, reviewer, product);
  });

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Star className="h-5 w-5 text-amber-400" aria-hidden />
          Avaliações ({reviews.length})
        </h2>
        <Link href="/reviews" className="text-sm font-medium text-kumbu-red hover:underline">
          Ver todas no painel →
        </Link>
      </div>
      {reviews.length === 0 ? (
        <EmptyState
          title="Sem avaliações"
          description="Quando compradores avaliarem este anúncio (com texto, fotos ou vídeo), aparecem aqui."
        />
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id}>
              <AdminReviewCard review={review} showProductLink={false} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
