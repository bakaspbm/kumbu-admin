import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { FilterForm } from "./forms";
import type { CategorySortFilter } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function FiltersPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("app_category_sort_filters")
    .select("*")
    .order("sort_order");
  const items = (data ?? []) as CategorySortFilter[];

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
