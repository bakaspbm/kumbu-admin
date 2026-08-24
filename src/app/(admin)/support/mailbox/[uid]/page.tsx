import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Paperclip } from "lucide-react";
import { supportMailboxApi } from "@/lib/kumbu-api/support-mailbox";
import { KumbuApiError } from "@/lib/kumbu-api/api-error";
import { SupportSubNav } from "../../support-subnav";
import { formatDateTime } from "@/lib/utils";
import { formatMailboxBodyText } from "@/lib/mailbox-body";
import { MailboxReplyForm } from "../mailbox-reply-form";

export const dynamic = "force-dynamic";

export default async function SupportMailboxMessagePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid: uidRaw } = await params;
  const uid = Number(uidRaw);
  if (!Number.isFinite(uid) || uid <= 0) notFound();

  let message: Awaited<ReturnType<typeof supportMailboxApi.get>> | null = null;
  let errorMessage: string | null = null;

  try {
    message = await supportMailboxApi.get(uid);
  } catch (error) {
    if (error instanceof KumbuApiError && error.status === 404) notFound();
    errorMessage =
      error instanceof KumbuApiError
        ? error.message
        : "Não foi possível abrir esta mensagem.";
  }

  const bodyText = formatMailboxBodyText(message?.body_text);
  const subject = message?.subject?.trim() || "Mensagem";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/support/mailbox"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-kumbu-red"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à caixa
        </Link>
        <a
          href="https://webmail.hostinger.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-kumbu-red"
        >
          Webmail
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <SupportSubNav active="/support/mailbox" className="mb-0" />

      {errorMessage ? (
        <div className="kumbu-card p-3 text-sm text-rose-700">{errorMessage}</div>
      ) : null}

      {message ? (
        <article className="kumbu-card overflow-hidden">
          <header className="space-y-2 border-b border-slate-100 px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold leading-snug text-kumbu-ink">{subject}</h1>
              {message.received_at ? (
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatDateTime(message.received_at)}
                </p>
              ) : null}
            </div>
            <dl className="grid gap-x-3 gap-y-1 text-xs sm:grid-cols-[4.5rem_1fr]">
              <dt className="text-slate-500">De</dt>
              <dd className="truncate font-medium text-slate-800">{message.from || "—"}</dd>
              <dt className="text-slate-500">Para</dt>
              <dd className="truncate text-slate-700">{message.to || "—"}</dd>
              {message.has_attachments ? (
                <>
                  <dt className="text-slate-500">Anexos</dt>
                  <dd className="inline-flex items-center gap-1 text-amber-800">
                    <Paperclip className="h-3.5 w-3.5" />
                    Abrir no Webmail para descarregar
                  </dd>
                </>
              ) : null}
            </dl>
          </header>

          <div className="max-h-[min(28rem,55vh)] overflow-y-auto px-4 py-3">
            {bodyText ? (
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-slate-800">
                {bodyText}
              </pre>
            ) : (
              <p className="text-sm text-slate-500">(sem conteúdo de texto legível)</p>
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-3">
            <MailboxReplyForm uid={message.uid} toHint={message.from} compact />
          </div>
        </article>
      ) : null}
    </div>
  );
}
