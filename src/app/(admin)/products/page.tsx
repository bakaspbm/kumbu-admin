import Link from "next/link";
import { Package, Star, User } from "lucide-react";
import { adminList } from "@/lib/admin-data";
import { getOptionalAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCover } from "@/components/products/product-cover";
import { cn } from "@/lib/utils";
import type { CatalogCategory, CatalogProduct } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    out_of_stock?: string;
    show_deleted?: string;
    seller?: string;
  }>;
}) {
  const params = await searchParams;
  const q = (params?.q ?? "").trim();
  const categoryFilter = (params?.category ?? "").trim();
  const sellerFilter = (params?.seller ?? "").trim();
  const onlyOutOfStock = params?.out_of_stock === "1";
  const admin = await getOptionalAdmin();
  const showDeleted =
    admin?.role === "super_admin" && params?.show_deleted === "1";
  const [cats, products, sellers] = await Promise.all([
      adminList<CatalogCategory>("categories"),
      adminList<CatalogProduct>("products", {
        q: q || undefined,
        category_id: categoryFilter || undefined,
        seller_id: sellerFilter || undefined,
        out_of_stock: onlyOutOfStock || undefined,
        deleted: showDeleted || undefined,
      }),
      adminList<{ id: string; display_name: string | null; email: string | null }>("users"),
    ]);
    const catById = new Map(cats.map((c) => [c.id, c]));
    const sellerById = new Map<string, { display_name: string | null; email: string | null }>();
    for (const s of sellers) sellerById.set(s.id, s);
    return (
      <div>
        <PageHeader
          title="Produtos dos utilizadores"
          subtitle={showDeleted ? `${products.length} anúncio(s) removido(s). Publicados na app pelos utilizadores.` : `${products.length} anúncio(s) activos. O admin modera; a criação é na app.`}
          actions={<Link href="/analytics" className="kumbu-btn-ghost text-sm">Rankings (vistos / vendidos) →</Link>}
        />
        <form className="kumbu-card mb-4 flex flex-wrap items-end gap-3 p-4">
          <label className="flex-1 min-w-[200px] space-y-1.5"><span className="kumbu-label">Pesquisa</span><input type="search" name="q" defaultValue={q} placeholder="Procurar produto pelo título" className="kumbu-input" /></label>
          <label className="space-y-1.5"><span className="kumbu-label">Categoria</span><select name="category" defaultValue={categoryFilter} className="kumbu-input"><option value="">Todas</option>{cats.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="out_of_stock" value="1" defaultChecked={onlyOutOfStock} className="h-4 w-4 rounded border-slate-300 text-kumbu-red" /><span className="text-sm">Apenas esgotados</span></label>
          {admin?.role === "super_admin" && (<label className="inline-flex items-center gap-2"><input type="checkbox" name="show_deleted" value="1" defaultChecked={showDeleted} className="h-4 w-4 rounded border-slate-300 text-kumbu-red" /><span className="text-sm">Apenas removidos</span></label>)}
          <button className="kumbu-btn-ghost">Filtrar</button>
        </form>
        {products.length === 0 ? (<EmptyState icon={Package} title="Sem produtos publicados" description="Os utilizadores publicam anúncios na app móvel. Aparecem aqui para moderação." />) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => {
              const cat = catById.get(p.category_id);
              const accent = cat?.accent_hex ?? "5C6BC0";
              return (
                <Link key={p.id} href={`/products/${p.id}`} className="kumbu-card overflow-hidden hover:shadow-pop transition-shadow">
                  <ProductCover product={p} accentHex={accent} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2"><h3 className="font-semibold leading-tight">{p.title}</h3>{p.is_featured && (<span className="kumbu-badge bg-amber-100 text-amber-700"><Star className="h-3 w-3" /> Destaque</span>)}</div>
                    <p className="mt-1 text-xs text-slate-500">{cat?.name ?? p.category_id}</p>
                    {p.seller_id && (<p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><User className="h-3 w-3 shrink-0" /><span className="truncate">{sellerById.get(p.seller_id)?.display_name || sellerById.get(p.seller_id)?.email || p.seller_id.slice(0, 8)}</span></p>)}
                    <div className="mt-3 flex items-baseline gap-2"><span className="text-lg font-bold text-kumbu-red">{p.price_label}</span>{p.old_price_label && (<span className="text-xs line-through text-slate-400">{p.old_price_label}</span>)}</div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">{p.deleted_at && (<span className="kumbu-badge bg-rose-100 text-rose-800">Removido</span>)}<span className={cn("kumbu-badge", p.is_out_of_stock ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700")}>{p.is_out_of_stock ? "Esgotado" : "Em stock"}</span><span className="kumbu-badge bg-slate-100 text-slate-600">★ {(p.rating ?? 0).toFixed(1)}</span></div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );

}