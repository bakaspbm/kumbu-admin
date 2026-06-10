import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminGet, adminList } from "@/lib/admin-data";
import { PageHeader } from "@/components/ui/page-header";
import { formatDateTime } from "@/lib/utils";
import {
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_TARGET_LABELS,
  reportStatusClass,
} from "@/lib/compliance-labels";
import { reportTargetHref } from "@/lib/report-target-link";
import type { ContentReport } from "@/lib/types";
import { ReportModerationPanel } from "../report-moderation-panel";

export const dynamic = "force-dynamic";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await adminGet<ContentReport>("reports", id);
    if (!report) notFound();
    const messageConversationId =
      report.target_type === "message"
        ? ((await adminGet<{ conversation_id: string }>("conversations/messages", report.target_id))?.conversation_id ?? null)
        : null;
    const users = await adminList<{ id: string; display_name: string | null; email: string | null }>("users");
    const userMap = new Map<string, { name: string; email: string | null }>();
    for (const u of users) {
      userMap.set(u.id, {
        name: u.display_name ?? u.email ?? u.id.slice(0, 8),
        email: u.email,
      });
    }
    const targetProduct =
      report.target_type === "listing"
        ? await adminGet<{ title: string; deleted_at?: string | null }>("products", report.target_id)
        : null;
    const targetTitle = targetProduct
      ? `${targetProduct.title}${targetProduct.deleted_at ? " (removido)" : ""}`
      : null;
    const targetHref = reportTargetHref(report.target_type, report.target_id, messageConversationId);
    const reporter = userMap.get(report.reporter_id);
    const reported = report.reported_user_id ? userMap.get(report.reported_user_id) : null;
    return (
      <div className="space-y-6">
        <Link href="/reports" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-kumbu-red">
          <ArrowLeft className="size-4" />
          Voltar à fila
        </Link>
        <PageHeader title="Detalhe da denúncia" subtitle={formatDateTime(report.created_at)} />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="kumbu-card space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${reportStatusClass(report.status)}`}>{REPORT_STATUS_LABELS[report.status] ?? report.status}</span><span className="text-sm text-slate-500">{REPORT_TARGET_LABELS[report.target_type]} · {REPORT_REASON_LABELS[report.reason] ?? report.reason}</span></div>
            <dl className="grid gap-3 text-sm">
              <div><dt className="kumbu-label">Alvo</dt><dd className="mt-0.5 font-medium">{targetHref ? <Link href={targetHref} className="text-kumbu-red hover:underline">{targetTitle ?? report.target_id}</Link> : <span className="font-mono text-xs">{report.target_id}</span>}</dd></div>
              <div><dt className="kumbu-label">Denunciante</dt><dd className="mt-0.5"><Link href={`/users/${report.reporter_id}`} className="font-medium text-kumbu-red hover:underline">{reporter?.name}</Link>{reporter?.email && <span className="block text-slate-500">{reporter.email}</span>}</dd></div>
              {report.reported_user_id && (<div><dt className="kumbu-label">Utilizador reportado</dt><dd className="mt-0.5"><Link href={`/users/${report.reported_user_id}`} className="font-medium text-kumbu-red hover:underline">{reported?.name}</Link></dd></div>)}
              {report.details && (<div><dt className="kumbu-label">Descrição do denunciante</dt><dd className="mt-0.5 whitespace-pre-wrap text-slate-700">{report.details}</dd></div>)}
              {report.admin_notes && (<div><dt className="kumbu-label">Notas internas</dt><dd className="mt-0.5 whitespace-pre-wrap text-slate-700">{report.admin_notes}</dd></div>)}
              {report.reviewed_at && (<div><dt className="kumbu-label">Revisto em</dt><dd className="mt-0.5">{formatDateTime(report.reviewed_at)}</dd></div>)}
            </dl>
          </div>
          <ReportModerationPanel report={report} messageConversationId={messageConversationId} />
        </div>
      </div>
    );
}