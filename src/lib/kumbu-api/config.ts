import { env } from "@/lib/env";

export function getKumbuApiBaseUrl(): string {
  return env.kumbuApiUrl.replace(/\/+$/, "");
}
