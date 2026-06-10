import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";

export type KumbuAdminMeResponse = {
  userId: string;
  email: string;
  role?: "super_admin" | "admin" | "support" | string;
};

export type KumbuAdminUsersResponse = {
  content: Array<{
    id: string;
    email: string | null;
    fullName: string | null;
    phone: string | null;
    profileImageUrl: string | null;
    city: string | null;
    country: string | null;
  }>;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export async function listUsers(page = 0, size = 20) {
  return kumbuApiFetch<KumbuAdminUsersResponse>(
    `/admin/users?page=${page}&size=${size}`,
    { method: "GET" },
    { withAuth: true }
  );
}

export async function banUser(
  id: string,
  input: { reason?: string; until?: string | null } = {}
) {
  return kumbuApiFetch<void>(
    `/admin/users/${id}/ban`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason: input.reason ?? "",
        until: input.until ?? null,
      }),
    },
    { withAuth: true }
  );
}

export async function unbanUser(id: string) {
  return kumbuApiFetch<void>(
    `/admin/users/${id}/unban`,
    { method: "POST" },
    { withAuth: true }
  );
}

export async function adminMe() {
  return kumbuApiFetch<KumbuAdminMeResponse>(
    "/admin/me",
    { method: "GET" },
    { withAuth: true }
  );
}
