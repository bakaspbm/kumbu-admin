"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type FormFeedback = {
  ok?: boolean;
  message?: string;
} | null;

export function FeedbackBanner({ feedback }: { feedback: FormFeedback }) {
  if (!feedback?.message) return null;
  const ok = feedback.ok !== false;
  return (
    <div
      className={cn(
        "mb-4 flex items-center gap-2 rounded-chip border px-3 py-2 text-sm",
        ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-rose-200 bg-rose-50 text-rose-700"
      )}
    >
      {ok ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <XCircle className="h-4 w-4" />
      )}
      <span>{feedback.message}</span>
    </div>
  );
}
