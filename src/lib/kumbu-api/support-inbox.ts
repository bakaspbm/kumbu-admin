import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";

export type SupportConversationItem = {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  guest?: boolean;
  support_status: string;
  updated_at: string;
  last_message_body: string | null;
  last_message_at: string | null;
};

export type SupportMessageItem = {
  id: string;
  sender_id: string;
  body: string;
  message_kind: string;
  attachment_url?: string | null;
  created_at: string;
  from_support: boolean;
  admin_actor_id?: string | null;
};

export type SupportConversationDetail = SupportConversationItem & {
  messages: SupportMessageItem[];
};

export const supportInboxApi = {
  waitingCount() {
    return kumbuApiFetch<{ count: number }>("/admin/support/conversations/waiting-count", {}, { withAuth: true });
  },

  list(params?: { status?: string; page?: number; size?: number }) {
    const sp = new URLSearchParams();
    if (params?.status) sp.set("status", params.status);
    if (params?.page != null) sp.set("page", String(params.page));
    if (params?.size != null) sp.set("size", String(params.size));
    const qs = sp.toString();
    return kumbuApiFetch<{
      items: SupportConversationItem[];
      page: number;
      size: number;
      total: number;
      total_pages: number;
    }>(`/admin/support/conversations${qs ? `?${qs}` : ""}`, {}, { withAuth: true });
  },

  get(id: string) {
    return kumbuApiFetch<SupportConversationDetail>(`/admin/support/conversations/${id}`, {}, { withAuth: true });
  },

  reply(id: string, body: string, attachmentUrl?: string | null) {
    const payload: Record<string, string> = { body };
    if (attachmentUrl?.trim()) {
      payload.attachmentUrl = attachmentUrl.trim();
    }
    return kumbuApiFetch(`/admin/support/conversations/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }, { withAuth: true });
  },

  uploadAttachment(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return kumbuApiFetch<{ url: string }>("/files/chat", {
      method: "POST",
      body: formData,
    }, { withAuth: true });
  },

  close(id: string) {
    return kumbuApiFetch(`/admin/support/conversations/${id}/close`, { method: "POST" }, { withAuth: true });
  },
};
