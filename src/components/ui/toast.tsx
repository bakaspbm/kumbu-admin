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
          "kumbu-alert",
          ok ? "kumbu-alert-success" : "kumbu-alert-error",
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
        <ul className="kumbu-alert kumbu-alert-error flex-col items-start gap-1 text-xs">
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
