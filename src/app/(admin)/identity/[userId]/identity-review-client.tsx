"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { IdentityVerificationDetail } from "@/lib/kumbu-api/identity";
import { formatDateTime } from "@/lib/utils";
import { approveIdentityAction, rejectIdentityAction } from "../actions";

const SIDE_LABEL: Record<string, string> = {
  front: "Frente",
  back: "Verso",
  selfie: "Selfie",
};

export function IdentityReviewClient({ detail }: { detail: IdentityVerificationDetail }) {
  const [note, setNote] = useState(detail.admin_note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveIdentityAction(detail.user_id, note);
      if (!result.ok) setError(result.error);
    });
  }

  function handleReject() {
    if (!note.trim()) {
      setError("Indique o motivo da rejeição.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rejectIdentityAction(detail.user_id, note.trim());
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="space-y-6">
      <Link
        href="/identity"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-kumbu-red"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar à fila
      </Link>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="kumbu-card space-y-3 p-5 lg:col-span-1">
          <p className="kumbu-label">Candidato</p>
          <p className="font-semibold">{detail.user_name ?? "—"}</p>
          <p className="text-sm text-slate-500">{detail.user_email}</p>
          <p className="text-sm">
            Estado: <span className="font-bold">{detail.status}</span>
          </p>
          {detail.reviewed_at ? (
            <p className="text-xs text-slate-500">Revisto: {formatDateTime(detail.reviewed_at)}</p>
          ) : null}
          <Link href={`/users/${detail.user_id}`} className="text-sm font-semibold text-kumbu-red">
            Ver utilizador →
          </Link>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nota interna ou motivo (obrigatório na rejeição)"
            className="kumbu-input mt-4 min-h-[88px] w-full resize-y"
          />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              disabled={pending || detail.status === "APPROVED"}
              onClick={handleApprove}
              className="kumbu-btn-primary w-full"
            >
              Aprovar identidade
            </button>
            <button
              type="button"
              disabled={pending || detail.status === "REJECTED"}
              onClick={handleReject}
              className="kumbu-btn-secondary w-full text-rose-700"
            >
              Rejeitar
            </button>
          </div>
        </div>

        <div className="kumbu-card p-5 lg:col-span-2">
          <p className="kumbu-label mb-4">Documentos</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {(["front", "back", "selfie"] as const).map((side) => {
              const uploaded = detail.documents.some((d) => d.side === side);
              return (
                <div key={side} className="space-y-2">
                  <p className="text-sm font-semibold">{SIDE_LABEL[side]}</p>
                  {uploaded ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/identity/${detail.user_id}/document/${side}`}
                      alt={SIDE_LABEL[side]}
                      className="aspect-[3/4] w-full rounded-xl border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[3/4] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
                      Não enviado
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
