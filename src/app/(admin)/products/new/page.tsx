import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { ProductForm } from "../product-form";
import type { CatalogCategory, CatalogSubcategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = await createSupabaseServerClient();
  const [{ data: cats }, { data: subs }] = await Promise.all([
    supabase.from("catalog_categories").select("*").order("sort_order"),
    supabase.from("catalog_subcategories").select("*").order("sort_order"),
  ]);

  return (
    <div>
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-kumbu-red"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <PageHeader
        title="Novo produto"
        subtitle="Adiciona um produto ao catálogo Kumbu."
      />
      <div className="kumbu-card p-5">
        <ProductForm
          mode="create"
          categories={(cats ?? []) as CatalogCategory[]}
          subcategories={(subs ?? []) as CatalogSubcategory[]}
        />
      </div>
    </div>
  );
}
