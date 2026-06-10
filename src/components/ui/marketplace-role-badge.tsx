import { cn } from "@/lib/utils";

export function MarketplaceRoleBadge({
  purchases,
  listings,
}: {
  purchases: number;
  listings: number;
}) {
  const isBuyer = purchases > 0;
  const isSeller = listings > 0;

  if (!isBuyer && !isSeller) {
    return (
      <span className="kumbu-badge bg-slate-100 text-slate-600">Sem actividade</span>
    );
  }

  if (isBuyer && isSeller) {
    return (
      <span className="kumbu-badge bg-indigo-100 text-indigo-800">
        Comprador e vendedor
      </span>
    );
  }

  if (isSeller) {
    return (
      <span className={cn("kumbu-badge bg-emerald-100 text-emerald-800")}>
        Vendedor
      </span>
    );
  }

  return (
    <span className="kumbu-badge bg-sky-100 text-sky-800">Comprador</span>
  );
}
