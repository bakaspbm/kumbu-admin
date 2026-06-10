import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Definições"
        subtitle="Estado do ambiente, chaves e informação de configuração."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <section className="kumbu-card p-5">
          <p className="kumbu-label">Sessão</p>
          <h3 className="text-base font-semibold">A tua conta</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="E-mail" value={session.email} />
            <Row label="Função" value={session.role} />
            <Row label="UID" value={session.userId} mono />
          </dl>
        </section>
        <section className="kumbu-card p-5">
          <p className="kumbu-label">Backend Kumbu</p>
          <h3 className="text-base font-semibold">Conexão API</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="API URL" value={env.kumbuApiUrl} mono />
            <Row label="Super admin" value={env.superAdminEmail} />
          </dl>
        </section>
        <section className="kumbu-card p-5">
          <p className="kumbu-label">Denúncias</p>
          <h3 className="text-base font-semibold">Notificar denunciante</h3>
          <p className="mt-2 text-sm text-slate-600">
            Ao resolver ou arquivar uma denúncia, o utilizador recebe sempre uma notificação
            na app. Com <code>RESEND_API_KEY</code> e <code>REPORT_NOTIFY_FROM</code> no{" "}
            <code>.env.local</code> também recebe email.
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <Row
              label="Resend"
              value={process.env.RESEND_API_KEY?.trim() ? "configurado ✓" : "não configurado"}
            />
            <Row
              label="Remetente"
              value={process.env.REPORT_NOTIFY_FROM?.trim() || "—"}
            />
          </dl>
        </section>
        <section className="kumbu-card p-5 md:col-span-2">
          <p className="kumbu-label">Segurança</p>
          <h3 className="text-base font-semibold">Boas práticas</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-600">
            <li>
              Mantém as credenciais do backend apenas no servidor (sem prefixo{" "}
              <code>NEXT_PUBLIC_</code>).
            </li>
            <li>
              Activa autenticação multifactor nas contas de admin em produção.
            </li>
            <li>
              Restringe origens e URLs de redirect do painel em produção.
            </li>
            <li>
              Faz <em>rotation</em> periódico de tokens em caso de suspeita de fuga.
            </li>
            <li>
              Consulta a <a href="/audit" className="text-kumbu-red font-semibold underline">Auditoria</a> regularmente.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-1.5 last:border-0">
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className={mono ? "font-mono text-xs break-all text-right" : "text-right"}>
        {value}
      </dd>
    </div>
  );
}
