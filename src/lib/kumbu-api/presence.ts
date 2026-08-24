"use client";

import { kumbuApiFetch } from "@/lib/kumbu-api/client";
import { ensureAdminBrowserAccessToken } from "@/lib/kumbu-api/admin-browser-session";

/** Actualiza last_seen_at / last_active_source do admin (canal web). */
export async function touchAdminPresence(): Promise<void> {
  const token = await ensureAdminBrowserAccessToken();
  if (!token) return;
  await kumbuApiFetch<void>(
    "/users/me/presence",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kumbu-Client": "web",
      },
      body: JSON.stringify({ source: "web" }),
    },
    { withAuth: true, accessToken: token },
  );
}
