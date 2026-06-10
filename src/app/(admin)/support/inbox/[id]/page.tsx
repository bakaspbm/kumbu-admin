import { notFound } from "next/navigation";
import { supportInboxApi } from "@/lib/kumbu-api/support-inbox";
import { PageHeader } from "@/components/ui/page-header";
import { SupportSubNav } from "../../support-subnav";
import { SupportInboxDetailClient } from "./support-inbox-detail-client";

export const dynamic = "force-dynamic";

export default async function SupportInboxDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversation = await supportInboxApi.get(id).catch(() => null);
  if (!conversation) notFound();

  return (
    <div>
      <PageHeader title="Chat de suporte" subtitle="Responda ao utilizador em tempo real." />
      <SupportSubNav active="/support/inbox" />
      <SupportInboxDetailClient conversation={conversation} />
    </div>
  );
}
