const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Segmentos reservados em /users/* — não são IDs de conta. */
const RESERVED_USER_SEGMENTS = new Set(["online"]);

export function isUserUuid(id: string): boolean {
  return UUID_RE.test(id.trim());
}

/** Valida id de rota /users/[id] antes de chamar a API. */
export function resolveUserRouteId(id: string): "online" | "invalid" | "ok" {
  const trimmed = id.trim();
  if (RESERVED_USER_SEGMENTS.has(trimmed)) return "online";
  if (!isUserUuid(trimmed)) return "invalid";
  return "ok";
}
