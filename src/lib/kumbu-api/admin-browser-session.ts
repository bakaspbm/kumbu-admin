"use client";

let memoryAccessToken: string | null = null;
let bootstrapInFlight: Promise<string | null> | null = null;

export function setAdminBrowserAccessToken(token: string | null | undefined): void {
  memoryAccessToken = token?.trim() || null;
}

export function getAdminBrowserAccessToken(): string | null {
  return memoryAccessToken;
}

export async function bootstrapAdminBrowserAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (bootstrapInFlight) return bootstrapInFlight;

  bootstrapInFlight = (async () => {
    try {
      const response = await fetch("/api/auth/bootstrap", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        setAdminBrowserAccessToken(null);
        return null;
      }
      const payload = (await response.json()) as { accessToken?: string };
      const token = payload.accessToken?.trim() || null;
      setAdminBrowserAccessToken(token);
      return token;
    } catch {
      return null;
    } finally {
      bootstrapInFlight = null;
    }
  })();

  return bootstrapInFlight;
}

export async function ensureAdminBrowserAccessToken(): Promise<string | null> {
  const current = getAdminBrowserAccessToken();
  if (current) return current;
  return bootstrapAdminBrowserAccessToken();
}

