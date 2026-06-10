import { AtSign, HelpCircle, Mail, Phone, Smartphone } from "lucide-react";
import type { SignupAuthMethod } from "@/lib/types";
import { cn } from "@/lib/utils";

const LABELS: Record<SignupAuthMethod, string> = {
  email: "Email e palavra-passe",
  google: "Google",
  facebook: "Facebook",
  phone: "SMS / telefone",
  apple: "Apple",
  anonymous: "Anónimo",
  unknown: "Desconhecido",
};

export function signupAuthMethodLabel(
  method: SignupAuthMethod | string | null | undefined,
): string {
  if (method && method in LABELS) return LABELS[method as SignupAuthMethod];
  return LABELS.unknown;
}

function normalize(method: SignupAuthMethod | string | null | undefined): SignupAuthMethod {
  if (method && method in LABELS) return method as SignupAuthMethod;
  return "unknown";
}

export function SignupAuthMethodBadge({
  method,
  className,
}: {
  method: SignupAuthMethod | string | null | undefined;
  className?: string;
}) {
  const normalized = normalize(method);
  const Icon =
    normalized === "email"
      ? Mail
      : normalized === "phone"
        ? Phone
        : normalized === "google" || normalized === "facebook" || normalized === "apple"
          ? AtSign
          : normalized === "anonymous"
            ? Smartphone
            : HelpCircle;

  const tone =
    normalized === "email"
      ? "bg-amber-100 text-amber-900"
      : normalized === "google"
        ? "bg-red-50 text-red-800"
        : normalized === "facebook"
          ? "bg-blue-100 text-blue-900"
          : normalized === "phone"
            ? "bg-emerald-100 text-emerald-900"
            : normalized === "apple"
              ? "bg-slate-800 text-white"
              : "bg-slate-100 text-slate-600";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        tone,
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden />
      {LABELS[normalized]}
    </span>
  );
}
