import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminGet } from "@/lib/admin-data";
import { PageHeader } from "@/components/ui/page-header";
import { formatDateTime } from "@/lib/utils";
import type { MarketplaceConversation } from "@/lib/types";
import { ConversationModerationPanel } from "../moderation-panel";
import { MessageModerationButton } from "../message-actions";

export const dynamic = "force-dynamic";

type UserSummary = {
  id: string;
  email: string | null;
  display_name: string | null;
};

function userLabel(user: UserSummary | null, fallbackId: string) {
  return user?.display_name ?? user?.email ?? fallbackId;
}

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversation = await adminGet<MarketplaceConversation>("conversations", id);
  if (!conversation) notFound();

  const msgs = conversation.messages ?? [];
  const [buyer, seller, product] = await Promise.all([
    adminGet<UserSummary>("users", conversation.buyer_id),
    adminGet<UserSummary>("users", conversation.seller_id),
    conversation.product_id
      ? adminGet<{ id: string; title: string }>("products", conversation.product_id)
      : Promise.resolve(null),
  ]);

  const senderMap = new Map<string, string>();
  if (buyer) senderMap.set(buyer.id, userLabel(buyer, buyer.id));
  if (seller) senderMap.set(seller.id, userLabel(seller, seller.id));

  const buyerLabel = userLabel(buyer, conversation.buyer_id);
  const sellerLabel = userLabel(seller, conversation.seller_id);

  return (
    <div className="space-y-6">
      <Link
        href="/conversations"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-kumbu-red"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar às conversas
      </Link>
      <PageHeader
        title="Thread de mensagens"
        subtitle={`Comprador: ${buyerLabel} · Vendedor: ${sellerLabel}`}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="kumbu-card space-y-3 p-5 lg:col-span-1">
          <p className="kumbu-label">Detalhes</p>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-slate-500">Anúncio</dt>
              <dd className="font-medium">
                {conversation.product_id ? (
                  <Link
                    href={`/products/${conversation.product_id}`}
                    className="text-kumbu-red hover:underline"
                  >
                    {product?.title ?? conversation.product_id}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Comprador</dt>
              <dd>
                <Link
                  href={`/users/${conversation.buyer_id}`}
                  className="text-kumbu-red hover:underline"
                >
                  {buyerLabel}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Vendedor</dt>
              <dd>
                <Link
                  href={`/users/${conversation.seller_id}`}
                  className="text-kumbu-red hover:underline"
                >
                  {sellerLabel}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Criada</dt>
              <dd>{formatDateTime(conversation.created_at)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Última actividade</dt>
              <dd>{formatDateTime(conversation.updated_at)}</dd>
            </div>
          </dl>
          <ConversationModerationPanel conversation={conversation} />
        </div>
        <div className="kumbu-card p-5 lg:col-span-2">
          <p className="kumbu-label mb-4">Mensagens ({msgs.length})</p>
          {msgs.length === 0 ? (
            <p className="text-sm text-slate-500">Ainda não há mensagens nesta conversa.</p>
          ) : (
            <ul className="space-y-3">
              {msgs.map((msg) => {
                const isBuyer = msg.sender_id === conversation.buyer_id;
                const hidden = Boolean(msg.hidden_at);
                return (
                  <li
                    key={msg.id}
                    className={`rounded-chip border px-4 py-3 ${hidden ? "border-amber-200 bg-amber-50/50 opacity-75" : "border-slate-100 bg-slate-50/50"}`}
                  >
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-700">
                        {senderMap.get(msg.sender_id) ?? msg.sender_id.slice(0, 8)}
                        <span className="ml-2 font-normal text-slate-400">
                          {isBuyer ? "comprador" : "vendedor"}
                        </span>
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDateTime(msg.created_at)}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-slate-800">{msg.body}</p>
                    {hidden && (
                      <p className="mt-1 text-xs text-amber-700">
                        Oculta na app (admin) · {formatDateTime(msg.hidden_at!)}
                      </p>
                    )}
                    <div className="mt-2">
                      <MessageModerationButton
                        messageId={msg.id}
                        conversationId={id}
                        hidden={hidden}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
