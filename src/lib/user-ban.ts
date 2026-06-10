export type BanDurationKey =
  | "1d"
  | "7d"
  | "30d"
  | "90d"
  | "365d"
  | "permanent";

export const BAN_DURATION_OPTIONS: { value: BanDurationKey; label: string }[] = [
  { value: "1d", label: "1 dia" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "365d", label: "1 ano" },
  { value: "permanent", label: "Permanente" },
];

const DURATION_HOURS: Record<Exclude<BanDurationKey, "permanent">, number> = {
  "1d": 24,
  "7d": 168,
  "30d": 720,
  "90d": 2160,
  "365d": 8760,
};

export function banDurationToHours(key: BanDurationKey): string | null {
  if (key === "permanent") return null;
  return `${DURATION_HOURS[key]}h`;
}

export function computeBannedUntil(key: BanDurationKey, from = new Date()): string | null {
  if (key === "permanent") return null;
  const hours = DURATION_HOURS[key];
  return new Date(from.getTime() + hours * 60 * 60 * 1000).toISOString();
}

export type UserBanFields = {
  banned_at?: string | null;
  banned_until?: string | null;
  ban_reason?: string | null;
  deleted_at?: string | null;
};

export type UserAccountStatus =
  | "active"
  | "deleted"
  | "banned_permanent"
  | "banned_temporary"
  | "ban_expired";

export function getUserAccountStatus(user: UserBanFields, now = new Date()): UserAccountStatus {
  if (user.deleted_at) return "deleted";
  if (!user.banned_at) return "active";
  if (user.banned_until) {
    const until = new Date(user.banned_until);
    if (until <= now) return "ban_expired";
    return "banned_temporary";
  }
  return "banned_permanent";
}

export function isUserCurrentlyBanned(user: UserBanFields, now = new Date()): boolean {
  const s = getUserAccountStatus(user, now);
  return s === "banned_permanent" || s === "banned_temporary";
}

export function formatBanStatusLabel(user: UserBanFields, now = new Date()): string {
  const status = getUserAccountStatus(user, now);
  switch (status) {
    case "deleted":
      return "Conta eliminada";
    case "banned_permanent":
      return "Banido (permanente)";
    case "banned_temporary":
      return `Banido até ${new Date(user.banned_until!).toLocaleString("pt-PT", {
        dateStyle: "short",
        timeStyle: "short",
      })}`;
    case "ban_expired":
      return "Ban expirado";
    default:
      return "Conta activa";
  }
}
