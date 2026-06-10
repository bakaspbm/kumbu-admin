import Link from "next/link";
import { FileCheck } from "lucide-react";
import { jobsApi } from "@/lib/kumbu-api/jobs";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";
import { JobsSubNav } from "../jobs-subnav";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  accepted: "Aceite",
  rejected: "Rejeitada",
};

function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABEL[status] ?? status;
  const cls =
    status === "pending"
      ? "bg-amber-50 text-amber-800"
      : status === "accepted"
        ? "bg-emerald-50 text-emerald-800"
        : "bg-rose-50 text-rose-800";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>
  );
}

type ApplicationRow = {
  id: string;
  job_title: string;
  applicant_name: string;
  employer_name: string;
  cv_title: string | null;
  status: string;
  created_at: string;
};

export default async function JobApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "";
  const page = Math.max(0, Number(params.page ?? "0") || 0);

  let rows: ApplicationRow[] = [];
  let total = 0;
  let totalPages = 1;

  
    const data = await jobsApi.listApplications({
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
        title="Candidaturas a vagas"
        subtitle={`${total} candidatura(s) — fila dedicada para acompanhar pedidos de emprego.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/jobs/applications"
              className={!status ? "kumbu-btn-primary text-sm" : "kumbu-btn-secondary text-sm"}
            >
              Todas
            </Link>
            <Link
              href="/jobs/applications?status=pending"
              className={
                status === "pending" ? "kumbu-btn-primary text-sm" : "kumbu-btn-secondary text-sm"
              }
            >
              Pendentes
            </Link>
            <Link
              href="/jobs/applications?status=accepted"
              className={
                status === "accepted" ? "kumbu-btn-primary text-sm" : "kumbu-btn-secondary text-sm"
              }
            >
              Aceites
            </Link>
            <Link
              href="/jobs/applications?status=rejected"
              className={
                status === "rejected" ? "kumbu-btn-primary text-sm" : "kumbu-btn-secondary text-sm"
              }
            >
              Rejeitadas
            </Link>
          </div>
        }
      />
      <JobsSubNav active="/jobs/applications" />

      {rows.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="Sem candidaturas"
          description="Quando um utilizador se candidatar a uma vaga, o pedido aparece aqui."
        />
      ) : (
        <div className="kumbu-card overflow-hidden">
          <table className="kumbu-table">
            <thead>
              <tr>
                <th>Vaga</th>
                <th>Candidato</th>
                <th>Empregador</th>
                <th>CV</th>
                <th>Estado</th>
                <th>Data</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="text-sm font-medium">{row.job_title}</td>
                  <td className="text-sm">{row.applicant_name}</td>
                  <td className="text-sm">{row.employer_name}</td>
                  <td className="text-sm text-slate-600">{row.cv_title ?? "—"}</td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="whitespace-nowrap text-sm text-slate-500">
                    {formatDateTime(row.created_at)}
                  </td>
                  <td>
                    <Link
                      href={`/jobs/applications/${row.id}`}
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
              href={`/jobs/applications?${status ? `status=${status}&` : ""}page=${page - 1}`}
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
              href={`/jobs/applications?${status ? `status=${status}&` : ""}page=${page + 1}`}
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
