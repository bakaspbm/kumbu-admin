import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { env, hasServiceRole } from "@/lib/env";

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
          <p className="kumbu-label">Supabase</p>
          <h3 className="text-base font-semibold">Conexão</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="URL" value={env.supabaseUrl} mono />
            <Row label="Anon key" value={mask(env.supabaseAnonKey)} mono />
            <Row
              label="Service role"
              value={hasServiceRole() ? "configurada ✓" : "em falta ✗"}
            />
          </dl>
          {!hasServiceRole() && (
            <p className="mt-3 rounded-chip bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
              Sem SUPABASE_SERVICE_ROLE_KEY não é possível criar novos
              administradores nem eliminar utilizadores do Auth. Define-a em{" "}
              <code>.env.local</code> e reinicia a app.
            </p>
          )}
        </section>
        <section className="kumbu-card p-5 md:col-span-2">
          <p className="kumbu-label">Segurança</p>
          <h3 className="text-base font-semibold">Boas práticas</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-600">
            <li>
              Mantém a <code>SUPABASE_SERVICE_ROLE_KEY</code> apenas no servidor.
              Nunca a coloques em variáveis com prefixo <code>NEXT_PUBLIC_</code>.
            </li>
            <li>
              Activa <strong>Multi-factor Authentication</strong> nas contas de
              admin em Supabase → Authentication → MFA.
            </li>
            <li>
              Restringe o <em>Site URL</em> e <em>Redirect URLs</em> no Supabase
              à origem do dashboard em produção.
            </li>
            <li>
              Faz <em>rotation</em> periódico do <em>service role</em> em caso de
              suspeita de fuga.
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

function mask(value: string) {
  if (value.length < 12) return "•••";
  return `${value.slice(0, 6)}…${value.slice(-6)}`;
}
