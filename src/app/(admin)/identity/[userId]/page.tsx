import { notFound } from "next/navigation";
import { identityApi } from "@/lib/kumbu-api/identity";
import { PageHeader } from "@/components/ui/page-header";
import { IdentityReviewClient } from "./identity-review-client";

export const dynamic = "force-dynamic";

export default async function IdentityDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const detail = await identityApi.get(userId).catch(() => null);
  if (!detail) notFound();

  return (
    <div>
      <PageHeader title="Revisão KYC" subtitle="Confirme frente, verso e selfie do documento." />
      <IdentityReviewClient detail={detail} />
    </div>
  );
}
