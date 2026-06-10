"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";
import { useRouterRefreshOnActions } from "@/hooks/use-router-refresh-on-actions";
import {
  deleteProductReviewAction,
  type ActionState,
} from "@/app/(admin)/reviews/actions";
import { FeedbackBanner } from "@/components/ui/toast";

function Btn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="kumbu-btn-danger text-xs" disabled={pending}>
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      Eliminar
    </button>
  );
}

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(
    deleteProductReviewAction,
    null,
  );
  useRouterRefreshOnActions(state);

  return (
    <div className="shrink-0">
      <FeedbackBanner feedback={state} />
      <form
        action={action}
        onSubmit={(e) => {
          if (!confirm("Eliminar esta avaliação? A média do anúncio será recalculada.")) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={reviewId} />
        <Btn />
      </form>
    </div>
  );
}
