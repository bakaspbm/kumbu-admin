import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { ProductForm } from "../product-form";
import { DeleteProductButton } from "./delete-button";
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
  const supabase = await createSupabaseServerClient();

  const [productRes, catsRes, subsRes] = await Promise.all([
    supabase.from("catalog_products").select("*").eq("id", id).maybeSingle(),
    supabase.from("catalog_categories").select("*").order("sort_order"),
    supabase.from("catalog_subcategories").select("*").order("sort_order"),
  ]);

  const product = productRes.data as CatalogProduct | null;
  if (!product) notFound();

  return (
    <div>
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-kumbu-red"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <PageHeader
        title={product.title}
        subtitle={`ID: ${product.id}`}
        actions={<DeleteProductButton id={product.id} />}
      />
      <div className="kumbu-card p-5">
        <ProductForm
          mode="edit"
          product={product}
          categories={(catsRes.data ?? []) as CatalogCategory[]}
          subcategories={(subsRes.data ?? []) as CatalogSubcategory[]}
        />
      </div>
    </div>
  );
}
