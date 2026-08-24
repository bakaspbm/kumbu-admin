"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { replyMailboxMessageAction } from "./actions";

export function MailboxReplyForm({
  uid,
  toHint,
  compact = false,
}: {
  uid: number;
  toHint: string;
  compact?: boolean;
}) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const text = body.trim();
    if (!text) {
      setError("Escreva a resposta.");
      return;
    }
    startTransition(async () => {
      const result = await replyMailboxMessageAction(uid, text);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setBody("");
      setSuccess(`Resposta enviada para ${result.to}.`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div>
        <label htmlFor={`mailbox-reply-${uid}`} className="text-sm font-medium text-slate-800">
          Responder
        </label>
        <p className="mt-0.5 text-xs text-slate-500">
          hello@kumbu-market.com
          {toHint ? ` → ${toHint}` : ""}.
        </p>
      </div>
      <textarea
        id={`mailbox-reply-${uid}`}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={compact ? 3 : 5}
        maxLength={20000}
        disabled={pending}
        placeholder="Escreva a sua resposta…"
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-kumbu-red/30 placeholder:text-slate-400 focus:ring-2 disabled:opacity-60"
      />
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
      <button
        type="submit"
        disabled={pending || !body.trim()}
        className="kumbu-btn inline-flex items-center gap-2 text-sm"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {pending ? "A enviar…" : "Enviar resposta"}
      </button>
    </form>
  );
}
