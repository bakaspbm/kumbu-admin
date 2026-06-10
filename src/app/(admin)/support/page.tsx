import { adminFetch } from "@/lib/admin-data";

import { PageHeader } from "@/components/ui/page-header";

import { SupportForm } from "./form";

import { SupportSubNav } from "./support-subnav";

import type { SupportSettings } from "@/lib/types";



export const dynamic = "force-dynamic";



export default async function SupportPage() {

  const data = await adminFetch<SupportSettings>("app/support-settings");



  return (

    <div>

      <PageHeader

        title="Suporte"

        subtitle="Mensagens automáticas e atalhos do chat de suporte da app."

      />

      <SupportSubNav active="/support" />

      <div className="kumbu-card p-5">

        <SupportForm settings={data} />

      </div>

    </div>

  );

}

