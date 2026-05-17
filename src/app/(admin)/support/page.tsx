import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { SupportForm } from "./form";
import type { SupportSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("app_support_settings")
    .select("*")
    .eq("id", "global")
    .maybeSingle();

  return (
    <div>
      <PageHeader
        title="Suporte"
        subtitle="Mensagens automáticas e atalhos do chat de suporte da app."
      />
      <div className="kumbu-card p-5">
        <SupportForm settings={(data as SupportSettings) ?? null} />
      </div>
    </div>
  );
}
