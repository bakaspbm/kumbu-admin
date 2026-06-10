import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { rentalsApi } from "@/lib/kumbu-api/rentals";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmada",
  rejected: "Rejeitada",
  cancelled: "Cancelada",
};

function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABEL[status] ?? status;
  const cls =
    status === "pending"
      ? "bg-amber-50 text-amber-800"
      : status === "confirmed"
        ? "bg-emerald-50 text-emerald-800"
        : status === "rejected"
          ? "bg-rose-50 text-rose-800"
          : "bg-slate-100 text-slate-600";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>
  );
}

type RentalRow = {
  id: string;
  product_title: string;
  renter_name: string;
  owner_name: string;
  rental_mode: string;
  check_in: string;
  check_out: string;
  nights: number;
  status: string;
  created_at: string;
};

export default async function RentalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "";
  const page = Math.max(0, Number(params.page ?? "0") || 0);

  let rows: RentalRow[] = [];
  let total = 0;
  let totalPages = 1;

  
    const data = await rentalsApi.list({
      status: status || undefined,
      page,
      size: 30,
    });
    rows = data.items;
    total = data.total;
    totalPages = data.total_pages;
  

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservas de imóveis"
        subtitle={`${total} pedido(s) — aluguer e reservas de propriedades.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/rentals"
              className={!status ? "kumbu-btn-primary text-sm" : "kumbu-btn-secondary text-sm"}
            >
              Todas
            </Link>
            <Link
              href="/rentals?status=pending"
              className={
                status === "pending" ? "kumbu-btn-primary text-sm" : "kumbu-btn-secondary text-sm"
              }
            >
              Pendentes
            </Link>
            <Link
              href="/rentals?status=confirmed"
              className={
                status === "confirmed" ? "kumbu-btn-primary text-sm" : "kumbu-btn-secondary text-sm"
              }
            >
              Confirmadas
            </Link>
            <Link
              href="/rentals?status=rejected"
              className={
                status === "rejected" ? "kumbu-btn-primary text-sm" : "kumbu-btn-secondary text-sm"
              }
            >
              Rejeitadas
            </Link>
          </div>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Sem reservas"
          description="Quando um utilizador solicitar reserva de um imóvel, o pedido aparece aqui."
        />
      ) : (
        <div className="kumbu-card overflow-hidden">
          <table className="kumbu-table">
            <thead>
              <tr>
                <th>Imóvel</th>
                <th>Inquilino</th>
                <th>Proprietário</th>
                <th>Período</th>
                <th>Modo</th>
                <th>Estado</th>
                <th>Pedido</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="text-sm font-medium">{row.product_title}</td>
                  <td className="text-sm">{row.renter_name}</td>
                  <td className="text-sm">{row.owner_name}</td>
                  <td className="whitespace-nowrap text-sm text-slate-600">
                    {row.check_in} → {row.check_out}
                    <span className="block text-xs text-slate-400">{row.nights} noite(s)</span>
                  </td>
                  <td className="text-sm capitalize">{row.rental_mode}</td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="whitespace-nowrap text-sm text-slate-500">
                    {formatDateTime(row.created_at)}
                  </td>
                  <td>
                    <Link
                      href={`/rentals/${row.id}`}
                      className="text-sm font-semibold text-kumbu-red hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex justify-center gap-2">
          {page > 0 ? (
            <Link
              href={`/rentals?${status ? `status=${status}&` : ""}page=${page - 1}`}
              className="kumbu-btn-secondary"
            >
              Anterior
            </Link>
          ) : null}
          <span className="self-center text-sm text-slate-500">
            Página {page + 1} de {totalPages}
          </span>
          {page + 1 < totalPages ? (
            <Link
              href={`/rentals?${status ? `status=${status}&` : ""}page=${page + 1}`}
              className="kumbu-btn-secondary"
            >
              Seguinte
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
