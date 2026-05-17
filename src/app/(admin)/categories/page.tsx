import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { CategoryRow, NewCategoryForm } from "./forms";
import type { CatalogCategory, CatalogSubcategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const supabase = await createSupabaseServerClient();
  const [{ data: cats }, { data: subs }] = await Promise.all([
    supabase.from("catalog_categories").select("*").order("sort_order"),
    supabase.from("catalog_subcategories").select("*").order("sort_order"),
  ]);

  const subsByCat = new Map<string, CatalogSubcategory[]>();
  for (const s of (subs ?? []) as CatalogSubcategory[]) {
    const arr = subsByCat.get(s.category_id) ?? [];
    arr.push(s);
    subsByCat.set(s.category_id, arr);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias"
        subtitle="Gere categorias e subcategorias usadas no catálogo Kumbu."
      />
      <NewCategoryForm />
      <div className="grid gap-4 lg:grid-cols-2">
        {((cats ?? []) as CatalogCategory[]).map((c) => (
          <CategoryRow key={c.id} category={c} subs={subsByCat.get(c.id) ?? []} />
        ))}
      </div>
    </div>
  );
}
