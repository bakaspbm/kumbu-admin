import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { jobsApi } from "@/lib/kumbu-api/jobs";
import { PageHeader } from "@/components/ui/page-header";
import { JsonBlock } from "@/components/ui/json-block";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  accepted: "Aceite",
  rejected: "Rejeitada",
};

export default async function JobApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = await jobsApi.getApplication(id).catch(() => null);
  if (!app) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/jobs/applications"
        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-kumbu-red"
      >
        <ArrowLeft className="size-4" />
        Voltar às candidaturas
      </Link>
      <PageHeader
        title={app.job_title}
        subtitle={`${STATUS_LABEL[app.status] ?? app.status} · ${formatDateTime(app.created_at)}`}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="kumbu-card space-y-3 p-5 text-sm">
          <Row label="Vaga" value={app.job_title} />
          <Row label="CV" value={app.cv_title ?? "—"} />
          <Row
            label="Candidato"
            value={
              <Link href={`/users/${app.applicant_id}`} className="text-kumbu-red hover:underline">
                {app.applicant_name || app.applicant_email || app.applicant_id}
              </Link>
            }
          />
          <Row
            label="Empregador"
            value={
              <Link href={`/users/${app.employer_id}`} className="text-kumbu-red hover:underline">
                {app.employer_name || app.employer_email || app.employer_id}
              </Link>
            }
          />
          {app.cover_message && <Row label="Mensagem" value={app.cover_message} />}
          {app.conversation_id && (
            <Row
              label="Conversa"
              value={
                <Link href={`/conversations/${app.conversation_id}`} className="text-kumbu-red hover:underline">
                  Abrir chat
                </Link>
              }
            />
          )}
        </div>
        <JsonBlock label="Payload completo" data={app} />
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
