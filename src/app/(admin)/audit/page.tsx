import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface AuditRow {
  id: number;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; action?: string }>;
}) {
  const params = await searchParams;
  const q = (params?.q ?? "").trim();
  const action = (params?.action ?? "").trim();

  const supabase = await createSupabaseServerClient();
  let req = supabase
    .from("admin_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (action) req = req.eq("action", action);
  if (q)
    req = req.or(
      `actor_email.ilike.%${q}%,entity.ilike.%${q}%,entity_id.ilike.%${q}%`
    );

  const { data } = await req;
  const rows = (data ?? []) as AuditRow[];

  return (
    <div>
      <PageHeader
        title="Auditoria"
        subtitle="Histórico recente de acções de administradores no painel."
        actions={
          <form className="flex items-center gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="ator, entidade ou ID"
              className="kumbu-input w-56"
            />
            <input
              name="action"
              defaultValue={action}
              placeholder="acção (ex.: user.update)"
              className="kumbu-input w-56"
            />
            <button className="kumbu-btn-ghost">Filtrar</button>
          </form>
        }
      />
      <div className="kumbu-card overflow-x-auto">
        <table className="kumbu-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Ator</th>
              <th>Acção</th>
              <th>Entidade</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                  Sem eventos registados.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{formatDateTime(r.created_at)}</td>
                <td>{r.actor_email ?? "—"}</td>
                <td>
                  <span className="kumbu-badge bg-slate-100 text-slate-700">
                    {r.action}
                  </span>
                </td>
                <td>
                  {r.entity}
                  {r.entity_id && (
                    <span className="ml-1 text-xs text-slate-500 font-mono">
                      · {r.entity_id.slice(0, 12)}
                    </span>
                  )}
                </td>
                <td className="font-mono text-[11px] text-slate-500 max-w-md truncate">
                  {JSON.stringify(r.payload)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
