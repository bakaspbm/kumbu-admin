import { monetizationApi } from "@/lib/kumbu-api/monetization";
import { PageHeader } from "@/components/ui/page-header";
import { MonetizationOverview } from "./overview-client";
import { MonetizationSubNav } from "./monetization-subnav";

export const dynamic = "force-dynamic";

export default async function MonetizationPage() {
  const [overview, gate, pending] = await Promise.all([
    monetizationApi.overview(),
    monetizationApi.gate(),
    monetizationApi.pendingPayments(0, 20),
  ]);

  const pendingItems = pending.items ?? pending.content ?? [];

  return (
    <div>
      <PageHeader
        title="Monetização"
        subtitle="Rotina semanal, métricas, cobrança e pagamentos pendentes da plataforma."
      />
      <MonetizationSubNav active="/monetization" />
      <MonetizationOverview
        overview={overview}
        gate={gate}
        pendingPayments={pendingItems}
      />
    </div>
  );
}
