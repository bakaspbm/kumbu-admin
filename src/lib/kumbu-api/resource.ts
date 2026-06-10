import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";

type Primitive = string | number | boolean | null | undefined;

function toQuery(params?: Record<string, Primitive>) {
  if (!params) return "";
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    query.set(key, String(value));
  }
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export function createAdminResource(basePath: string) {
  const path = basePath.startsWith("/") ? basePath : `/${basePath}`;
  return {
    list<T>(params?: Record<string, Primitive>) {
      return kumbuApiFetch<T>(`${path}${toQuery(params)}`, { method: "GET" }, { withAuth: true });
    },
    get<T>(id: string) {
      return kumbuApiFetch<T>(`${path}/${id}`, { method: "GET" }, { withAuth: true });
    },
    create<T>(input: unknown) {
      return kumbuApiFetch<T>(
        path,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
        { withAuth: true },
      );
    },
    update<T>(id: string, input: unknown) {
      return kumbuApiFetch<T>(
        `${path}/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
        { withAuth: true },
      );
    },
    patch<T>(id: string, input: unknown) {
      return kumbuApiFetch<T>(
        `${path}/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
        { withAuth: true },
      );
    },
    remove<T = void>(id: string) {
      return kumbuApiFetch<T>(`${path}/${id}`, { method: "DELETE" }, { withAuth: true });
    },
    action<T>(id: string, actionPath: string, input?: unknown, method: "POST" | "PATCH" = "POST") {
      return kumbuApiFetch<T>(
        `${path}/${id}/${actionPath.replace(/^\/+/, "")}`,
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input ?? {}),
        },
        { withAuth: true },
      );
    },
  };
}

