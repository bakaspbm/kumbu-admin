import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const LABELS: Record<OrderStatus, string> = {
  processing: "Em processamento",
  shipping: "Em trânsito",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const STYLES: Record<OrderStatus, string> = {
  processing: "bg-amber-100 text-amber-800",
  shipping: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-700",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("kumbu-badge", STYLES[status])}>{LABELS[status]}</span>
  );
}
