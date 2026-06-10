import { adminList } from "@/lib/admin-data";

import { PageHeader } from "@/components/ui/page-header";

import { FilterForm } from "./forms";

import type { CategorySortFilter } from "@/lib/types";



export const dynamic = "force-dynamic";



export default async function FiltersPage() {

  const items = await adminList<CategorySortFilter>("filters");

  return (

    <div className="space-y-6">

      <PageHeader

        title="Filtros de ordenação"

        subtitle="Chips de ordenação mostrados nas listas por categoria."

      />

      <FilterForm isNew />

      <div className="space-y-3">

        {items.map((f) => (

          <FilterForm key={f.id} filter={f} />

        ))}

      </div>

    </div>

  );

}

