import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { PaymentForm } from "./forms";
import type { PaymentMethod } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PaymentMethodsPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("app_payment_methods")
    .select("*")
    .order("sort_order");

  const methods = (data ?? []) as PaymentMethod[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Métodos de pagamento"
        subtitle="Métodos exibidos no perfil e checkout da app Kumbu."
      />
      <PaymentForm isNew />
      <div className="grid gap-4 lg:grid-cols-2">
        {methods.map((m) => (
          <PaymentForm key={m.id} method={m} />
        ))}
      </div>
    </div>
  );
}
