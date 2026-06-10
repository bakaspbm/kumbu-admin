import type { ContentReportTargetType } from "@/lib/types";

export function reportTargetHref(
  targetType: ContentReportTargetType,
  targetId: string,
  conversationId?: string | null,
): string | null {
  switch (targetType) {
    case "listing":
      return `/products/${targetId}`;
    case "user":
      return `/users/${targetId}`;
    case "conversation":
      return `/conversations/${targetId}`;
    case "message":
      return conversationId ? `/conversations/${conversationId}` : null;
    default:
      return null;
  }
}
