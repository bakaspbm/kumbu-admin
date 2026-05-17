import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, ShoppingBag, Bell } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar } from "@/components/ui/avatar";
import { OrderStatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { KumbuOrder, KumbuUser, UserNotification } from "@/lib/types";
import {
  DeleteUserForm,
  PasswordResetForm,
  PromoteAdminForm,
  UpdateUserForm,
} from "./forms";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [userRes, ordersRes, notifsRes, adminRes] = await Promise.all([
    supabase.from("users").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("orders")
      .select("id, user_id, created_at, items_count, total_label, status, show_track")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("user_notifications")
      .select("id, title, body, icon_key, created_at, read_at, user_id")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("admin_users").select("user_id, role").eq("user_id", id).maybeSingle(),
  ]);

  const user = userRes.data as KumbuUser | null;
  if (!user) notFound();
  const orders = (ordersRes.data ?? []) as KumbuOrder[];
  const notifications = (notifsRes.data ?? []) as UserNotification[];
  const adminRow = adminRes.data;

  const address = (user.delivery_address ?? {}) as Record<string, string>;

  return (
    <div className="space-y-6">
      <Link
        href="/users"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-kumbu-red"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar à lista
      </Link>

      <PageHeader
        title={user.display_name?.trim() || user.email || "Sem nome"}
        subtitle={`Conta criada em ${formatDate(user.created_at)}.`}
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="kumbu-card p-5 lg:col-span-1">
          <div className="flex items-center gap-4">
            <Avatar
              src={user.photo_url}
              name={user.display_name}
              email={user.email}
              size={64}
            />
            <div className="min-w-0">
              <p className="truncate text-lg font-bold">
                {user.display_name?.trim() || user.email}
              </p>
              <p className="truncate text-xs text-slate-500 font-mono">
                {user.id}
              </p>
            </div>
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <Row icon={Mail} label="E-mail" value={user.email ?? "—"} />
            <Row icon={Phone} label="Telefone" value={user.phone || "—"} />
            <Row
              icon={MapPin}
              label="Morada"
              value={
                Object.keys(address).length === 0
                  ? "—"
                  : [
                      address.line1,
                      address.line2,
                      address.city,
                      address.zip,
                      address.country,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"
              }
            />
          </dl>
        </div>

        <div className="kumbu-card p-5 lg:col-span-2">
          <p className="kumbu-label">Editar perfil</p>
          <h3 className="mb-4 text-base font-semibold">Dados básicos</h3>
          <UpdateUserForm user={user} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="kumbu-card p-5">
          <p className="kumbu-label">Segurança</p>
          <h3 className="mb-3 text-base font-semibold">Conta de Auth</h3>
          <div className="space-y-3">
            <PasswordResetForm email={user.email} />
            <PromoteAdminForm
              id={user.id}
              email={user.email}
              isAdmin={Boolean(adminRow)}
            />
            <DeleteUserForm id={user.id} />
          </div>
        </div>

        <div className="kumbu-card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="kumbu-label">Operacional</p>
              <h3 className="text-base font-semibold">
                <span className="inline-flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-slate-400" />
                  Últimos pedidos
                </span>
              </h3>
            </div>
            <span className="text-xs text-slate-500">{orders.length} item(ns)</span>
          </div>
          {orders.length === 0 ? (
            <p className="py-6 text-sm text-slate-500">
              Sem pedidos por enquanto.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="kumbu-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Data</th>
                    <th>Itens</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="font-mono text-xs">{o.id}</td>
                      <td>{formatDateTime(o.created_at)}</td>
                      <td>{o.items_count}</td>
                      <td className="font-semibold">{o.total_label}</td>
                      <td>
                        <OrderStatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="kumbu-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold">
            <span className="inline-flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-400" />
              Notificações enviadas
            </span>
          </h3>
          <span className="text-xs text-slate-500">
            {notifications.length} item(ns)
          </span>
        </div>
        {notifications.length === 0 ? (
          <p className="py-4 text-sm text-slate-500">
            Sem notificações enviadas para este utilizador.
          </p>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li
                key={n.id}
                className="flex items-start gap-3 rounded-chip border border-slate-100 px-3 py-2.5"
              >
                <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-kumbu-red text-[10px] font-semibold uppercase">
                  {n.icon_key.slice(0, 2)}
                </span>
                <div className="flex-1">
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-sm text-slate-600">{n.body}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDateTime(n.created_at)}
                    {n.read_at ? ` · lida em ${formatDateTime(n.read_at)}` : " · por ler"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
