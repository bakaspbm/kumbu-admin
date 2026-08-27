import "server-only";

import http from "node:http";
import https from "node:https";
import type { IncomingMessage } from "node:http";
import { KumbuApiError } from "@/lib/kumbu-api/api-error";
import { getKumbuApiBaseUrl } from "@/lib/kumbu-api/config";
import {
  kumbuApiFetchBase,
  throwForStatus,
  type KumbuFetchOptions,
} from "@/lib/kumbu-api/fetch";

export type { KumbuFetchOptions };

function isIpv4Host(hostname: string): boolean {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
}

function readIncoming(res: IncomingMessage): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    res.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    res.on("end", () => {
      resolve({
        status: res.statusCode ?? 0,
        text: Buffer.concat(chunks).toString("utf8"),
      });
    });
    res.on("error", reject);
  });
}

function originHttpFetch(
  target: URL,
  init: RequestInit,
  headers: Headers,
  hostHeader: string,
): Promise<{ status: number; text: string }> {
  const isHttps = target.protocol === "https:";
  const lib = isHttps ? https : http;
  const method = (init.method ?? "GET").toUpperCase();
  const body =
    typeof init.body === "string"
      ? init.body
      : init.body == null
        ? undefined
        : Buffer.from(String(init.body));

  const reqHeaders: Record<string, string> = { Host: hostHeader };
  headers.forEach((value, key) => {
    if (key.toLowerCase() === "host") return;
    reqHeaders[key] = value;
  });
  if (body && !reqHeaders["Content-Length"] && !reqHeaders["content-length"]) {
    reqHeaders["Content-Length"] = String(Buffer.byteLength(body));
  }

  return new Promise((resolve, reject) => {
    const req = lib.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || (isHttps ? 443 : 80),
        path: `${target.pathname}${target.search}`,
        method,
        headers: reqHeaders,
        timeout: 30_000,
      },
      (res) => {
        readIncoming(res).then(resolve, reject);
      },
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Timeout ao contactar a API de origem."));
    });
    if (body) req.write(body);
    req.end();
  });
}

/**
 * Fetch server-side. Se `KUMBU_API_URL` aponta para o IP do VPS e
 * `KUMBU_API_HOST=api.kumbu-market.com`, contorna Cloudflare Bot Fight.
 */
export async function kumbuServerFetch<T>(
  path: string,
  init: RequestInit = {},
  options: KumbuFetchOptions = {},
): Promise<T> {
  const hostHeader = process.env.KUMBU_API_HOST?.trim();
  const base = getKumbuApiBaseUrl();
  let parsed: URL;
  try {
    parsed = new URL(path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`);
  } catch {
    return kumbuApiFetchBase<T>(path, init, options);
  }

  if (!hostHeader || !isIpv4Host(parsed.hostname)) {
    return kumbuApiFetchBase<T>(path, init, options);
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);
  const headers = new Headers(init.headers ?? {});
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (options.withAuth && options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  let status: number;
  let text: string;
  try {
    const result = await originHttpFetch(url, init, headers, hostHeader);
    status = result.status;
    text = result.text;
  } catch (error) {
    throw new KumbuApiError(
      error instanceof Error ? error.message : "Falha de rede com a API Kumbu.",
      502,
    );
  }

  if (status < 200 || status >= 300) {
    throwForStatus(status, path, text);
  }
  if (status === 204 || status === 205 || !text.trim()) {
    return undefined as unknown as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new KumbuApiError("Resposta inválida do servidor.", 502);
  }
}
