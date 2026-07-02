import { env } from "@/lib/env";

/** Endpoint SockJS para STOMP (suporte + eventos). */
export function getAdminWsEndpoint(): string | null {
  const api = env.kumbuApiUrl?.trim();
  if (!api) return null;
  try {
    const url = new URL(api);
    url.pathname = "/ws/chat";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

