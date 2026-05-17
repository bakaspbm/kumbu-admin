import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { NotificationComposer } from "./composer";
import { formatDateTime } from "@/lib/utils";
import type { UserNotification } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, count } = await supabase
    .from("user_notifications")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(50);

  const items = (data ?? []) as UserNotification[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificações"
        subtitle={`${count ?? 0} notificação(ões) enviadas no total. Envia uma nova para todos ou um utilizador específico.`}
      />
      <NotificationComposer />
      <div className="kumbu-card p-5">
        <p className="kumbu-label">Histórico recente</p>
        <h3 className="mb-3 text-base font-semibold">Últimas 50</h3>
        {items.length === 0 ? (
          <p className="py-6 text-sm text-slate-500">
            Ainda não enviaste notificações.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((n) => (
              <li
                key={n.id}
                className="flex items-start gap-3 py-3"
              >
                <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-kumbu-red text-[10px] font-semibold uppercase">
                  {n.icon_key.slice(0, 2)}
                </span>
                <div className="flex-1">
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-sm text-slate-600">{n.body}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDateTime(n.created_at)} ·{" "}
                    <span className="font-mono">
                      {n.user_id.slice(0, 8)}…
                    </span>{" "}
                    {n.read_at ? "· lida" : "· por ler"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
