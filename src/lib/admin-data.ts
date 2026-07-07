import { redirect } from "next/navigation";
import { KumbuApiError, kumbuApiFetch } from "@/lib/kumbu-api/server-client";
import { resolveAdminApiPath, resolveAdminResource } from "@/lib/admin-routes";

type QueryValue = string | number | boolean | null | undefined;

function buildQuery(params?: Record<string, QueryValue>) {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined || v === "") continue;
    sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

/** Backend usa paginação 0-based; UI do admin envia 1-based. */
function normalizeListQuery(query?: Record<string, QueryValue>) {
  if (!query) return query;
  const next = { ...query };
  if (next.page != null) {
    const page = Number(next.page);
    if (!Number.isNaN(page) && page >= 1) {
      next.page = page - 1;
    }
  }
  return next;
}

export type AdminListSafeResult<T> = {
  data: T[];
  error?: string;
};

function apiListErrorMessage(error: unknown): string {
  if (error instanceof KumbuApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Erro ao carregar dados.";
}

function normalizeListResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.content)) return obj.content as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.series)) return obj.series as T[];
  }
  return [];
}

async function fetchAdminList<T>(
  resource: string,
  query?: Record<string, QueryValue>,
): Promise<T[]> {
  const path = resolveAdminApiPath(resource);
  const data = await kumbuApiFetch<unknown>(
    `${path}${buildQuery(normalizeListQuery(query))}`,
    { method: "GET" },
    { withAuth: true },
  );
  return normalizeListResponse<T>(data);
}

async function fetchAdminListSafe<T>(
  resource: string,
  query?: Record<string, QueryValue>,
  fallback: T[] = [],
): Promise<AdminListSafeResult<T>> {
  try {
    const data = await fetchAdminList<T>(resource, query);
    return { data };
  } catch (error) {
    if (error instanceof KumbuApiError && error.status === 401) {
      redirect("/login?expired=1");
    }
    return { data: fallback, error: apiListErrorMessage(error) };
  }
}

export async function adminListSafe<T>(
  resource: string,
  query?: Record<string, QueryValue>,
  fallback: T[] = [],
): Promise<AdminListSafeResult<T>> {
  return fetchAdminListSafe(resource, query, fallback);
}

export async function adminList<T>(
  resource: string,
  query?: Record<string, QueryValue>,
): Promise<T[]> {
  const { data } = await fetchAdminListSafe<T>(resource, query, []);
  return data;
}

/** Resposta JSON única (objecto ou array directo). */
export async function adminFetch<T>(
  resource: string,
  query?: Record<string, QueryValue>,
): Promise<T | null> {
  try {
    return await kumbuApiFetch<T>(
      `${resolveAdminApiPath(resource)}${buildQuery(normalizeListQuery(query))}`,
      { method: "GET" },
      { withAuth: true },
    );
  } catch (error) {
    if (error instanceof KumbuApiError && error.status === 401) redirect("/login?expired=1");
    return null;
  }
}

/** Endpoints que devolvem `{ items: [T] }` para um único registo. */
export async function adminFetchItem<T>(
  resource: string,
  query?: Record<string, QueryValue>,
): Promise<T | null> {
  const rows = await adminList<T>(resource, query);
  return rows[0] ?? null;
}

export async function adminGet<T>(resource: string, id: string): Promise<T | null> {
  try {
    return await kumbuApiFetch<T | null>(
      resolveAdminApiPath(resource, encodeURIComponent(id)),
      { method: "GET" },
      { withAuth: true },
    );
  } catch (error) {
    if (error instanceof KumbuApiError && error.status === 401) redirect("/login?expired=1");
    return null;
  }
}

