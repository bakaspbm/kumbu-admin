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

  const pendingAgainst = asReported.filter((r) => r.status === "pending").length;
  const totalAgainst = asReported.length;
  const totalBy = asReporter.length;

  return (
    <section className="kumbu-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flag className="size-5 text-kumbu-red" />
          <div>
            <h2 className="text-lg font-bold">Denúncias e reclamações</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Denúncias contra este utilizador e denúncias que ele enviou.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pendingAgainst > 0 ? (
            <span className="kumbu-panel-warning rounded-full px-3 py-1 text-xs font-semibold">
              {pendingAgainst} pendente{pendingAgainst !== 1 ? "s" : ""}
            </span>
          ) : null}
          {totalAgainst > 0 ? (
            <Link
              href={`/reports?reported_user_id=${encodeURIComponent(userId)}&status=all`}
              className="text-sm font-semibold text-kumbu-red hover:underline"
            >
              Ver todas contra este utilizador
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Contra este utilizador ({totalAgainst})
        </p>
        {totalAgainst === 0 ? (
          <p className="mt-2 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            Nenhuma denúncia ou reclamação registada contra este utilizador.
          </p>
        ) : (
          <ReportList rows={asReported} />
        )}
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Enviadas por este utilizador ({totalBy})
        </p>
        {totalBy === 0 ? (
          <p className="mt-2 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            Este utilizador ainda não enviou denúncias.
          </p>
        ) : (
          <ReportList rows={asReporter} />
        )}
      </div>
    </section>
  );
}

function ReportList({ rows }: { rows: ContentReport[] }) {
  return (
    <ul className="mt-2 divide-y divide-slate-100 dark:divide-slate-700">
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
              <span className="ml-2 text-slate-600 dark:text-slate-300">
                {REPORT_REASON_LABELS[r.reason] ?? r.reason}
              </span>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
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
