import { adminList } from "@/lib/admin-data";

import { PageHeader } from "@/components/ui/page-header";

import { MarketingForm } from "./forms";

import type { MarketingBlock } from "@/lib/types";



export const dynamic = "force-dynamic";



export default async function MarketingPage() {

  const blocks = await adminList<MarketingBlock>("marketing");

  return (

    <div className="space-y-6">

      <PageHeader

        title="Marketing"

        subtitle="Blocos hero e tiras de ofertas exibidos na app Kumbu."

      />

      <MarketingForm isNew />

      <div className="grid gap-4 lg:grid-cols-2">

        {blocks.map((b) => (

          <MarketingForm key={b.id} block={b} />

        ))}

      </div>

    </div>

  );

}

