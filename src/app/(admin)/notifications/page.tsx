import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { NotificationComposer } from "./composer";
import { NotificationList } from "./notification-list";
import type { UserNotification } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const params = await searchParams;
  const showHidden = params.show === "hidden";

  const supabase = await createSupabaseServerClient();

  const [notifRes, usersRes] = await Promise.all([
    supabase
      .from("user_notifications")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("users")
      .select("id, email, display_name")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  let items = (notifRes.data ?? []) as UserNotification[];
  if (!showHidden) {
    items = items.filter((n) => !n.hidden_at);
  }

  const userOptions = (usersRes.data ?? []).map((u) => ({
    id: u.id as string,
    email: (u.email as string | null) ?? "",
    name: (u.display_name as string | null) ?? "",
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificações"
        subtitle={`${notifRes.count ?? 0} no total · envia para todos ou um utilizador · oculta mensagens na app sem apagar.`}
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
        <NotificationList items={items} />
      </div>
    </div>
  );
}
