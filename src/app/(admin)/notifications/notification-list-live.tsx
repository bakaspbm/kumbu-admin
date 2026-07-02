"use client";

import { useEffect, useMemo, useState } from "react";
import type { UserNotification } from "@/lib/types";
import { NotificationList } from "./notification-list";

function normalizeListResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.content)) return obj.content as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
  }
  return [];
}

async function fetchNotifications(): Promise<UserNotification[]> {
  const response = await fetch("/api/kumbu/admin/notifications?limit=100", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return [];
  const payload = (await response.json()) as unknown;
  return normalizeListResponse<UserNotification>(payload);
}

export function NotificationListLive({
  initialItems,
  showHidden,
  pollMs = 5_000,
}: {
  initialItems: UserNotification[];
  showHidden: boolean;
  pollMs?: number;
}) {
  const [items, setItems] = useState<UserNotification[]>(initialItems);

  useEffect(() => {
    let alive = true;

    async function tick() {
      const next = await fetchNotifications();
      if (!alive) return;
      if (next.length > 0) setItems(next);
    }

    const id = window.setInterval(() => void tick(), pollMs);
    void tick();
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [pollMs]);

  const filtered = useMemo(() => {
    return showHidden ? items : items.filter((n) => !n.hidden_at);
  }, [items, showHidden]);

  return <NotificationList items={filtered} />;
}

