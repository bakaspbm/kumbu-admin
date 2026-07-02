"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Headset, Loader2, Paperclip, UserRound } from "lucide-react";
import type { SupportMessageItem } from "@/lib/kumbu-api/support-inbox";
import type { SupportConversationDetail } from "@/lib/kumbu-api/support-inbox";
import { formatDateTime } from "@/lib/utils";
import {
  closeSupportConversationAction,
  replySupportConversationAction,
} from "../actions";
import { uploadSupportAttachmentAction } from "../upload-attachment-action";
import { ChatAttachment } from "@/components/chat/chat-attachment";

function messageSenderLabel(
  msg: SupportMessageItem,
  userName: string | null | undefined,
): string {
  if (msg.from_support) return "Kumbú Suporte";
  if (msg.message_kind === "bot") return "Bot Kumbú";
  return userName?.trim() || "Utilizador";
}

function MessageBubble({
  msg,
  userName,
}: {
  msg: SupportMessageItem;
  userName: string | null | undefined;
}) {
  const isSupport = msg.from_support;
  const isBot = !isSupport && msg.message_kind === "bot";
  const label = messageSenderLabel(msg, userName);
  const hasBody = Boolean(msg.body?.trim() && msg.body !== "📎 Ficheiro partilhado");

  const bubbleClass = isSupport
    ? "kumbu-chat-bubble-support"
    : isBot
      ? "kumbu-chat-bubble-bot"
      : "kumbu-chat-bubble-user";

  const Icon = isSupport ? Headset : isBot ? Bot : UserRound;

  return (
    <li className={`flex ${isSupport ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[min(88%,32rem)] flex-col gap-1.5 ${isSupport ? "items-end" : "items-start"}`}
      >
        <div
          className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${
            isSupport ? "text-kumbu-red" : "text-[var(--kumbu-ink-subtle)]"
          }`}
        >
          <Icon className="size-3.5 shrink-0" aria-hidden />
          <span>{label}</span>
          <span className="font-normal normal-case tracking-normal text-[var(--kumbu-ink-subtle)]">
            · {formatDateTime(msg.created_at)}
          </span>
        </div>

        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${bubbleClass}`}>
          {msg.attachment_url ? <ChatAttachment url={msg.attachment_url} /> : null}

          {hasBody ? (
            <p className="whitespace-pre-wrap break-words">{msg.body}</p>
          ) : msg.attachment_url ? null : (
            <p className="italic text-[var(--kumbu-ink-subtle)]">Mensagem sem texto</p>
          )}
        </div>
      </div>
    </li>
  );
}

export function SupportInboxDetailClient({
  conversation,
}: {
  conversation: SupportConversationDetail;
}) {
  const [messages, setMessages] = useState(conversation.messages);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attachBusy, setAttachBusy] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  function pushLocalReply(text: string, attachmentUrl?: string | null) {
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        sender_id: "support",
        body: text || "📎 Ficheiro partilhado",
        message_kind: attachmentUrl ? "attachment" : "support",
        attachment_url: attachmentUrl ?? null,
        created_at: new Date().toISOString(),
        from_support: true,
      },
    ]);
  }

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setError(null);
    startTransition(async () => {
      const result = await replySupportConversationAction(conversation.id, text);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      pushLocalReply(text);
      setBody("");
    });
  }

  async function handleAttach(file: File) {
    if (pending || attachBusy) return;
    setAttachBusy(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const upload = await uploadSupportAttachmentAction(formData);
      if (!upload.ok) {
        setError(upload.error);
        return;
      }
      const result = await replySupportConversationAction(conversation.id, "", upload.url);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      pushLocalReply("", upload.url);
    } finally {
      setAttachBusy(false);
    }
  }

  function handleClose() {
    if (!window.confirm("Encerrar esta conversa de suporte?")) return;
    startTransition(async () => {
      const result = await closeSupportConversationAction(conversation.id);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="space-y-6">
      <Link
        href="/support/inbox"
        className="inline-flex items-center gap-1 text-sm font-medium text-[var(--kumbu-ink-muted)] hover:text-kumbu-red"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar à fila
      </Link>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="kumbu-card space-y-3 p-5 lg:col-span-1">
          <p className="kumbu-label">Utilizador</p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{conversation.user_name ?? "—"}</p>
            {conversation.guest ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                Visitante
              </span>
            ) : null}
          </div>
          <p className="text-sm text-[var(--kumbu-ink-muted)]">{conversation.user_email}</p>
          <p className="text-xs text-[var(--kumbu-ink-subtle)]">
            Estado:{" "}
            <span className="font-semibold capitalize text-[var(--kumbu-ink)]">
              {conversation.support_status.replace(/_/g, " ")}
            </span>
          </p>
          {!conversation.guest && conversation.user_id ? (
            <Link
              href={`/users/${conversation.user_id}`}
              className="inline-flex text-sm font-semibold text-kumbu-red hover:underline"
            >
              Ver perfil →
            </Link>
          ) : null}
          <button
            type="button"
            disabled={pending}
            onClick={handleClose}
            className="kumbu-btn-secondary mt-4 w-full text-sm"
          >
            Encerrar conversa
          </button>
        </div>

        <div className="kumbu-card flex min-h-[520px] flex-col p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="kumbu-label">Mensagens ({messages.length})</p>
            {(pending || attachBusy) && (
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--kumbu-ink-subtle)]">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                A enviar…
              </span>
            )}
          </div>

          <ul
            ref={listRef}
            className="mb-4 min-h-[280px] flex-1 space-y-4 overflow-y-auto rounded-xl border border-[var(--kumbu-border)] bg-[var(--kumbu-surface-muted)] p-4"
          >
            {messages.length === 0 ? (
              <li className="flex h-full min-h-[240px] flex-col items-center justify-center gap-2 text-center">
                <Headset className="size-8 text-[var(--kumbu-ink-subtle)]" aria-hidden />
                <p className="text-sm font-medium text-[var(--kumbu-ink-muted)]">
                  Ainda não há mensagens nesta conversa
                </p>
                <p className="max-w-xs text-xs text-[var(--kumbu-ink-subtle)]">
                  Quando o utilizador escrever ou o bot responder, as mensagens aparecem aqui.
                </p>
              </li>
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} userName={conversation.user_name} />
              ))
            )}
          </ul>

          {error ? (
            <p className="kumbu-alert kumbu-alert-error mb-3" role="alert">
              {error}
            </p>
          ) : null}

          <form onSubmit={handleReply} className="flex gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleAttach(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={pending || attachBusy}
              onClick={() => fileRef.current?.click()}
              className="kumbu-btn-ghost shrink-0 px-3"
              aria-label="Anexar ficheiro"
            >
              <Paperclip className={`h-4 w-4 ${attachBusy ? "animate-pulse" : ""}`} />
            </button>
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Responder como Kumbú Suporte…"
              className="kumbu-input flex-1"
              disabled={pending || attachBusy}
            />
            <button
              type="submit"
              disabled={pending || attachBusy || !body.trim()}
              className="kumbu-btn-primary shrink-0 min-w-[5.5rem]"
            >
              {pending || attachBusy ? (
                <Loader2 className="mx-auto size-4 animate-spin" aria-hidden />
              ) : (
                "Enviar"
              )}
            </button>
          </form>
          <p className="mt-2 text-[10px] text-[var(--kumbu-ink-subtle)]">
            Imagens ou PDF até 10 MB · o utilizador vê o anexo no chat de suporte
          </p>
        </div>
      </div>
    </div>
  );
}
