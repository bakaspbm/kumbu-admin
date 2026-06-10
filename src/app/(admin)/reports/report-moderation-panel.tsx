"use client";

import { useActionState } from "react";
import { useRouterRefreshOnActions } from "@/hooks/use-router-refresh-on-actions";
import type { ContentReport } from "@/lib/types";
import { FeedbackBanner } from "@/components/ui/toast";
import {
  dismissReportAction,
  markReportReviewingAction,
  removeListingFromReportAction,
  resolveReportAction,
  suspendUserFromReportAction,
  type ActionState,
} from "./actions";

export function ReportModerationPanel({
  report,
  messageConversationId,
}: {
  report: ContentReport;
  messageConversationId?: string | null;
}) {
  const [reviewState, reviewAction] = useActionState<ActionState, FormData>(
    markReportReviewingAction,
    null,
  );
  const [resolveState, resolveAction] = useActionState<ActionState, FormData>(
    resolveReportAction,
    null,
  );
  const [dismissState, dismissAction] = useActionState<ActionState, FormData>(
    dismissReportAction,
    null,
  );
  const [removeState, removeAction] = useActionState<ActionState, FormData>(
    removeListingFromReportAction,
    null,
  );
  const [suspendState, suspendAction] = useActionState<ActionState, FormData>(
    suspendUserFromReportAction,
    null,
  );

  const states = [reviewState, resolveState, dismissState, removeState, suspendState];
  useRouterRefreshOnActions(...states);
  const feedback = states.find((s) => s?.message);
  const closed = report.status === "resolved" || report.status === "dismissed";

  return (
    <div className="kumbu-card space-y-4 p-5">
      <h3 className="font-bold text-kumbu-ink">Acções de moderação</h3>
      <FeedbackBanner feedback={feedback ?? null} />

      {closed ? (
        <p className="text-sm text-slate-600">
          Esta denúncia está fechada ({report.status}). Pode reabrir alterando o estado
          manualmente na base de dados se necessário.
        </p>
      ) : (
        <>
          {report.status === "pending" && (
            <form action={reviewAction}>
              <input type="hidden" name="id" value={report.id} />
              <button type="submit" className="kumbu-btn-secondary w-full">
                Marcar como em análise
              </button>
            </form>
          )}

          <form action={resolveAction} className="space-y-2">
            <input type="hidden" name="id" value={report.id} />
            <label className="block">
              <span className="kumbu-label">Notas internas (opcional)</span>
              <textarea
                name="admin_notes"
                className="kumbu-input mt-1 w-full min-h-[72px]"
                placeholder="O que foi feito…"
                defaultValue={report.admin_notes ?? ""}
              />
            </label>
            <button type="submit" className="kumbu-btn-primary w-full">
              Resolver sem remoção
            </button>
          </form>

          <form action={dismissAction} className="space-y-2">
            <input type="hidden" name="id" value={report.id} />
            <textarea
              name="admin_notes"
              className="kumbu-input w-full min-h-[56px]"
              placeholder="Motivo do arquivamento…"
            />
            <button type="submit" className="kumbu-btn-secondary w-full">
              Arquivar (sem acção)
            </button>
          </form>

          {report.target_type === "listing" && (
            <form action={removeAction} className="space-y-2 border-t border-slate-100 pt-4">
              <input type="hidden" name="report_id" value={report.id} />
              <input type="hidden" name="product_id" value={report.target_id} />
              <p className="text-sm text-slate-600">
                Remove o anúncio (soft delete) e marca a denúncia como resolvida.
              </p>
              <button
                type="submit"
                className="kumbu-btn-primary w-full bg-rose-600 hover:bg-rose-700"
              >
                Remover anúncio
              </button>
            </form>
          )}

          {report.reported_user_id && (
            <form action={suspendAction} className="space-y-2 border-t border-slate-100 pt-4">
              <input type="hidden" name="report_id" value={report.id} />
              <input type="hidden" name="user_id" value={report.reported_user_id} />
              <p className="text-sm text-slate-600">
                Suspende a conta (soft delete). Opcionalmente remove também a
                credencial de autenticação (irreversível).
              </p>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input type="checkbox" name="delete_auth" className="rounded accent-rose-600" />
                Eliminar também do Auth (irreversível)
              </label>
              <button
                type="submit"
                className="kumbu-btn-primary w-full bg-rose-600 hover:bg-rose-700"
              >
                Suspender utilizador reportado
              </button>
            </form>
          )}
        </>
      )}

      {messageConversationId && report.target_type === "message" && (
        <p className="text-xs text-slate-500">
          Mensagem na conversa{" "}
          <span className="font-mono">{messageConversationId.slice(0, 8)}…</span>
        </p>
      )}
    </div>
  );
}
