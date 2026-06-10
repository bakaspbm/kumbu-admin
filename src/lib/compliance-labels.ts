export const REPORT_REASON_LABELS: Record<string, string> = {
  spam: "Spam",
  fraud: "Fraude / burla",
  illegal: "Conteúdo ilegal",
  harassment: "Assédio",
  misleading: "Informação enganosa",
  ip: "Direitos de autor",
  other: "Outro",
};

export const REPORT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  reviewing: "Em análise",
  resolved: "Resolvida",
  dismissed: "Arquivada",
};

export const REPORT_TARGET_LABELS: Record<string, string> = {
  listing: "Anúncio",
  user: "Utilizador",
  conversation: "Conversa",
  message: "Mensagem",
};

export const CONSENT_TYPE_LABELS: Record<string, string> = {
  terms_privacy_v1: "Termos e privacidade",
  publish_rules_v1: "Regras de publicação",
};

export function reportStatusClass(status: string): string {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-800";
    case "reviewing":
      return "bg-sky-50 text-sky-800";
    case "resolved":
      return "bg-emerald-50 text-emerald-800";
    case "dismissed":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}
