import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminGet, adminList } from "@/lib/admin-data";
import { PageHeader } from "@/components/ui/page-header";
import { ProductForm } from "../product-form";
import { DeleteProductButton } from "./delete-button";
import { ProductImageGallery } from "@/components/products/product-image-gallery";
import { ProductReviewsPanel } from "@/components/reviews/product-reviews-panel";
import type {
  CatalogCategory,
  CatalogProduct,
  CatalogSubcategory,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, subcategories, sellers] = await Promise.all([
      adminGet<CatalogProduct>("products", id),
      adminList<CatalogCategory>("categories"),
      adminList<CatalogSubcategory>("categories/subcategories"),
      adminList<{ id: string; display_name: string | null; email: string | null }>("users"),
    ]);
    if (!product) notFound();
    const seller = product.seller_id ? sellers.find((s) => s.id === product.seller_id) : null;
    const sellerLabel = seller?.display_name?.trim() || seller?.email || product.seller_id || null;
    return (
      <div>
        <Link href="/products" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-kumbu-red">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <PageHeader
          title={product.title}
          subtitle={product.seller_id ? `Vendedor: ${sellerLabel} · ID: ${product.id}` : `ID: ${product.id} (sem vendedor — legado)`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {product.seller_id && (
                <Link href={`/users/${product.seller_id}`} className="kumbu-btn-ghost text-sm">
                  Ver vendedor
                </Link>
              )}
              <DeleteProductButton id={product.id} />
            </div>
          }
        />
        <ProductImageGallery product={product} />
        <div className="kumbu-card p-5">
          <ProductForm
            mode="edit"
            product={product}
            categories={categories}
            subcategories={subcategories}
          />
        </div>
        <ProductReviewsPanel productId={product.id} />
      </div>
    );
}