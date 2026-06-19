import { kumbuApiFetch, getKumbuApiBaseUrl, getKumbuAccessToken } from "@/lib/kumbu-api/server-client";

export type IdentityVerificationItem = {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  documents_count: number;
};

export type IdentityDocumentReview = {
  side: string;
  uploaded_at: string;
  review_status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason: string | null;
  reviewed_at: string | null;
};

export type IdentityVerificationDetail = {
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  verification_id: string | null;
  status: string;
  admin_note: string | null;
  reviewed_at: string | null;
  created_at: string | null;
  documents: IdentityDocumentReview[];
};

export const identityApi = {
  pendingCount() {
    return kumbuApiFetch<{ count: number }>("/admin/identity/verifications/pending-count", {}, { withAuth: true });
  },

  list(params?: { status?: string; page?: number; size?: number }) {
    const sp = new URLSearchParams();
    if (params?.status) sp.set("status", params.status);
    if (params?.page != null) sp.set("page", String(params.page));
    if (params?.size != null) sp.set("size", String(params.size));
    const qs = sp.toString();
    return kumbuApiFetch<{
      items: IdentityVerificationItem[];
      page: number;
      size: number;
      total: number;
      total_pages: number;
    }>(`/admin/identity/verifications${qs ? `?${qs}` : ""}`, {}, { withAuth: true });
  },

  get(userId: string) {
    return kumbuApiFetch<IdentityVerificationDetail>(`/admin/identity/users/${userId}`, {}, { withAuth: true });
  },

  approve(userId: string, note?: string) {
    return kumbuApiFetch(`/admin/identity/users/${userId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: note ?? "" }),
    }, { withAuth: true });
  },

  reject(userId: string, note: string) {
    return kumbuApiFetch(`/admin/identity/users/${userId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    }, { withAuth: true });
  },

  approveDocument(userId: string, side: string, note?: string) {
    return kumbuApiFetch(`/admin/identity/users/${userId}/documents/${side}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: note ?? "" }),
    }, { withAuth: true });
  },

  rejectDocument(userId: string, side: string, note: string) {
    return kumbuApiFetch(`/admin/identity/users/${userId}/documents/${side}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    }, { withAuth: true });
  },

  async documentUrl(userId: string, side: string): Promise<string | null> {
    const token = await getKumbuAccessToken();
    if (!token) return null;
    return `${getKumbuApiBaseUrl()}/admin/identity/users/${userId}/documents/${side}`;
  },
};
