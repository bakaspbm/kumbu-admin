import { adminList } from "@/lib/admin-data";

import { PageHeader } from "@/components/ui/page-header";

import { MarketingForm } from "./forms";
import { HolidayForm } from "./holiday-forms";

import type { HolidayCampaign, MarketingBlock } from "@/lib/types";



export const dynamic = "force-dynamic";



export default async function MarketingPage() {

  const [blocks, holidays] = await Promise.all([
    adminList<MarketingBlock>("marketing"),
    adminList<HolidayCampaign>("holidays"),
  ]);

  return (

    <div className="space-y-6">

      <PageHeader

        title="Marketing"

        subtitle="Blocos hero, ofertas e campanhas de feriados exibidos na app Kumbu."

      />

      <section className="space-y-4">
        <div>
          <p className="kumbu-label">Feriados & temas</p>
          <h2 className="text-lg font-semibold text-kumbu-ink">
            Mensagens e cores por data nacional ou internacional
          </h2>
        </div>
        <HolidayForm isNew />
        <div className="grid gap-4 lg:grid-cols-2">
          {holidays.map((campaign) => (
            <HolidayForm key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="kumbu-label">Blocos promocionais</p>
          <h2 className="text-lg font-semibold text-kumbu-ink">Hero e tiras de ofertas</h2>
        </div>
        <MarketingForm isNew />
        <div className="grid gap-4 lg:grid-cols-2">
          {blocks.map((b) => (
            <MarketingForm key={b.id} block={b} />
          ))}
        </div>
      </section>

    </div>

  );

}

