import { monetizationApi } from "@/lib/kumbu-api/monetization";
import { PageHeader } from "@/components/ui/page-header";
import { MonetizationSubNav } from "../monetization-subnav";
import { MonetizationSettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export default async function MonetizationSettingsPage() {
  const [settings, providersData] = await Promise.all([
    monetizationApi.settings(),
    monetizationApi.paymentProviders(),
  ]);

  return (
    <div>
      <PageHeader
        title="Definições de monetização"
        subtitle="Empresa, SLA de pagamentos e contas bancárias da plataforma."
      />
      <MonetizationSubNav active="/monetization/settings" />
      <MonetizationSettingsClient
        settings={settings}
        providers={providersData.providers ?? []}
      />
    </div>
  );
}
