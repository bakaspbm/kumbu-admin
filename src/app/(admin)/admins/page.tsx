import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/auth";
import { AdminRow, InviteAdminForm } from "./forms";
import type { AdminUserRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const session = await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("admin_users")
    .select("user_id, email, role, created_at")
    .order("created_at");

  const admins = (data ?? []) as AdminUserRow[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administradores"
        subtitle="Gere quem tem acesso ao painel Kumbu Admin e respectivas funções."
      />

      {session.role === "super_admin" && <InviteAdminForm />}

      <div className="kumbu-card overflow-x-auto">
        <table className="kumbu-table">
          <thead>
            <tr>
              <th>Administrador</th>
              <th>Função</th>
              <th aria-label="acções" />
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <AdminRow
                key={a.user_id}
                row={a}
                selfId={session.userId}
                canManage={session.role === "super_admin"}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
