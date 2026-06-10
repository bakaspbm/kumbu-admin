import Link from "next/link";
import { Flag } from "lucide-react";
import { adminList } from "@/lib/admin-data";
import { formatDateTime } from "@/lib/utils";
import {
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
  reportStatusClass,
} from "@/lib/compliance-labels";
import { reportTargetHref } from "@/lib/report-target-link";
import type { ContentReport } from "@/lib/types";

export async function UserReportsSection({ userId }: { userId: string }) {
  const [asReported, asReporter] = await Promise.all([
    adminList<ContentReport>("reports", { reported_user_id: userId, limit: 15 }),
    adminList<ContentReport>("reports", { reporter_id: userId, limit: 10 }),
  ]);

  const reportedRows = asReported;
  const reporterRows = asReporter;

  if (reportedRows.length === 0 && reporterRows.length === 0) {
    return null;
  }

  return (
    <section className="kumbu-card p-5">
      <div className="flex items-center gap-2">
        <Flag className="size-5 text-kumbu-red" />
        <h2 className="text-lg font-bold">Denúncias</h2>
      </div>

      {reportedRows.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-700">
            Contra este utilizador ({reportedRows.length})
          </p>
          <ReportList rows={reportedRows} />
        </div>
      )}

      {reporterRows.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-700">
            Enviadas por este utilizador ({reporterRows.length})
          </p>
          <ReportList rows={reporterRows} />
        </div>
      )}
    </section>
  );
}

function ReportList({ rows }: { rows: ContentReport[] }) {
  return (
    <ul className="mt-2 divide-y divide-slate-100">
      {rows.map((r) => {
        const targetLink = reportTargetHref(r.target_type, r.target_id);
        return (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div className="min-w-0 text-sm">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${reportStatusClass(r.status)}`}
              >
                {REPORT_STATUS_LABELS[r.status] ?? r.status}
              </span>
              <span className="ml-2 text-slate-600">
                {REPORT_REASON_LABELS[r.reason] ?? r.reason}
              </span>
              <p className="mt-0.5 text-xs text-slate-400">
                {formatDateTime(r.created_at)}
                {targetLink ? (
                  <>
                    {" · "}
                    <Link href={targetLink} className="text-kumbu-red hover:underline">
                      Ver alvo
                    </Link>
                  </>
                ) : null}
              </p>
            </div>
            <Link
              href={`/reports/${r.id}`}
              className="shrink-0 text-sm font-semibold text-kumbu-red hover:underline"
            >
              Abrir
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
