import { adminList } from "@/lib/admin-data";

import { PageHeader } from "@/components/ui/page-header";

import { NotificationComposer } from "./composer";

import { NotificationListLive } from "./notification-list-live";

import type { UserNotification } from "@/lib/types";



export const dynamic = "force-dynamic";



export default async function NotificationsPage({

  searchParams,

}: {

  searchParams: Promise<{ show?: string }>;

}) {

  const params = await searchParams;

  const showHidden = params.show === "hidden";



  const [notifRows, usersRows] = await Promise.all([

    adminList<UserNotification>("notifications", { limit: 100 }),

    adminList<{ id: string; email: string | null; display_name: string | null }>("users", {

      limit: 200,

      deleted_at: null,

    }),

  ]);

  let items = notifRows;

  if (!showHidden) {

    items = items.filter((n) => !n.hidden_at);

  }

  const userOptions = usersRows.map((u) => ({

    id: u.id,

    email: u.email ?? "",

    name: u.display_name ?? "",

  }));



  return (

    <div className="space-y-6">

      <PageHeader

        title="Notificações"

        subtitle={`${notifRows.length} no total · envia para todos ou um utilizador · oculta mensagens na app sem apagar.`}

        actions={

          <a

            href={showHidden ? "/notifications" : "/notifications?show=hidden"}

            className="kumbu-btn-ghost text-sm"

          >

            {showHidden ? "Ocultar lista de ocultas" : "Ver ocultas"}

          </a>

        }

      />

      <NotificationComposer userOptions={userOptions} />

      <div className="kumbu-card p-5">

        <p className="kumbu-label">Histórico</p>

        <h3 className="mb-3 text-base font-semibold">

          {showHidden ? "Notificações ocultas" : "Últimas mensagens"}

        </h3>

        <p className="mb-4 text-xs text-slate-500">

          Na app móvel, filtra{" "}

          <code className="rounded bg-slate-100 px-1">hidden_at IS NULL</code> para

          não mostrar ocultas aos utilizadores.

        </p>

        <NotificationListLive initialItems={items} showHidden={showHidden} />

      </div>

    </div>

  );

}

