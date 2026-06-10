import Link from "next/link";
import { Star } from "lucide-react";
import { adminList } from "@/lib/admin-data";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminReviewCard } from "@/components/reviews/admin-review-card";
import { mapAdminProductReview } from "@/lib/product-reviews";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; product?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page ?? "1") || 1);
  const productFilter = params?.product?.trim() || "";
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const data = await adminList<Record<string, unknown>>("reviews", {
      page,
      size: PAGE_SIZE,
      product_id: productFilter || undefined,
    });
    const total = data.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const reviews = data.map((row) => {
      const r = row as Record<string, unknown>;
      const reviewer = r.reviewer as { display_name?: string; email?: string } | null;
      const product = r.product as { title?: string; seller_id?: string } | null;
      return mapAdminProductReview(r, reviewer, product);
    });
    return (
      <div>
        <PageHeader title="Avaliações de anúncios" subtitle="Comentários, fotos, vídeos e respostas dos vendedores. Moderação: eliminar conteúdo inadequado." />
        {productFilter && (<p className="mb-4 text-sm text-slate-600">Filtro: anúncio <Link href={`/products/${productFilter}`} className="font-medium text-kumbu-red hover:underline">{productFilter}</Link>{" · "}<Link href="/reviews" className="text-kumbu-red hover:underline">Limpar filtro</Link></p>)}
        {reviews.length === 0 && (<EmptyState title="Nenhuma avaliação" description="As avaliações dos compradores aparecem aqui depois de «Comprei» no chat ou compra concluída." />)}
        {reviews.length > 0 && (<ul className="space-y-4">{reviews.map((review) => (<li key={review.id}><AdminReviewCard review={review} /></li>))}</ul>)}
        {totalPages > 1 && (<nav className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">{page > 1 && (<Link href={`/reviews?page=${page - 1}${productFilter ? `&product=${productFilter}` : ""}`} className="kumbu-btn-ghost">← Anterior</Link>)}<span className="text-slate-500">Página {page} de {totalPages} ({total} total)</span>{page < totalPages && (<Link href={`/reviews?page=${page + 1}${productFilter ? `&product=${productFilter}` : ""}`} className="kumbu-btn-ghost">Seguinte →</Link>)}</nav>)}
      </div>
    );

}