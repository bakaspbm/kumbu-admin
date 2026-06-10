import { monetizationApi } from "@/lib/kumbu-api/monetization";
import { PageHeader } from "@/components/ui/page-header";
import { MonetizationSubNav } from "../monetization-subnav";
import { MonetizationCategoriesClient } from "./categories-client";

export const dynamic = "force-dynamic";

export default async function MonetizationCategoriesPage() {
  const matrix = await monetizationApi.categoryMatrix();

  return (
    <div>
      <PageHeader
        title="Monetização por categoria"
        subtitle="Matriz de estratégias — cada categoria monetiza de forma diferente."
      />
      <MonetizationSubNav active="/monetization/categories" />
      <MonetizationCategoriesClient matrix={matrix} />
    </div>
  );
}
