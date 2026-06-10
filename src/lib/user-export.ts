import { adminGet, adminList } from "@/lib/admin-data";

export type UserExportBundle = {
  exported_at: string;
  user: Record<string, unknown>;
  admin: { role: string } | null;
  purchases: Record<string, unknown>[];
  sales: Record<string, unknown>[];
  listings: Record<string, unknown>[];
  notifications: Record<string, unknown>[];
  stats: {
    purchases_total: number;
    sales_total: number;
    listings_total: number;
    notifications_total: number;
  };
};

export async function buildUserExport(
  userId: string
): Promise<UserExportBundle | null> {
  const [user, purchases, sales, listings, notifications, adminRow] =
    await Promise.all([
      adminGet<Record<string, unknown>>("users", userId),
      adminList<Record<string, unknown>>("orders", { user_id: userId }),
      adminList<Record<string, unknown>>("orders", { seller_id: userId }),
      adminList<Record<string, unknown>>("products", { seller_id: userId }),
      adminList<Record<string, unknown>>("notifications", { user_id: userId }),
      adminList<{ user_id: string; role: string }>("admins", { user_id: userId }).then(
        (r) => r[0] ?? null,
      ),
    ]);

  if (!user) return null;

  return {
    exported_at: new Date().toISOString(),
    user,
    admin: adminRow ? { role: adminRow.role } : null,
    purchases,
    sales,
    listings,
    notifications,
    stats: {
      purchases_total: purchases.length,
      sales_total: sales.length,
      listings_total: listings.length,
      notifications_total: notifications.length,
    },
  };
}
