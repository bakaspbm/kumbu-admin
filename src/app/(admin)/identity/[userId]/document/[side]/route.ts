import { cookies } from "next/headers";
import { getKumbuApiBaseUrl } from "@/lib/kumbu-api/server-client";

export async function GET(
  _request: Request,
  context: { params: Promise<{ userId: string; side: string }> },
) {
  const { userId, side } = await context.params;
  const cookieStore = await cookies();
  const token = cookieStore.get("kumbu_access_token")?.value;
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = `${getKumbuApiBaseUrl()}/admin/identity/users/${userId}/documents/${side}`;
  const upstream = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!upstream.ok) {
    return new Response("Not found", { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const buffer = await upstream.arrayBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=300",
    },
  });
}
