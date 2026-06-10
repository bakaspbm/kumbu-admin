import { cn } from "@/lib/utils";
import {
  formatBanStatusLabel,
  getUserAccountStatus,
  type UserBanFields,
} from "@/lib/user-ban";

export function AccountStatusBadge({
  user,
  deletedAt,
}: {
  user?: UserBanFields | null;
  /** @deprecated Prefer `user` with ban fields */
  deletedAt?: string | null;
}) {
  const fields: UserBanFields = user ?? { deleted_at: deletedAt };
  const status = getUserAccountStatus(fields);
  const label = formatBanStatusLabel(fields);

  const tone =
    status === "deleted"
      ? "bg-rose-100 text-rose-800"
      : status === "banned_permanent" || status === "banned_temporary"
        ? "bg-amber-100 text-amber-900"
        : status === "ban_expired"
          ? "bg-slate-100 text-slate-600"
          : "bg-emerald-100 text-emerald-800";

  return (
    <span className={cn("kumbu-badge", tone)}>{label}</span>
  );
}
