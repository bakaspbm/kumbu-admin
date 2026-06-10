import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Bell,
  UserCircle,
  Package,
  Store,
} from "lucide-react";
import { adminGet, adminList } from "@/lib/admin-data";
import { getOptionalAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar } from "@/components/ui/avatar";
import { OrderStatusBadge } from "@/components/ui/status-badge";
import { AccountStatusBadge } from "@/components/ui/account-status-badge";
import { MarketplaceRoleBadge } from "@/components/ui/marketplace-role-badge";
import {
  ClientSourceBadge,
  clientSourceLabel,
} from "@/components/ui/client-source-badge";
import {
  SignupAuthMethodBadge,
  signupAuthMethodLabel,
} from "@/components/ui/signup-auth-method-badge";
import { JsonBlock } from "@/components/ui/json-block";
import { NotificationRowActions } from "@/components/notifications/notification-row-actions";
import { formatDate, formatDateTime } from "@/lib/utils";
import type {
  CatalogProduct,
  KumbuOrder,
  KumbuUser,
  UserNotification,
} from "@/lib/types";
import {
  DeleteUserForm,
  ExportUserButton,
  PasswordResetForm,
  PromoteAdminForm,
  RestoreUserForm,
  UpdateUserForm,
  UserBanPanel,
} from "./forms";
import { formatBanStatusLabel, isUserCurrentlyBanned } from "@/lib/user-ban";
import { UserReportsSection } from "@/components/users/user-reports-section";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const adminSession = await getOptionalAdmin();
  const isSuperAdmin = adminSession?.role === "super_admin";
  const [user, purchases, sales, listings, notifications, adminRow, purchaseStats, salesStats] =
    await Promise.all([
      adminGet<KumbuUser>("users", id),
      adminList<KumbuOrder>("orders", { user_id: id, limit: 15 }),
      adminList<KumbuOrder>("orders", { seller_id: id, limit: 15 }),
      adminList<CatalogProduct>("products", { seller_id: id, limit: 15 }),
      adminList<UserNotification>("notifications", { user_id: id, limit: 30 }),
      adminList<{ user_id: string; role: string }>("admins", { user_id: id }).then((r) => r[0] ?? null),
      adminList<{ status: KumbuOrder["status"] }>("orders", { user_id: id }),
      adminList<{ status: KumbuOrder["status"] }>("orders", { seller_id: id }),
    ]);

  if (!user) notFound();

  const activeListings = listings.filter((p) => !p.deleted_at).length;

  const purchaseByStatus = { processing: 0, shipping: 0, delivered: 0, cancelled: 0 };
  for (const o of purchaseStats ?? []) {
    const s = o.status as keyof typeof purchaseByStatus;
    if (s in purchaseByStatus) purchaseByStatus[s]++;
  }

  const salesByStatus = { processing: 0, shipping: 0, delivered: 0, cancelled: 0 };
  for (const o of salesStats ?? []) {
    const s = o.status as keyof typeof salesByStatus;
    if (s in salesByStatus) salesByStatus[s]++;
  }

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
        subtitle={
          user.deleted_at
            ? `Conta eliminada em ${formatDateTime(user.deleted_at)}.`
            : `Marketplace C2C · conta desde ${formatDate(user.created_at)} · registo: ${clientSourceLabel(user.signup_source)} (${signupAuthMethodLabel(user.signup_auth_method)}) · última actividade: ${clientSourceLabel(user.last_active_source)}.`
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AccountStatusBadge user={user} />
            <MarketplaceRoleBadge
              purchases={purchaseStats?.length ?? 0}
              listings={activeListings}
            />
            <ExportUserButton userId={user.id} />
          </div>
        }
      />

      <UserReportsSection userId={id} />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MarketplaceStat
          label="Compras"
          value={purchaseStats?.length ?? 0}
          icon={ShoppingBag}
        />
        <MarketplaceStat
          label="Vendas"
          value={salesStats?.length ?? 0}
          icon={Store}
        />
        <MarketplaceStat label="Anúncios activos" value={activeListings} icon={Package} />
        <MarketplaceStat label="Anúncios totais" value={listings.length} icon={Package} />
      </section>

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
              <p className="truncate text-xs text-slate-500 font-mono">{user.id}</p>
              {adminRow && (
                <span className="mt-1 inline-block kumbu-badge bg-rose-100 text-kumbu-red text-[10px]">
                  Admin · {adminRow.role}
                </span>
              )}
            </div>
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <Row icon={Mail} label="E-mail" value={user.email ?? "—"} />
            <Row icon={Phone} label="Telefone" value={user.phone || "—"} />
            <div className="flex flex-wrap gap-2 pt-1">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Registo
                </p>
                <ClientSourceBadge source={user.signup_source} className="mt-1" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Método de cadastro
                </p>
                <SignupAuthMethodBadge method={user.signup_auth_method} className="mt-1" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Última actividade
                </p>
                <ClientSourceBadge source={user.last_active_source} className="mt-1" />
              </div>
            </div>
            <Row
              icon={MapPin}
              label="Morada de entrega"
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
            <Row
              icon={UserCircle}
              label="Localização (perfil)"
              value={
                [user.city, user.region, user.country].filter(Boolean).join(", ") || "—"
              }
            />
          </dl>
        </div>

        <div className="kumbu-card p-5 lg:col-span-2">
          <p className="kumbu-label">Editar perfil</p>
          <h3 className="mb-4 text-base font-semibold">Dados básicos e demografia</h3>
          <UpdateUserForm user={user} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="kumbu-card p-5">
          <p className="kumbu-label mb-3">App cliente</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <JsonBlock label="Carrinho (JSON)" data={user.cart} />
            <JsonBlock label="Favoritos (JSON)" data={user.favorites} />
          </div>
        </div>

        <div className="kumbu-card p-5">
          <p className="kumbu-label">Como comprador</p>
          <h3 className="mb-3 text-base font-semibold">Resumo de compras</h3>
          <StatusCounts counts={purchaseByStatus} />
          <Link href="/orders" className="mt-3 inline-flex text-sm font-semibold text-kumbu-red hover:underline">
            Ver todas as transações
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="kumbu-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">
              <span className="inline-flex items-center gap-2">
                <Store className="h-4 w-4 text-emerald-600" />
                Anúncios à venda
              </span>
            </h3>
            <Link href={`/products?seller=${id}`} className="text-xs font-semibold text-kumbu-red hover:underline">
              Ver todos
            </Link>
          </div>
          {listings.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">Sem anúncios publicados.</p>
          ) : (
            <ul className="space-y-2">
              {listings.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 rounded-chip border border-slate-100 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <Link href={`/products/${p.id}`} className="font-semibold text-kumbu-red hover:underline truncate block">
                      {p.title}
                    </Link>
                    <p className="text-xs text-slate-500">{p.price_label}</p>
                  </div>
                  {p.deleted_at ? (
                    <span className="kumbu-badge bg-rose-100 text-rose-700 text-[10px]">Removido</span>
                  ) : p.is_out_of_stock ? (
                    <span className="kumbu-badge bg-amber-100 text-amber-700 text-[10px]">Esgotado</span>
                  ) : (
                    <span className="kumbu-badge bg-emerald-100 text-emerald-700 text-[10px]">Activo</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="kumbu-card p-5">
          <p className="kumbu-label">Como vendedor</p>
          <h3 className="mb-3 text-base font-semibold">Resumo de vendas</h3>
          <StatusCounts counts={salesByStatus} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="kumbu-card p-5">
          <p className="kumbu-label">Segurança</p>
          <h3 className="mb-3 text-base font-semibold">Conta de Auth</h3>
          <div className="space-y-3">
            {user.deleted_at && isSuperAdmin && (
              <RestoreUserForm id={user.id} />
            )}
            {!user.deleted_at && (
              <>
                <UserBanPanel id={user.id} user={user} />
                {isUserCurrentlyBanned(user) && user.ban_reason && (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                    <span className="font-semibold">Motivo:</span> {user.ban_reason}
                  </p>
                )}
                {isUserCurrentlyBanned(user) && (
                  <p className="text-xs text-slate-500">{formatBanStatusLabel(user)}</p>
                )}
                <PasswordResetForm email={user.email} />
                <PromoteAdminForm
                  id={user.id}
                  email={user.email}
                  isAdmin={Boolean(adminRow)}
                />
              </>
            )}
            {isSuperAdmin && <DeleteUserForm id={user.id} />}
          </div>
        </div>

        <div className="kumbu-card p-5 lg:col-span-2 space-y-6">
          <p className="kumbu-label">Transações C2C</p>
          <TransactionTable
            title="Compras (como comprador)"
            empty="Sem compras."
            rows={purchases}
          />
          <TransactionTable
            title="Vendas (como vendedor)"
            empty="Sem vendas."
            rows={sales}
          />
        </div>
      </section>

      <section className="kumbu-card p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold">
            <span className="inline-flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-400" />
              Notificações do utilizador
            </span>
          </h3>
          <Link
            href={`/notifications?user=${encodeURIComponent(user.email ?? user.id)}`}
            className="text-sm font-semibold text-kumbu-red hover:underline"
          >
            Enviar nova
          </Link>
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
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-sm text-slate-600">{n.body}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDateTime(n.created_at)}
                    {n.read_at ? ` · lida em ${formatDateTime(n.read_at)}` : " · por ler"}
                    {n.hidden_at ? " · oculta na app" : ""}
                  </p>
                </div>
                <NotificationRowActions item={n} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function MarketplaceStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof ShoppingBag;
}) {
  return (
    <div className="kumbu-card p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <p className="text-[10px] uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-1 text-2xl font-bold text-kumbu-ink">{value}</p>
    </div>
  );
}

function StatusCounts({
  counts,
}: {
  counts: Record<"processing" | "shipping" | "delivered" | "cancelled", number>;
}) {
  return (
    <ul className="grid grid-cols-2 gap-2 text-sm">
      {(
        [
          ["processing", counts.processing],
          ["shipping", counts.shipping],
          ["delivered", counts.delivered],
          ["cancelled", counts.cancelled],
        ] as const
      ).map(([status, count]) => (
        <li
          key={status}
          className="flex items-center justify-between rounded-chip border border-slate-100 px-3 py-2"
        >
          <OrderStatusBadge status={status} />
          <span className="font-bold">{count}</span>
        </li>
      ))}
    </ul>
  );
}

function TransactionTable({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: KumbuOrder[];
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="kumbu-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id}>
                  <td className="font-mono text-xs">{o.id}</td>
                  <td>{formatDateTime(o.created_at)}</td>
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
        <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
