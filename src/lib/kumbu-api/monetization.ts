import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";

const base = "/admin/monetization";

export const monetizationApi = {
  overview() {
    return kumbuApiFetch<Record<string, unknown>>(`${base}/overview`, { method: "GET" }, { withAuth: true });
  },
  gate() {
    return kumbuApiFetch<Record<string, unknown>>(`${base}/gate`, { method: "GET" }, { withAuth: true });
  },
  settings() {
    return kumbuApiFetch<Record<string, unknown>>(`${base}/settings`, { method: "GET" }, { withAuth: true });
  },
  updateSettings(input: Record<string, unknown>) {
    return kumbuApiFetch<Record<string, unknown>>(
      `${base}/settings`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
      { withAuth: true },
    );
  },
  enableCharging() {
    return kumbuApiFetch<Record<string, unknown>>(`${base}/settings/enable-charging`, { method: "POST" }, { withAuth: true });
  },
  disableCharging() {
    return kumbuApiFetch<Record<string, unknown>>(`${base}/settings/disable-charging`, { method: "POST" }, { withAuth: true });
  },
  pendingPayments(page = 0, size = 20) {
    return kumbuApiFetch<{ items?: unknown[]; content?: unknown[] }>(
      `${base}/payments/pending?page=${page}&size=${size}`,
      { method: "GET" },
      { withAuth: true },
    );
  },
  confirmPayment(paymentId: string, note?: string) {
    return kumbuApiFetch<void>(
      `${base}/payments/${paymentId}/confirm`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note ?? "" }),
      },
      { withAuth: true },
    );
  },
  rejectPayment(paymentId: string, reason: string) {
    return kumbuApiFetch<void>(
      `${base}/payments/${paymentId}/reject`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      },
      { withAuth: true },
    );
  },
  refreshMetrics() {
    return kumbuApiFetch<void>(`${base}/metrics/refresh`, { method: "POST" }, { withAuth: true });
  },
  categoryMatrix() {
    return kumbuApiFetch<Record<string, unknown>>(`${base}/categories/matrix`, { method: "GET" }, { withAuth: true });
  },
  products() {
    return kumbuApiFetch<{ items?: unknown[] }>(`${base}/products`, { method: "GET" }, { withAuth: true });
  },
  paymentProviders() {
    return kumbuApiFetch<{ providers?: unknown[] }>(`${base}/payment-providers`, { method: "GET" }, { withAuth: true });
  },
  updatePaymentProvider(providerId: string, input: Record<string, unknown>) {
    return kumbuApiFetch<Record<string, unknown>>(
      `${base}/payment-providers/${providerId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
      { withAuth: true },
    );
  },
  updateProduct(productId: string, input: Record<string, unknown>) {
    return kumbuApiFetch<Record<string, unknown>>(
      `${base}/products/${productId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
      { withAuth: true },
    );
  },
  createProduct(input: Record<string, unknown>) {
    return kumbuApiFetch<Record<string, unknown>>(
      `${base}/products`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
      { withAuth: true },
    );
  },
  deleteProduct(productId: string) {
    return kumbuApiFetch<void>(`${base}/products/${productId}`, { method: "DELETE" }, { withAuth: true });
  },
  categoryStrategies() {
    return kumbuApiFetch<{ items?: unknown[] }>(`${base}/categories`, { method: "GET" }, { withAuth: true });
  },
  updateCategoryStrategy(categoryId: string, input: Record<string, unknown>) {
    return kumbuApiFetch<Record<string, unknown>>(
      `${base}/categories/${categoryId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
      { withAuth: true },
    );
  },
};
