import Link from "next/link";
import { ChevronRight, Search, Users as UsersIcon, ShieldCheck } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import type { KumbuUser } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = (params?.q ?? "").trim();
  const page = Math.max(1, Number(params?.page ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createSupabaseServerClient();
  let request = supabase
    .from("users")
    .select("id, email, display_name, phone, photo_url, created_at, updated_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query) {
    request = request.or(
      `email.ilike.%${query}%,display_name.ilike.%${query}%,phone.ilike.%${query}%`
    );
  }

  const { data, count } = await request;
  const users = (data ?? []) as KumbuUser[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const adminIds = new Set<string>();
  if (users.length > 0) {
    const { data: admins } = await supabase
      .from("admin_users")
      .select("user_id")
      .in("user_id", users.map((u) => u.id));
    for (const a of admins ?? []) adminIds.add(a.user_id);
  }

  return (
    <div>
      <PageHeader
        title="Utilizadores"
        subtitle={`${total} conta(s) registadas na plataforma.`}
        actions={
          <form className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Procurar e-mail, nome ou telefone"
                className="kumbu-input pl-9 w-72 max-w-full"
              />
            </div>
            <button className="kumbu-btn-primary">Procurar</button>
          </form>
        }
      />

      {users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={query ? "Sem resultados" : "Sem utilizadores ainda"}
          description={
            query
              ? "Tenta outro termo de pesquisa."
              : "Quando alguém criar conta na app Kumbu, aparece aqui."
          }
        />
      ) : (
        <div className="kumbu-card overflow-x-auto">
          <table className="kumbu-table">
            <thead>
              <tr>
                <th>Utilizador</th>
                <th>Contacto</th>
                <th>Criado</th>
                <th>Função</th>
                <th aria-label="ações" />
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
                          <p className="text-xs text-slate-500 font-mono">
                            {u.id.slice(0, 8)}…
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="font-medium">{u.email ?? "—"}</p>
                      <p className="text-xs text-slate-500">{u.phone || "—"}</p>
                    </td>
                    <td>{formatDate(u.created_at)}</td>
                    <td>
                      {isAdmin ? (
                        <span className="kumbu-badge bg-rose-100 text-kumbu-red">
                          <ShieldCheck className="h-3.5 w-3.5" /> Admin
                        </span>
                      ) : (
                        <span className="kumbu-badge bg-slate-100 text-slate-600">
                          Cliente
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/users/${u.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-kumbu-red hover:underline"
                      >
                        Gerir <ChevronRight className="h-4 w-4" />
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
        <Pagination
          page={page}
          totalPages={totalPages}
          query={query}
          path="/users"
        />
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  query,
  path,
}: {
  page: number;
  totalPages: number;
  query: string;
  path: string;
}) {
  const make = (p: number) => {
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    sp.set("page", String(p));
    return `${path}?${sp.toString()}`;
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
