import Link from "next/link";
import { ChevronRight, Search, Users as UsersIcon, ShieldCheck } from "lucide-react";
import { adminList } from "@/lib/admin-data";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { AccountStatusBadge } from "@/components/ui/account-status-badge";
import { MarketplaceRoleBadge } from "@/components/ui/marketplace-role-badge";
import { ClientSourceBadge } from "@/components/ui/client-source-badge";
import { SignupAuthMethodBadge } from "@/components/ui/signup-auth-method-badge";
import { formatDate } from "@/lib/utils";
import type { KumbuUser } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const params = await searchParams;
  const query = (params?.q ?? "").trim();
  const status = params?.status ?? "all";
  const page = Math.max(1, Number(params?.page ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const users = await adminList<KumbuUser>("users", {
    q: query || undefined,
    status: status !== "all" ? status : undefined,
    page,
    size: PAGE_SIZE,
  });
  const total = users.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const adminIds = new Set<string>();
  const purchaseCountByUser = new Map<string, number>();
  const listingCountByUser = new Map<string, number>();

  if (users.length > 0) {
    const ids = users.map((u) => u.id);
    const [admins, orders, listings] = await Promise.all([
      adminList<{ user_id: string }>("admins"),
      adminList<{ user_id: string }>("orders"),
      adminList<{ seller_id: string; deleted_at?: string | null }>("products"),
    ]);
    for (const a of admins ?? []) adminIds.add(a.user_id as string);
    for (const o of orders ?? []) {
      const uid = o.user_id as string;
      purchaseCountByUser.set(uid, (purchaseCountByUser.get(uid) ?? 0) + 1);
    }
    for (const p of listings ?? []) {
      const sid = p.seller_id as string;
      listingCountByUser.set(sid, (listingCountByUser.get(sid) ?? 0) + 1);
    }
  }

  return (
    <div>
      <PageHeader
        title="Utilizadores do marketplace"
        subtitle={`${total} conta(s) C2C · filtro: ${statusLabel(status)}`}
        actions={
          <form className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="E-mail, nome, telefone, cidade"
                className="kumbu-input w-72 max-w-full pl-9"
              />
            </div>
            <select name="status" defaultValue={status} className="kumbu-input">
              <option value="all">Todos os estados</option>
              <option value="active">Contas activas</option>
              <option value="deleted">Contas eliminadas</option>
              <option value="banned">Banidos</option>
            </select>
            <button className="kumbu-btn-primary">Filtrar</button>
          </form>
        }
      />

      {users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={query || status !== "all" ? "Sem resultados" : "Sem utilizadores ainda"}
          description="Ajusta os filtros ou espera novos registos na app."
        />
      ) : (
        <div className="kumbu-card overflow-x-auto">
          <table className="kumbu-table">
            <thead>
              <tr>
                <th>Utilizador</th>
                <th>Estado</th>
                <th>Origem / método</th>
                <th>Localização</th>
                <th>Compras</th>
                <th>Anúncios</th>
                <th>Papel</th>
                <th>Criado</th>
                <th>Admin</th>
                <th aria-label="acções" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isAdmin = adminIds.has(u.id);
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={u.photo_url}
                          name={u.display_name}
                          email={u.email}
                          size={36}
                        />
                        <div>
                          <p className="font-semibold text-kumbu-ink">
                            {u.display_name?.trim() || u.email || "Sem nome"}
                          </p>
                          <p className="text-xs text-slate-500">{u.email ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <AccountStatusBadge user={u} />
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Registo
                        </span>
                        <ClientSourceBadge source={u.signup_source} />
                        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Método
                        </span>
                        <SignupAuthMethodBadge method={u.signup_auth_method} />
                        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Última actividade
                        </span>
                        <ClientSourceBadge source={u.last_active_source} />
                      </div>
                    </td>
                    <td className="text-sm">
                      {[u.city, u.country].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="font-semibold text-center">
                      {purchaseCountByUser.get(u.id) ?? 0}
                    </td>
                    <td className="font-semibold text-center">
                      {listingCountByUser.get(u.id) ?? 0}
                    </td>
                    <td>
                      <MarketplaceRoleBadge
                        purchases={purchaseCountByUser.get(u.id) ?? 0}
                        listings={listingCountByUser.get(u.id) ?? 0}
                      />
                    </td>
                    <td>{formatDate(u.created_at)}</td>
                    <td>
                      {isAdmin ? (
                        <span className="kumbu-badge bg-rose-100 text-kumbu-red">
                          <ShieldCheck className="h-3.5 w-3.5" /> Sim
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/users/${u.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-kumbu-red hover:underline"
                      >
                        Controlo total <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} query={query} status={status} />
      )}
    </div>
  );
}

function statusLabel(status: string) {
  if (status === "active") return "activas";
  if (status === "deleted") return "eliminadas";
  if (status === "banned") return "banidos";
  return "todas";
}

function Pagination({
  page,
  totalPages,
  query,
  status,
}: {
  page: number;
  totalPages: number;
  query: string;
  status: string;
}) {
  const make = (p: number) => {
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (status !== "all") sp.set("status", status);
    sp.set("page", String(p));
    return `/users?${sp.toString()}`;
  };
  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      <p className="text-slate-500">
        Página {page} de {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 && (
          <Link href={make(page - 1)} className="kumbu-btn-ghost">
            Anterior
          </Link>
        )}
        {page < totalPages && (
          <Link href={make(page + 1)} className="kumbu-btn-primary">
            Seguinte
          </Link>
        )}
      </div>
    </div>
  );
}

