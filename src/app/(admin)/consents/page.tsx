import Link from "next/link";
import { FileCheck } from "lucide-react";
import { adminList } from "@/lib/admin-data";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";
import { CONSENT_TYPE_LABELS } from "@/lib/compliance-labels";
import type { UserBlock, UserConsent } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;

export default async function ConsentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params?.tab === "blocks" ? "blocks" : "consents";
  const page = Math.max(1, Number(params?.page ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const rows = await adminList<UserConsent>("consents", { page, size: PAGE_SIZE });
    const users = await adminList<{ id: string; display_name: string | null; email: string | null }>("users");
    const userMap = new Map<string, string>();
    for (const u of users) userMap.set(u.id, u.display_name ?? u.email ?? u.id.slice(0, 8));
    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    return (
      <div className="space-y-6">
        <PageHeader title="Consentimentos" subtitle={`${rows.length} registo(s) de consentimento`} />
        {rows.length === 0 ? (
          <EmptyState icon={FileCheck} title="Sem consentimentos" description="Registos aparecem quando utilizadores aceitam termos ou regras de publicação." />
        ) : (
          <div className="kumbu-card overflow-hidden">
            <table className="kumbu-table">
              <thead><tr><th>Utilizador</th><th>Tipo</th><th>Data</th><th>User-Agent</th></tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td><Link href={`/users/${row.user_id}`} className="text-sm font-medium text-kumbu-red hover:underline">{userMap.get(row.user_id) ?? row.user_id.slice(0, 8)}</Link></td>
                    <td className="text-sm">{CONSENT_TYPE_LABELS[row.consent_type] ?? row.consent_type}</td>
                    <td className="whitespace-nowrap text-sm text-slate-500">{formatDateTime(row.accepted_at)}</td>
                    <td className="max-w-[240px] truncate text-xs text-slate-500">{row.user_agent ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination tab={tab} page={page} totalPages={totalPages} />
      </div>
    );

}
function TabLinks({ tab }: { tab: string }) {
  return (
    <div className="flex gap-2">
      <Link
        href="/consents"
        className={tab === "consents" ? "kumbu-btn-primary" : "kumbu-btn-secondary"}
      >
        Consentimentos
      </Link>
      <Link
        href="/consents?tab=blocks"
        className={tab === "blocks" ? "kumbu-btn-primary" : "kumbu-btn-secondary"}
      >
        Bloqueios
      </Link>
    </div>
  );
}

function BlocksTable({
  rows,
  userMap,
}: {
  rows: UserBlock[];
  userMap: Map<string, string>;
}) {
  return (
    <div className="kumbu-card overflow-hidden">
      <table className="kumbu-table">
        <thead>
          <tr>
            <th>Quem bloqueou</th>
            <th>Bloqueado</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.blocker_id}-${row.blocked_id}`}>
              <td>
                <Link
                  href={`/users/${row.blocker_id}`}
                  className="text-sm hover:text-kumbu-red"
                >
                  {userMap.get(row.blocker_id) ?? row.blocker_id.slice(0, 8)}
                </Link>
              </td>
              <td>
                <Link
                  href={`/users/${row.blocked_id}`}
                  className="text-sm hover:text-kumbu-red"
                >
                  {userMap.get(row.blocked_id) ?? row.blocked_id.slice(0, 8)}
                </Link>
              </td>
              <td className="whitespace-nowrap text-sm text-slate-500">
                {formatDateTime(row.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({
  tab,
  page,
  totalPages,
}: {
  tab: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  const base = tab === "blocks" ? "/consents?tab=blocks" : "/consents";
  const sep = base.includes("?") ? "&" : "?";
  return (
    <div className="flex justify-center gap-2">
      {page > 1 && (
        <Link
          href={`${base}${sep}page=${page - 1}`}
          className="kumbu-btn-secondary"
        >
          Anterior
        </Link>
      )}
      <span className="self-center text-sm text-slate-500">
        Página {page} de {totalPages}
      </span>
      {page < totalPages && (
        <Link
          href={`${base}${sep}page=${page + 1}`}
          className="kumbu-btn-secondary"
        >
          Seguinte
        </Link>
      )}
    </div>
  );
}
