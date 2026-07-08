export type DashboardMetric =
  | "users"
  | "sellers"
  | "orders"
  | "listings"
  | "notifications";

export function parseDashboardMetric(value: string | undefined): DashboardMetric {
  if (
    value === "sellers" ||
    value === "orders" ||
    value === "listings" ||
    value === "notifications"
  ) {
    return value;
  }
  return "users";
}
