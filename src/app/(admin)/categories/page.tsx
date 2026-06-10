import { adminList } from "@/lib/admin-data";

import { PageHeader } from "@/components/ui/page-header";

import { CategoryRow, NewCategoryForm } from "./forms";

import type { CatalogCategory, CatalogSubcategory } from "@/lib/types";



export const dynamic = "force-dynamic";



export default async function CategoriesPage() {

  const [cats, subs] = await Promise.all([

    adminList<CatalogCategory>("categories"),

    adminList<CatalogSubcategory>("categories/subcategories"),

  ]);



  const subsByCat = new Map<string, CatalogSubcategory[]>();

  for (const s of subs) {

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

        {cats.map((c) => (

          <CategoryRow key={c.id} category={c} subs={subsByCat.get(c.id) ?? []} />

        ))}

      </div>

    </div>

  );

}

