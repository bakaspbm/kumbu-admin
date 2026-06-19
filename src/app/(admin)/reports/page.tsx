import Link from "next/link";
import { Flag } from "lucide-react";
import { adminGet, adminList } from "@/lib/admin-data";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";
import {
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_TARGET_LABELS,
  reportStatusClass,
} from "@/lib/compliance-labels";
import { reportTargetHref } from "@/lib/report-target-link";
import type { ContentReport, ContentReportStatus, KumbuUser } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;
const STATUSES: (ContentReportStatus | "all")[] = [
  "all",
  "pending",
  "reviewing",
  "resolved",
  "dismissed",
];

function buildReportsHref(opts: {
  status: ContentReportStatus | "all";
  page?: number;
  reportedUserId?: string;
}) {
  const q = new URLSearchParams();
  if (opts.status !== "all") q.set("status", opts.status);
  if (opts.page && opts.page > 1) q.set("page", String(opts.page));
  if (opts.reportedUserId) q.set("reported_user_id", opts.reportedUserId);
  const s = q.toString();
  return s ? `/reports?${s}` : "/reports";
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    page?: string;
    reported_user_id?: string;
  }>;
}) {
  const params = await searchParams;
  const reportedUserId = params?.reported_user_id?.trim() || undefined;
  const statusFilter = (params?.status ??
    (reportedUserId ? "all" : "pending")) as ContentReportStatus | "all";
  const page = Math.max(1, Number(params?.page ?? "1") || 1);

  const [pendingRows, rows, users, reportedUser] = await Promise.all([
    adminList<ContentReport>("reports", { status: "pending", page: 1, size: 1 }),
    adminList<ContentReport>("reports", {
      status: statusFilter !== "all" ? statusFilter : undefined,
      reported_user_id: reportedUserId,
      page,
      size: PAGE_SIZE,
    }),
    adminList<{ id: string; display_name: string | null; email: string | null }>("users"),
    reportedUserId ? adminGet<KumbuUser>("users", reportedUserId) : Promise.resolve(null),
  ]);

  const userMap = new Map<string, string>();
  for (const u of users) userMap.set(u.id, u.display_name ?? u.email ?? u.id.slice(0, 8));

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const reportedLabel =
    reportedUser?.display_name?.trim() ||
    reportedUser?.email ||
    (reportedUserId ? reportedUserId.slice(0, 8) : null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Denúncias"
        subtitle={
          reportedLabel
            ? `Filtradas por utilizador reportado: ${reportedLabel} · ${total} na lista actual`
            : `${pendingRows.length} pendente(s) · ${total} na lista actual`
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => {
              const active = statusFilter === s;
              const href = buildReportsHref({
                status: s,
                reportedUserId,
              });
              const label = s === "all" ? "Todas" : (REPORT_STATUS_LABELS[s] ?? s);
              return (
                <Link
                  key={s}
                  href={href}
                  className={active ? "kumbu-btn-primary" : "kumbu-btn-secondary"}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        }
      />

      {reportedUserId ? (
        <div className="kumbu-panel-info flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm">
          <p>
            A mostrar denúncias contra{" "}
            <Link href={`/users/${reportedUserId}`} className="font-semibold text-kumbu-red hover:underline">
              {reportedLabel}
            </Link>
            .
          </p>
          <Link href="/reports" className="font-semibold text-kumbu-red hover:underline">
            Remover filtro
          </Link>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="Sem denúncias"
          description={
            reportedUserId
              ? "Nenhuma denúncia encontrada para este utilizador com o filtro actual."
              : statusFilter === "pending"
                ? "Nenhuma denúncia pendente — a fila está vazia."
                : "Nenhum registo com este filtro."
          }
        />
      ) : (
        <div className="kumbu-card overflow-hidden">
          <table className="kumbu-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Motivo</th>
                <th>Alvo</th>
                <th>Denunciante</th>
                <th>Reportado</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const targetLink = reportTargetHref(row.target_type, row.target_id);
                return (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap text-sm text-slate-500">
                      {formatDateTime(row.created_at)}
                    </td>
                    <td className="text-sm">
                      {REPORT_REASON_LABELS[row.reason] ?? row.reason}
                    </td>
                    <td className="text-sm">
                      <span className="text-slate-500">
                        {REPORT_TARGET_LABELS[row.target_type] ?? row.target_type}:{" "}
                      </span>
                      {targetLink ? (
                        <Link
                          href={targetLink}
                          className="font-medium text-kumbu-red hover:underline"
                        >
                          {row.target_id.slice(0, 12)}
                          {row.target_id.length > 12 ? "…" : ""}
                        </Link>
                      ) : (
                        <span className="font-mono text-xs">{row.target_id.slice(0, 16)}</span>
                      )}
                    </td>
                    <td>
                      <Link
                        href={`/users/${row.reporter_id}`}
                        className="text-sm hover:text-kumbu-red"
                      >
                        {userMap.get(row.reporter_id) ?? row.reporter_id.slice(0, 8)}
                      </Link>
                    </td>
                    <td>
                      {row.reported_user_id ? (
                        <Link
                          href={`/users/${row.reported_user_id}`}
                          className="text-sm hover:text-kumbu-red"
                        >
                          {userMap.get(row.reported_user_id) ??
                            row.reported_user_id.slice(0, 8)}
                        </Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${reportStatusClass(row.status)}`}
                      >
                        {REPORT_STATUS_LABELS[row.status] ?? row.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/reports/${row.id}`}
                        className="text-sm font-semibold text-kumbu-red hover:underline"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildReportsHref({
                status: statusFilter,
                page: page - 1,
                reportedUserId,
              })}
              className="kumbu-btn-secondary"
            >
              Anterior
            </Link>
          )}
          <span className="self-center text-sm text-slate-500">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildReportsHref({
                status: statusFilter,
                page: page + 1,
                reportedUserId,
              })}
              className="kumbu-btn-secondary"
            >
              Seguinte
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
