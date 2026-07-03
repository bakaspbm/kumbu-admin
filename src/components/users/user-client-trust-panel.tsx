import Link from "next/link";
import { BadgeCheck, ExternalLink, ShieldCheck } from "lucide-react";
import type { IdentityVerificationDetail } from "@/lib/kumbu-api/identity";
import { VerifiedUserForm } from "@/app/(admin)/users/[id]/forms";
import { IdentityDocumentImage } from "@/components/identity/identity-document-image";
import { formatDateTime } from "@/lib/utils";
import {
  IDENTITY_DOC_SIDE_LABEL,
  IDENTITY_DOC_STATUS_CLASS,
  IDENTITY_DOC_STATUS_LABEL,
  IDENTITY_STATUS_CLASS,
  IDENTITY_STATUS_LABEL,
} from "@/lib/identity-labels";

const DOC_SIDES = ["front", "back", "selfie"] as const;

export function UserClientTrustPanel({
  userId,
  sellerVerified,
  identity,
}: {
  userId: string;
  sellerVerified: boolean;
  identity: IdentityVerificationDetail | null;
}) {
  const kycStatus = identity?.status ?? "NOT_SUBMITTED";
  const docsBySide = new Map(
    (identity?.documents ?? []).map((doc) => [doc.side, doc]),
  );
  const uploadedCount = identity?.documents?.length ?? 0;
  const hasKycSubmission = kycStatus !== "NOT_SUBMITTED" || uploadedCount > 0;

  return (
    <section className="kumbu-card p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="kumbu-label">Confiança do cliente</p>
          <h3 className="text-base font-semibold">KYC e tag de verificação</h3>
          <p className="mt-1 text-sm text-slate-600">
            Identidade enviada na app e selo «Verificado» visível no perfil e nas conversas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`kumbu-badge text-[10px] ${sellerVerified ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
          >
            {sellerVerified ? "Verificado (tag activa)" : "Sem tag verificada"}
          </span>
          <span
            className={`kumbu-badge text-[10px] ${IDENTITY_STATUS_CLASS[kycStatus] ?? IDENTITY_STATUS_CLASS.NOT_SUBMITTED}`}
          >
            {IDENTITY_STATUS_LABEL[kycStatus] ?? kycStatus}
          </span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="kumbu-panel space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <BadgeCheck className="h-4 w-4 text-emerald-600" />
            Tag «Verificado»
          </div>
          <VerifiedUserForm id={userId} sellerVerified={sellerVerified} />
        </div>

        <div className="space-y-4 rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <ShieldCheck className="h-4 w-4 text-kumbu-red" />
              Identidade (KYC)
            </div>
            {hasKycSubmission ? (
              <Link
                href={`/identity/${userId}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-kumbu-red hover:underline"
              >
                Revisão completa
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            ) : null}
          </div>

          {!hasKycSubmission ? (
            <p className="text-sm text-slate-500">
              Este utilizador ainda não enviou documentos de identidade (frente, verso e selfie).
            </p>
          ) : (
            <>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Pedido criado
                  </dt>
                  <dd className="font-medium">
                    {identity?.created_at ? formatDateTime(identity.created_at) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Última revisão
                  </dt>
                  <dd className="font-medium">
                    {identity?.reviewed_at ? formatDateTime(identity.reviewed_at) : "—"}
                  </dd>
                </div>
              </dl>

              {identity?.admin_note ? (
                <p className="kumbu-panel-warning rounded-lg px-3 py-2 text-sm">
                  <span className="kumbu-panel-title font-semibold">Nota interna KYC:</span>{" "}
                  {identity.admin_note}
                </p>
              ) : null}

              <ul className="space-y-2">
                {DOC_SIDES.map((side) => {
                  const doc = docsBySide.get(side);
                  const uploaded = Boolean(doc);
                  const fileAvailable = doc?.file_available !== false;
                  const reviewStatus = doc?.review_status ?? "PENDING";
                  return (
                    <li
                      key={side}
                      className="flex flex-wrap items-center gap-3 rounded-chip border border-slate-100 px-3 py-2.5"
                    >
                      <div className="flex min-w-[4.5rem] items-center gap-2">
                        {uploaded ? (
                          <IdentityDocumentImage
                            userId={userId}
                            side={side}
                            alt={IDENTITY_DOC_SIDE_LABEL[side]}
                            fileAvailable={fileAvailable}
                            className="h-10 w-10 rounded-md border border-slate-200 object-cover"
                            fallbackClassName="h-10 w-10"
                          />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-[10px] text-slate-400">
                            —
                          </span>
                        )}
                        <span className="text-sm font-semibold">
                          {IDENTITY_DOC_SIDE_LABEL[side]}
                        </span>
                      </div>
                      <span
                        className={`kumbu-badge text-[10px] ${uploaded ? (IDENTITY_DOC_STATUS_CLASS[reviewStatus] ?? IDENTITY_DOC_STATUS_CLASS.PENDING) : "bg-slate-100 text-slate-500"}`}
                      >
                        {uploaded
                          ? (IDENTITY_DOC_STATUS_LABEL[reviewStatus] ?? reviewStatus)
                          : "Não enviado"}
                      </span>
                      {doc?.rejection_reason ? (
                        <span className="text-xs text-rose-700">{doc.rejection_reason}</span>
                      ) : null}
                      {doc?.uploaded_at ? (
                        <span className="ml-auto text-xs text-slate-400">
                          {formatDateTime(doc.uploaded_at)}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
