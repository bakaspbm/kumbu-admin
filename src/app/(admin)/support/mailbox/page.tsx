import Link from "next/link";
import { Mail } from "lucide-react";
import { supportMailboxApi } from "@/lib/kumbu-api/support-mailbox";
import { KumbuApiError } from "@/lib/kumbu-api/api-error";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SupportSubNav } from "../support-subnav";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SupportMailboxPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(0, Number(params.page ?? "0") || 0);

  let data: Awaited<ReturnType<typeof supportMailboxApi.list>> | null = null;
  let configError: string | null = null;
  let loadError: string | null = null;

  try {
    data = await supportMailboxApi.list({ page, size: 20 });
  } catch (error) {
    if (supportMailboxApi.isNotConfigured(error)) {
      configError =
        error instanceof KumbuApiError
          ? error.message
          : "Caixa de email não configurada no servidor.";
    } else {
      loadError =
        error instanceof KumbuApiError
          ? error.message
          : "Não foi possível carregar a caixa de email.";
    }
  }

  return (
    <div className="space-y-3">
      <PageHeader
        className="mb-0"
        title="Caixa de email"
        subtitle="Emails recebidos em hello@ / suporte@ (Hostinger). Diferente da fila de chat da app."
      />
      <SupportSubNav active="/support/mailbox" className="mb-0" />

      {configError ? (
        <div className="kumbu-card space-y-3 p-5">
          <p className="text-sm font-semibold text-amber-900">IMAP ainda não configurado</p>
          <p className="text-sm text-slate-600">{configError}</p>
          <p className="text-xs text-slate-500">
            No VPS, edita <code>/home/deploy/kumbu-mail-imap.env</code>: põe a password da
            caixa <code>hello@kumbu-market.com</code>, define{" "}
            <code>KUMBU_MAIL_IMAP_ENABLED=true</code>, depois{" "}
            <code>docker restart kumbu-api</code>.
          </p>
          <a
            href="https://webmail.hostinger.com"
            target="_blank"
            rel="noreferrer"
            className="kumbu-btn-secondary inline-flex text-sm"
          >
            Abrir Webmail Hostinger
          </a>
        </div>
      ) : null}

      {loadError ? (
        <div className="kumbu-card p-5 text-sm text-rose-700">{loadError}</div>
      ) : null}

      {data && data.items.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="Caixa vazia"
          description="Ainda não há mensagens na INBOX Hostinger."
        />
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <div className="kumbu-card overflow-hidden">
            <table className="kumbu-table">
              <thead>
                <tr>
                  <th>De</th>
                  <th>Assunto</th>
                  <th>Recebido</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.uid} className={item.seen ? "" : "bg-rose-50/40"}>
                    <td className="max-w-[14rem] truncate text-sm">
                      {!item.seen ? (
                        <span className="mr-1 inline-block h-2 w-2 rounded-full bg-kumbu-red" />
                      ) : null}
                      {item.from || "—"}
                    </td>
                    <td className="max-w-md truncate text-sm font-medium">
                      {item.subject || "(sem assunto)"}
                      {item.has_attachments ? (
                        <span className="ml-2 text-xs font-normal text-slate-400">anexo</span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap text-xs text-slate-500">
                      {item.received_at ? formatDateTime(item.received_at) : "—"}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/support/mailbox/${item.uid}`}
                        className="text-sm font-semibold text-kumbu-red hover:underline"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
            <span>
              Página {data.page + 1} de {Math.max(data.total_pages, 1)} · {data.total} mensagem(ns)
            </span>
            <div className="flex gap-2">
              {page > 0 ? (
                <Link
                  href={`/support/mailbox?page=${page - 1}`}
                  className="kumbu-btn-secondary text-sm"
                >
                  Anterior
                </Link>
              ) : null}
              {page + 1 < data.total_pages ? (
                <Link
                  href={`/support/mailbox?page=${page + 1}`}
                  className="kumbu-btn-secondary text-sm"
                >
                  Seguinte
                </Link>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
