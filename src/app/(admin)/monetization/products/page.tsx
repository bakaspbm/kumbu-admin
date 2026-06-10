import { monetizationApi } from "@/lib/kumbu-api/monetization";
import { PageHeader } from "@/components/ui/page-header";
import { MonetizationSubNav } from "../monetization-subnav";
import { MonetizationProductsClient } from "./products-client";

export const dynamic = "force-dynamic";

export default async function MonetizationProductsPage() {
  const data = await monetizationApi.products();
  const items = data.items ?? [];

  return (
    <div>
      <PageHeader
        title="Planos premium"
        subtitle="Destaque, VIP, boost e outros serviços pagos da plataforma (não são anúncios dos clientes)."
      />
      <MonetizationSubNav active="/monetization/products" />
      <MonetizationProductsClient products={items} />
    </div>
  );
}
