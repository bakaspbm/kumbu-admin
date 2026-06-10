"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { SupportConversationDetail } from "@/lib/kumbu-api/support-inbox";
import { formatDateTime } from "@/lib/utils";
import {
  closeSupportConversationAction,
  replySupportConversationAction,
} from "../actions";

export function SupportInboxDetailClient({
  conversation,
}: {
  conversation: SupportConversationDetail;
}) {
  const [messages, setMessages] = useState(conversation.messages);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          sender_id: "support",
          body: text,
          message_kind: "support",
          created_at: new Date().toISOString(),
          from_support: true,
        },
      ]);
      setBody("");
    });
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
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-kumbu-red"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar à fila
      </Link>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="kumbu-card space-y-3 p-5 lg:col-span-1">
          <p className="kumbu-label">Utilizador</p>
          <p className="font-semibold">{conversation.user_name ?? "—"}</p>
          <p className="text-sm text-slate-500">{conversation.user_email}</p>
          <p className="text-xs text-slate-400">
            Estado: <span className="font-semibold">{conversation.support_status}</span>
          </p>
          <Link href={`/users/${conversation.user_id}`} className="text-sm font-semibold text-kumbu-red">
            Ver perfil →
          </Link>
          <button
            type="button"
            disabled={pending}
            onClick={handleClose}
            className="kumbu-btn-secondary mt-4 w-full text-sm"
          >
            Encerrar conversa
          </button>
        </div>

        <div className="kumbu-card flex flex-col p-5 lg:col-span-2">
          <p className="kumbu-label mb-4">Mensagens ({messages.length})</p>
          <ul className="mb-4 max-h-[420px] flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.from_support
                    ? "ml-auto bg-kumbu-red-soft text-kumbu-ink"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.body}</p>
                <p className="mt-1 text-[10px] opacity-60">{formatDateTime(msg.created_at)}</p>
              </li>
            ))}
          </ul>
          {error ? <p className="mb-2 text-sm text-rose-600">{error}</p> : null}
          <form onSubmit={handleReply} className="flex gap-2">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Responder como Kumbú Suporte…"
              className="kumbu-input flex-1"
              disabled={pending}
            />
            <button type="submit" disabled={pending || !body.trim()} className="kumbu-btn-primary shrink-0">
              {pending ? "…" : "Enviar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
