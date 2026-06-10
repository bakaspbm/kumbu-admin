import Link from "next/link";
import { Briefcase } from "lucide-react";
import { jobsApi } from "@/lib/kumbu-api/jobs";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";
import { JobsSubNav } from "./jobs-subnav";
import { JobListingActions } from "./job-listing-actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  active: "Activa",
  filled_hidden: "Preenchida (oculta)",
  inactive: "Inactiva",
};

function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABEL[status] ?? status;
  const cls =
    status === "active"
      ? "bg-emerald-50 text-emerald-800"
      : status === "filled_hidden"
        ? "bg-slate-100 text-slate-600"
        : "bg-amber-50 text-amber-800";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>
  );
}

type JobRow = {
  id: string;
  title: string;
  price_label: string | null;
  job_listing_status: string;
  seller_name: string | null;
  seller_email: string | null;
  seller_id: string;
  created_at: string;
  deleted_at: string | null;
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "";
  const q = (params.q ?? "").trim();
  const page = Math.max(0, Number(params.page ?? "0") || 0);

  let rows: JobRow[] = [];
  let total = 0;
  let totalPages = 1;

  
    const data = await jobsApi.listListings({
      status: status || undefined,
      q: q || undefined,
      page,
      size: 30,
    });
    rows = data.items;
    total = data.total;
    totalPages = data.total_pages;
  

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vagas de emprego"
        subtitle={`${total} vaga(s) — moderação separada dos anúncios de produtos.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/jobs"
              className={!status ? "kumbu-btn-primary text-sm" : "kumbu-btn-secondary text-sm"}
            >
              Todas
            </Link>
            <Link
              href="/jobs?status=active"
              className={
                status === "active" ? "kumbu-btn-primary text-sm" : "kumbu-btn-secondary text-sm"
              }
            >
              Activas
            </Link>
            <Link
              href="/jobs?status=filled_hidden"
              className={
                status === "filled_hidden"
                  ? "kumbu-btn-primary text-sm"
                  : "kumbu-btn-secondary text-sm"
              }
            >
              Preenchidas
            </Link>
          </div>
        }
      />
      <JobsSubNav active="/jobs" />

      <form className="kumbu-card flex flex-wrap items-end gap-3 p-4">
        <label className="flex-1 min-w-[200px] space-y-1.5">
          <span className="kumbu-label">Pesquisa</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Título da vaga"
            className="kumbu-input"
          />
        </label>
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <button className="kumbu-btn-ghost">Filtrar</button>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Sem vagas"
          description="As vagas publicadas pelos utilizadores aparecem aqui para moderação."
        />
      ) : (
        <div className="kumbu-card overflow-hidden">
          <table className="kumbu-table">
            <thead>
              <tr>
                <th>Vaga</th>
                <th>Empregador</th>
                <th>Estado</th>
                <th>Publicada</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="text-sm font-medium">{row.title}</div>
                    {row.price_label ? (
                      <div className="text-xs text-slate-500">{row.price_label}</div>
                    ) : null}
                  </td>
                  <td>
                    <div className="text-sm">
                      {row.seller_name ?? row.seller_email ?? row.seller_id.slice(0, 8)}
                    </div>
                    {row.seller_email ? (
                      <div className="text-xs text-slate-500">{row.seller_email}</div>
                    ) : null}
                  </td>
                  <td>
                    <StatusBadge status={row.job_listing_status} />
                  </td>
                  <td className="whitespace-nowrap text-sm text-slate-500">
                    {formatDateTime(row.created_at)}
                  </td>
                  <td>
                    <JobListingActions id={row.id} status={row.job_listing_status} />
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
              href={`/jobs?${status ? `status=${status}&` : ""}${q ? `q=${encodeURIComponent(q)}&` : ""}page=${page - 1}`}
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
              href={`/jobs?${status ? `status=${status}&` : ""}${q ? `q=${encodeURIComponent(q)}&` : ""}page=${page + 1}`}
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
