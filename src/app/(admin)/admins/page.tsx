import { adminList } from "@/lib/admin-data";

import { PageHeader } from "@/components/ui/page-header";

import { requireAdmin } from "@/lib/auth";

import { AdminRow, InviteAdminForm } from "./forms";

import type { AdminUserRow } from "@/lib/types";



export const dynamic = "force-dynamic";



export default async function AdminsPage() {

  const session = await requireAdmin();

  const admins = await adminList<AdminUserRow>("admins");

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

