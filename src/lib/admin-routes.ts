/** Mapeia recursos lógicos do admin para paths reais do backend Spring Boot. */
const RESOURCE_ALIASES: Record<string, string> = {
  categories: "catalog/categories",
  "categories/subcategories": "catalog/subcategories",
  legal: "app/legal-documents",
  filters: "app/sort-filters",
  marketing: "app/marketing-blocks",
  "payment-methods": "app/payment-methods",
  support: "app/support-settings",
  admins: "system/admins",
  audit: "system/audit-log",
  consents: "compliance/consents",
  analytics: "system/analytics/snapshot",
  "analytics/rankings": "system/analytics/rankings",
  "dashboard/control": "dashboard/control",
};

export function resolveAdminResource(resource: string): string {
  return RESOURCE_ALIASES[resource] ?? resource;
}

export function resolveAdminApiPath(resource: string, suffix = ""): string {
  const base = resolveAdminResource(resource);
  const normalizedSuffix = suffix.startsWith("/") ? suffix : suffix ? `/${suffix}` : "";
  return `/admin/${base}${normalizedSuffix}`;
}
