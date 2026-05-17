import { requireAdmin } from "@/lib/auth";
import { AdminLayoutClient } from "@/components/shell/admin-layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <AdminLayoutClient session={session}>{children}</AdminLayoutClient>
  );
}
