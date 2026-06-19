export const IDENTITY_STATUS_LABEL: Record<string, string> = {
  NOT_SUBMITTED: "Não submetido",
  INCOMPLETE: "Documentos incompletos",
  PENDING: "KYC pendente",
  APPROVED: "KYC aprovado",
  REJECTED: "KYC rejeitado",
};

export const IDENTITY_STATUS_CLASS: Record<string, string> = {
  NOT_SUBMITTED: "bg-slate-100 text-slate-700",
  INCOMPLETE: "bg-sky-100 text-sky-800",
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
};

export const IDENTITY_DOC_SIDE_LABEL: Record<string, string> = {
  front: "Frente",
  back: "Verso",
  selfie: "Selfie",
};

export const IDENTITY_DOC_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
};

export const IDENTITY_DOC_STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
};
