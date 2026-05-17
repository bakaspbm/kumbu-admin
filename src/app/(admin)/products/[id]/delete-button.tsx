"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";
import { deleteProductAction, type ActionState } from "../actions";
import { FeedbackBanner } from "@/components/ui/toast";

function Btn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="kumbu-btn-danger" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      Eliminar
    </button>
  );
}

export function DeleteProductButton({ id }: { id: string }) {
  const [state, action] = useActionState<ActionState, FormData>(
    deleteProductAction,
    null
  );
  return (
    <div>
      <FeedbackBanner feedback={state} />
      <form
        action={action}
        onSubmit={(e) => {
          if (!confirm("Eliminar este produto definitivamente?"))
            e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <Btn />
      </form>
    </div>
  );
}
