import { NextResponse } from "next/server";
import { requireAdmin, logAudit } from "@/lib/auth";
import { buildUserExport } from "@/lib/user-export";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await context.params;

  const data = await buildUserExport(id);
  if (!data) {
    return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });
  }

  const slug =
    (data.user.display_name as string | null)?.replace(/\s+/g, "-").slice(0, 24) ||
    (data.user.email as string | null)?.split("@")[0] ||
    id.slice(0, 8);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `kumbu-${slug}-${date}.json`;

  await logAudit({
    action: "user.export",
    entity: "users",
    entityId: id,
    payload: { filename },
  });

  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
