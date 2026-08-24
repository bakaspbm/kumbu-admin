import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";
import { KumbuApiError } from "@/lib/kumbu-api/api-error";

export type MailboxMessageSummary = {
  uid: number;
  subject: string;
  from: string;
  to: string;
  received_at: string | null;
  seen: boolean;
  has_attachments: boolean;
};

export type MailboxMessageDetail = MailboxMessageSummary & {
  body_text: string;
  body_html: string | null;
};

export type MailboxListResponse = {
  items: MailboxMessageSummary[];
  page: number;
  size: number;
  total: number;
  total_pages: number;
};

export type MailboxReplyResponse = {
  ok: boolean;
  to: string;
  subject: string;
};

export const supportMailboxApi = {
  async unreadCount(): Promise<{ count: number }> {
    return kumbuApiFetch<{ count: number }>(
      "/admin/mailbox/unread-count",
      {},
      { withAuth: true },
    );
  },

  async list(params?: { page?: number; size?: number }): Promise<MailboxListResponse> {
    const sp = new URLSearchParams();
    if (params?.page != null) sp.set("page", String(params.page));
    if (params?.size != null) sp.set("size", String(params.size));
    const qs = sp.toString();
    return kumbuApiFetch<MailboxListResponse>(
      `/admin/mailbox/messages${qs ? `?${qs}` : ""}`,
      {},
      { withAuth: true },
    );
  },

  async get(uid: number): Promise<MailboxMessageDetail> {
    return kumbuApiFetch<MailboxMessageDetail>(
      `/admin/mailbox/messages/${uid}`,
      {},
      { withAuth: true },
    );
  },

  async reply(uid: number, body: string): Promise<MailboxReplyResponse> {
    return kumbuApiFetch<MailboxReplyResponse>(
      `/admin/mailbox/messages/${uid}/reply`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      },
      { withAuth: true },
    );
  },

  isNotConfigured(error: unknown): boolean {
    return error instanceof KumbuApiError && error.status === 503;
  },
};
