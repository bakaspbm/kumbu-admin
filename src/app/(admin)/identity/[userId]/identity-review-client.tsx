"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Maximize2, X } from "lucide-react";
import type {
  IdentityDocumentReview,
  IdentityVerificationDetail,
} from "@/lib/kumbu-api/identity";
import { formatDateTime } from "@/lib/utils";
import {
  approveIdentityAction,
  approveIdentityDocumentAction,
  rejectIdentityAction,
  rejectIdentityDocumentAction,
} from "../actions";

const SIDES = ["front", "back", "selfie"] as const;

const SIDE_LABEL: Record<string, string> = {
  front: "Frente",
  back: "Verso",
  selfie: "Selfie",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
};

function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        aria-label="Fechar"
      >
        <X className="h-5 w-5" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="max-h-[92vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function DocumentCard({
  userId,
  side,
  doc,
  globalNote,
  locked,
  onDone,
}: {
  userId: string;
  side: string;
  doc: IdentityDocumentReview | undefined;
  globalNote: string;
  locked: boolean;
  onDone: () => void;
}) {
  const [localNote, setLocalNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const [pending, startTransition] = useTransition();

  const uploaded = Boolean(doc);
  const status = doc?.review_status ?? "PENDING";
  const imageSrc = `/identity/${userId}/document/${side}`;

  function rejectNote() {
    return (localNote.trim() || globalNote.trim()).trim();
  }

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveIdentityDocumentAction(userId, side);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onDone();
    });
  }

  function handleReject() {
    const note = rejectNote();
    if (!note) {
      setError("Indique o motivo da rejeição desta foto.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rejectIdentityDocumentAction(userId, side, note);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setLocalNote("");
      onDone();
    });
  }

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{SIDE_LABEL[side]}</p>
        {uploaded ? (
          <span className={`kumbu-badge text-[10px] ${STATUS_CLASS[status] ?? STATUS_CLASS.PENDING}`}>
            {STATUS_LABEL[status] ?? status}
          </span>
        ) : null}
      </div>

      {uploaded ? (
        <button
          type="button"
          className="group relative block w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
          onClick={() => setLightbox(true)}
          title="Ampliar imagem"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={SIDE_LABEL[side]}
            className="aspect-[3/4] w-full object-cover transition group-hover:scale-[1.02]"
          />
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white">
            <Maximize2 className="h-3 w-3" />
            Ampliar
          </span>
        </button>
      ) : (
        <div className="flex aspect-[3/4] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
          Não enviado
        </div>
      )}

      {doc?.rejection_reason ? (
        <p className="rounded-lg bg-rose-50 px-2 py-1.5 text-xs text-rose-700">
          {doc.rejection_reason}
        </p>
      ) : null}

      {uploaded && !locked && status !== "APPROVED" ? (
        <div className="space-y-2">
          <input
            value={localNote}
            onChange={(e) => setLocalNote(e.target.value)}
            placeholder="Motivo da rejeição desta foto (opcional se usar o campo geral)"
            className="kumbu-input text-xs"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={handleApprove}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" />
              Aprovar
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleReject}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
            >
              <X className="h-3.5 w-3.5" />
              Rejeitar
            </button>
          </div>
        </div>
      ) : null}

      {uploaded && !locked && status === "APPROVED" ? (
        <p className="text-xs font-medium text-emerald-700">Documento aprovado.</p>
      ) : null}

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      {lightbox ? (
        <ImageLightbox src={imageSrc} alt={SIDE_LABEL[side]} onClose={() => setLightbox(false)} />
      ) : null}
    </div>
  );
}

export function IdentityReviewClient({ detail }: { detail: IdentityVerificationDetail }) {
  const router = useRouter();
  const [note, setNote] = useState(detail.admin_note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const locked = detail.status === "APPROVED";

  const docsBySide = useMemo(() => {
    const map = new Map<string, IdentityDocumentReview>();
    for (const doc of detail.documents) {
      map.set(doc.side, doc);
    }
    return map;
  }, [detail.documents]);

  function refresh() {
    router.refresh();
  }

  function handleApproveAll() {
    setError(null);
    startTransition(async () => {
      const result = await approveIdentityAction(detail.user_id, note);
      if (!result.ok) setError(result.error);
      else refresh();
    });
  }

  function handleRejectAll() {
    if (!note.trim()) {
      setError("Indique o motivo da rejeição.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rejectIdentityAction(detail.user_id, note.trim());
      if (!result.ok) setError(result.error);
      else refresh();
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

          <div className="mt-4 space-y-2">
            <p className="kumbu-label">Nota geral</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Motivo comum para rejeitar tudo ou nota interna"
              className="kumbu-input min-h-[88px] w-full resize-y"
              disabled={locked}
            />
            <p className="text-xs text-slate-500">
              Pode aprovar ou rejeitar cada foto individualmente. Use estes botões para
              decidir sobre todos os documentos de uma vez.
            </p>
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          {!locked ? (
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                disabled={pending}
                onClick={handleApproveAll}
                className="kumbu-btn-primary w-full"
              >
                Aprovar todos
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={handleRejectAll}
                className="kumbu-btn-secondary w-full text-rose-700"
              >
                Rejeitar todos
              </button>
            </div>
          ) : (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Identidade aprovada — revisão concluída.
            </p>
          )}
        </div>

        <div className="kumbu-card p-5 lg:col-span-2">
          <p className="kumbu-label mb-1">Documentos</p>
          <p className="mb-4 text-xs text-slate-500">
            Clique numa imagem para ampliar. Aprove ou rejeite foto a foto; o utilizador
            recebe notificação com o motivo quando um documento é rejeitado.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {SIDES.map((side) => (
              <DocumentCard
                key={side}
                userId={detail.user_id}
                side={side}
                doc={docsBySide.get(side)}
                globalNote={note}
                locked={locked}
                onDone={refresh}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
