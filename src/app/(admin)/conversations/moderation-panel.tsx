"use client";

import { useActionState } from "react";
import { useRouterRefreshOnActions } from "@/hooks/use-router-refresh-on-actions";
import type { MarketplaceConversation } from "@/lib/types";
import {
  blockConversationAction,
  unblockConversationAction,
  type ActionState,
} from "./actions";

export function ConversationModerationPanel({
  conversation,
}: {
  conversation: MarketplaceConversation;
}) {
  const [blockState, blockAction] = useActionState<ActionState, FormData>(
    blockConversationAction,
    null
  );
  const [unblockState, unblockAction] = useActionState<ActionState, FormData>(
    unblockConversationAction,
    null
  );

  useRouterRefreshOnActions(blockState, unblockState);
  const feedback = blockState?.message ?? unblockState?.message;
  const ok = blockState?.ok ?? unblockState?.ok;

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <p className="kumbu-label mb-2">Moderação</p>
      {conversation.is_blocked ? (
        <div className="space-y-2">
          <p className="text-sm text-rose-700">
            Bloqueada
            {conversation.blocked_reason ? `: ${conversation.blocked_reason}` : ""}
          </p>
          <form action={unblockAction}>
            <input type="hidden" name="id" value={conversation.id} />
            <button type="submit" className="kumbu-btn-secondary w-full">
              Desbloquear conversa
            </button>
          </form>
        </div>
      ) : (
        <form action={blockAction} className="space-y-2">
          <input type="hidden" name="id" value={conversation.id} />
          <label className="block">
            <span className="kumbu-label">Motivo do bloqueio</span>
            <input
              name="reason"
              className="kumbu-input mt-1 w-full"
              placeholder="Ex.: conteúdo inapropriado"
            />
          </label>
          <button type="submit" className="kumbu-btn-primary w-full bg-rose-600 hover:bg-rose-700">
            Bloquear conversa
          </button>
        </form>
      )}
      {feedback && (
        <p
          className={`mt-2 text-sm ${ok ? "text-emerald-600" : "text-rose-600"}`}
          role="status"
        >
          {feedback}
        </p>
      )}
    </div>
  );
}
