"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useFormStatus } from "react-dom";
import { Loader2, AlertTriangle } from "lucide-react";

export type ConfirmTone = "danger" | "warning" | "default";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  /** Se definido, o utilizador tem de escrever exactamente este texto para confirmar. */
  requireText?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const TONE_BTN: Record<ConfirmTone, string> = {
  danger: "kumbu-btn-danger",
  warning:
    "inline-flex items-center justify-center gap-2 rounded-chip px-4 py-2.5 text-sm font-semibold bg-amber-100 text-amber-900 hover:bg-amber-200",
  default: "kumbu-btn-primary",
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "danger",
  requireText,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState("");
  const titleId = useId();
  const confirmReady = !requireText || typed.trim() === requireText;

  useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, busy, onCancel]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        disabled={busy}
        onClick={() => {
          if (!busy) onCancel();
        }}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--kumbu-border)] bg-[var(--kumbu-surface)] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-3">
          <div
            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              tone === "danger"
                ? "bg-rose-100 text-rose-700"
                : tone === "warning"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-700"
            }`}
          >
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <h2 id={titleId} className="text-base font-semibold text-[var(--kumbu-ink)]">
              {title}
            </h2>
            {description ? (
              <div className="text-sm leading-relaxed text-slate-600">{description}</div>
            ) : null}
            {requireText ? (
              <label className="block space-y-1.5 pt-1">
                <span className="text-xs font-medium text-slate-600">
                  Escreva <span className="font-mono font-semibold">{requireText}</span>{" "}
                  para confirmar
                </span>
                <input
                  autoFocus
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  className="kumbu-input"
                  placeholder={requireText}
                  autoComplete="off"
                  disabled={busy}
                />
              </label>
            ) : null}
          </div>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="kumbu-btn-ghost"
            disabled={busy}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={TONE_BTN[tone]}
            disabled={busy || !confirmReady}
            onClick={onConfirm}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

type ConfirmSubmitProps = {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  requireText?: string;
  className?: string;
  children: ReactNode;
  pendingLabel?: string;
  /** Se true, o botão de abrir usa type=submit visual via FormStatus. */
  iconOnly?: boolean;
};

/**
 * Botão dentro de um `<form>`: abre modal em vez de `window.confirm`.
 * Ao confirmar, faz `requestSubmit()` no formulário pai.
 */
export function ConfirmSubmit({
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "danger",
  requireText,
  className,
  children,
  pendingLabel,
}: ConfirmSubmitProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { pending } = useFormStatus();

  const onCancel = useCallback(() => {
    if (!pending) setOpen(false);
  }, [pending]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={className}
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {pendingLabel ?? "A processar..."}
          </>
        ) : (
          children
        )}
      </button>
      <ConfirmDialog
        open={open}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        tone={tone}
        requireText={requireText}
        busy={pending}
        onCancel={onCancel}
        onConfirm={() => {
          const form = buttonRef.current?.closest("form");
          if (!form) {
            setOpen(false);
            return;
          }
          if (requireText) {
            let input = form.querySelector<HTMLInputElement>(
              'input[name="confirm"]',
            );
            if (!input) {
              input = document.createElement("input");
              input.type = "hidden";
              input.name = "confirm";
              form.appendChild(input);
            }
            input.value = requireText;
          }
          setOpen(false);
          form.requestSubmit();
        }}
      />
    </>
  );
}

type ConfirmActionButtonProps = {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  requireText?: string;
  className?: string;
  disabled?: boolean;
  children: ReactNode;
  onConfirm: () => void | Promise<void>;
};

/** Botão standalone (sem form) com confirmação em modal. */
export function ConfirmActionButton({
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "danger",
  requireText,
  className,
  disabled,
  children,
  onConfirm,
}: ConfirmActionButtonProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        disabled={disabled || busy}
        onClick={() => setOpen(true)}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
      </button>
      <ConfirmDialog
        open={open}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        tone={tone}
        requireText={requireText}
        busy={busy}
        onCancel={() => {
          if (!busy) setOpen(false);
        }}
        onConfirm={() => {
          void (async () => {
            setBusy(true);
            try {
              await onConfirm();
              setOpen(false);
            } finally {
              setBusy(false);
            }
          })();
        }}
      />
    </>
  );
}
