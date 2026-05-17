"use client";

import dynamic from "next/dynamic";
import type { AdminSession } from "@/lib/auth";
import { AdminShellSkeleton } from "@/components/shell/admin-shell-skeleton";

const AdminShell = dynamic(
  () =>
    import("@/components/shell/admin-shell").then((m) => ({
      default: m.AdminShell,
    })),
  { ssr: false, loading: () => <AdminShellSkeleton /> }
);

export function AdminLayoutClient({
  session,
  children,
}: {
  session: AdminSession;
  children: React.ReactNode;
}) {
  return <AdminShell session={session}>{children}</AdminShell>;
}