export async function adminUpsert(resource: string, payload: Record<string, unknown>) {
  const json = JSON.stringify(payload);

  if (resource === "legal") {
    const slug = String(payload.slug ?? "");
    await kumbuApiFetch<void>(
      resolveAdminApiPath("legal", slug),
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: json,
      },
      { withAuth: true },
    );
    return;
  }

  if (resource === "support") {
    await kumbuApiFetch<void>(
      resolveAdminApiPath("support"),
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: json,
      },
      { withAuth: true },
    );
    return;
  }

  if (resource === "notifications") {
    await kumbuApiFetch<void>(
      "/admin/notifications/broadcast",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
      },
      { withAuth: true },
    );
    return;
  }

  if (resource === "admins") {
    await kumbuApiFetch<void>(
      resolveAdminApiPath("admins"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: payload.user_id,
          role: payload.role,
        }),
      },
      { withAuth: true },
    );
    return;
  }

  const id = payload.id != null ? String(payload.id) : "";
  const usePatch =
    resource === "marketing" ||
    resource === "filters" ||
    resource === "payment-methods";

  if (usePatch && id) {
    await kumbuApiFetch<void>(
      resolveAdminApiPath(resource, id),
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: json,
      },
      { withAuth: true },
    );
    return;
  }

  if (resource === "categories" && id) {
    try {
      await kumbuApiFetch<void>(
        resolveAdminApiPath("categories", id),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: json,
        },
        { withAuth: true },
      );
    } catch (error) {
      if (error instanceof KumbuApiError && error.status === 404) {
        await kumbuApiFetch<void>(
          resolveAdminApiPath("categories"),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: json,
          },
          { withAuth: true },
        );
      } else {
        throw error;
      }
    }
    return;
  }

  await kumbuApiFetch<void>(
    resolveAdminApiPath(resource),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json,
    },
    { withAuth: true },
  );
}

export async function adminPatch(
  resource: string,
  id: string,
  payload: Record<string, unknown>,
) {
  if (resource === "notifications") {
    if (payload.hidden_at != null) {
      await kumbuApiFetch<void>(
        resolveAdminApiPath("notifications", `${encodeURIComponent(id)}/hide`),
        { method: "POST" },
        { withAuth: true },
      );
    } else if (payload.hidden_at === null) {
      await kumbuApiFetch<void>(
        resolveAdminApiPath("notifications", `${encodeURIComponent(id)}/unhide`),
        { method: "POST" },
        { withAuth: true },
      );
    }
    return;
  }

  if (resource === "orders" && payload.status != null) {
    await kumbuApiFetch<void>(
      resolveAdminApiPath("orders", `${encodeURIComponent(id)}/status`),
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: payload.status }),
      },
      { withAuth: true },
    );
    return;
  }

  if (resource === "conversations" && payload.is_blocked === true) {
    await kumbuApiFetch<void>(
      resolveAdminApiPath("conversations", `${id}/block`),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: payload.blocked_reason ?? null }),
      },
      { withAuth: true },
    );
    return;
  }

  if (resource === "conversations" && payload.is_blocked === false) {
    await kumbuApiFetch<void>(
      resolveAdminApiPath("conversations", `${id}/unblock`),
      { method: "POST" },
      { withAuth: true },
    );
    return;
  }

  if (resource === "messages" || resource.endsWith("/messages")) {
    const hidden = payload.hidden_at != null;
    const messageId = id;
    await kumbuApiFetch<void>(
      `/admin/conversations/messages/${messageId}/${hidden ? "hide" : "unhide"}`,
      { method: "POST" },
      { withAuth: true },
    );
    return;
  }

  await kumbuApiFetch<void>(
    resolveAdminApiPath(resource, encodeURIComponent(id)),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    { withAuth: true },
  );
}

export async function adminDelete(resource: string, id: string, idColumn = "id") {
  void idColumn;
  if (resource === "admins") {
    await kumbuApiFetch<void>(
      resolveAdminApiPath("admins", encodeURIComponent(id)),
      { method: "DELETE" },
      { withAuth: true },
    );
    return;
  }
  await kumbuApiFetch<void>(
    resolveAdminApiPath(resource, encodeURIComponent(id)),
    { method: "DELETE" },
    { withAuth: true },
  );
}

export async function adminAction(
  resource: string,
  id: string,
  action: string,
  payload: Record<string, unknown> = {},
  method: "POST" | "PATCH" = "POST",
) {
  await kumbuApiFetch<void>(
    resolveAdminApiPath(resource, `${encodeURIComponent(id)}/${action}`),
    {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    { withAuth: true },
  );
}

/** @deprecated use resolveAdminResource — export for testes */
export { resolveAdminResource };
