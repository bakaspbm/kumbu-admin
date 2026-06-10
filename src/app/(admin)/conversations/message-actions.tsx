"use client";

import { useTransition } from "react";
import { hideMessageAction, unhideMessageAction } from "./actions";

export function MessageModerationButton({
  messageId,
  conversationId,
  hidden,
}: {
  messageId: string;
  conversationId: string;
  hidden: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        startTransition(async () => {
          if (hidden) await unhideMessageAction(fd);
          else await hideMessageAction(fd);
        });
      }}
    >
      <input type="hidden" name="id" value={messageId} />
      <input type="hidden" name="conversation_id" value={conversationId} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-semibold text-slate-500 hover:text-kumbu-red disabled:opacity-50"
      >
        {pending ? "…" : hidden ? "Restaurar na app" : "Ocultar na app"}
      </button>
    </form>
  );
}
