import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { rentalsApi } from "@/lib/kumbu-api/rentals";
import { PageHeader } from "@/components/ui/page-header";
import { JsonBlock } from "@/components/ui/json-block";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmada",
  rejected: "Rejeitada",
  cancelled: "Cancelada",
};

export default async function RentalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rental = await rentalsApi.get(id).catch(() => null);
  if (!rental) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/rentals"
        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-kumbu-red"
      >
        <ArrowLeft className="size-4" />
        Voltar às reservas
      </Link>
      <PageHeader
        title={rental.product_title}
        subtitle={`${STATUS_LABEL[rental.status] ?? rental.status} · ${formatDateTime(rental.created_at)}`}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="kumbu-card space-y-3 p-5 text-sm">
          <Row label="Anúncio" value={rental.product_title} />
          <Row label="Modo" value={rental.rental_mode} />
          <Row label="Check-in" value={rental.check_in} />
          <Row label="Check-out" value={rental.check_out} />
          <Row label="Noites" value={String(rental.nights)} />
          <Row
            label="Inquilino"
            value={
              <Link href={`/users/${rental.renter_id}`} className="text-kumbu-red hover:underline">
                {rental.renter_name || rental.renter_email || rental.renter_id}
              </Link>
            }
          />
          <Row
            label="Proprietário"
            value={
              <Link href={`/users/${rental.owner_id}`} className="text-kumbu-red hover:underline">
                {rental.owner_name || rental.owner_email || rental.owner_id}
              </Link>
            }
          />
          {rental.guest_message && <Row label="Mensagem" value={rental.guest_message} />}
          {rental.conversation_id && (
            <Row
              label="Conversa"
              value={
                <Link href={`/conversations/${rental.conversation_id}`} className="text-kumbu-red hover:underline">
                  Abrir chat
                </Link>
              }
            />
          )}
        </div>
        <JsonBlock label="Payload completo" data={rental} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="kumbu-label">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
