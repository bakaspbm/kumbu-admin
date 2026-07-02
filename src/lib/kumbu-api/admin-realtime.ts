"use client";

import { Client, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { ensureAdminBrowserAccessToken } from "@/lib/kumbu-api/admin-browser-session";
import { getAdminWsEndpoint } from "@/lib/kumbu-api/ws-url";

type SupportTopicListener = (payload: unknown) => void;

let client: Client | null = null;
let connectGeneration = 0;
let supportSubs = new Map<string, StompSubscription>();
let supportListeners = new Map<string, Set<SupportTopicListener>>();

function ensureClient(): Client | null {
  const endpoint = getAdminWsEndpoint();
  if (!endpoint) return null;
  if (client?.active) return client;

  if (client) {
    void client.deactivate();
    client = null;
    supportSubs = new Map();
  }

  const generation = ++connectGeneration;
  client = new Client({
    reconnectDelay: 5_000,
    heartbeatIncoming: 20_000,
    heartbeatOutgoing: 20_000,
    webSocketFactory: () => new SockJS(endpoint),
    beforeConnect: async () => {
      const token = await ensureAdminBrowserAccessToken();
      if (!token) throw new Error("Sessão expirada");
      client!.connectHeaders = { Authorization: `Bearer ${token}` };
    },
    onConnect: () => {
      if (generation !== connectGeneration) return;
      wireSupportSubscriptions();
    },
    onWebSocketClose: () => {
      // subs vão ser re-ligadas em reconnect
    },
  });

  void client.activate();
  return client;
}

function wireSupportSubscriptions() {
  if (!client?.connected) return;
  for (const [conversationId, listeners] of supportListeners) {
    if (listeners.size === 0 || supportSubs.has(conversationId)) continue;
    supportSubs.set(
      conversationId,
      client.subscribe(`/topic/chat/${conversationId}`, (message) => {
        let parsed: unknown = null;
        try {
          parsed = JSON.parse(message.body);
        } catch {
          parsed = message.body;
        }
        const set = supportListeners.get(conversationId);
        if (!set) return;
        for (const listener of set) listener(parsed);
      }),
    );
  }
}

export function subscribeSupportConversationTopic(
  conversationId: string,
  listener: SupportTopicListener,
): () => void {
  const id = conversationId.trim();
  if (!id) return () => {};

  if (!supportListeners.has(id)) supportListeners.set(id, new Set());
  supportListeners.get(id)!.add(listener);

  ensureClient();
  wireSupportSubscriptions();

  return () => {
    const set = supportListeners.get(id);
    if (set) {
      set.delete(listener);
      if (set.size === 0) {
        supportListeners.delete(id);
        const sub = supportSubs.get(id);
        if (sub) sub.unsubscribe();
        supportSubs.delete(id);
      }
    }
  };
}

