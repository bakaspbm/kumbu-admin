import type { ContentReportStatus } from "@/lib/types";
import { REPORT_STATUS_LABELS } from "@/lib/compliance-labels";
import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";

const STATUS_NOTIFY: ContentReportStatus[] = ["resolved", "dismissed"];

function notificationCopy(status: ContentReportStatus, note?: string | null) {
  const label = REPORT_STATUS_LABELS[status] ?? status;
  if (status === "resolved") {
    return {
      title: "Denúncia analisada",
      body:
        note?.trim() ||
        `A sua denúncia foi tratada (${label}). Obrigado por ajudar a manter o Kumbú seguro.`,
    };
  }
  if (status === "dismissed") {
    return {
      title: "Denúncia arquivada",
      body:
        note?.trim() ||
        `Analisámos a sua denúncia (${label}). Se tiver novas informações, pode enviar outra denúncia.`,
    };
  }
  return {
    title: "Denúncia em análise",
    body: "A nossa equipa está a analisar o seu reporte.",
  };
}

/** Notifica o denunciante via backend Kumbu (app + email opcional). */
export async function notifyReportOutcome(
  reportId: string,
  status: ContentReportStatus,
  adminNote?: string | null,
): Promise<void> {
  if (!STATUS_NOTIFY.includes(status) && status !== "reviewing") return;

  const copy = notificationCopy(status, adminNote);
  try {
    await kumbuApiFetch<void>(
      `/admin/reports/${reportId}/notify-outcome`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          admin_note: adminNote ?? null,
          title: copy.title,
          body: copy.body,
        }),
      },
      { withAuth: true },
    );
  } catch {
    /* notificação não bloqueia resolução */
  }
}
