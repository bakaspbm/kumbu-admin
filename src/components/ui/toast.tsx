"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/action-state";

export type FormFeedback = ActionState;

export function FeedbackBanner({ feedback }: { feedback: FormFeedback }) {
  if (!feedback?.message) return null;
  const ok = feedback.ok !== false;
  const unmappedFields =
    feedback.fields &&
    Object.entries(feedback.fields).filter(([key]) => !key.startsWith("_"));
  return (
    <div className="mb-4 space-y-2">
      <div
        className={cn(
          "flex items-center gap-2 rounded-chip border px-3 py-2 text-sm",
          ok
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-rose-200 bg-rose-50 text-rose-700",
        )}
      >
        {ok ? (
          <CheckCircle2 className="h-4 w-4 shrink-0" />
        ) : (
          <XCircle className="h-4 w-4 shrink-0" />
        )}
        <span>{feedback.message}</span>
      </div>
      {!ok && unmappedFields && unmappedFields.length > 0 ? (
        <ul className="rounded-chip border border-rose-100 bg-rose-50/60 px-3 py-2 text-xs text-rose-700">
          {unmappedFields.map(([field, msg]) => (
            <li key={field}>
              <span className="font-medium">{field}:</span> {msg}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
