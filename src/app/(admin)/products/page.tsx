import Link from "next/link";
import { Package, Plus, Star } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { CatalogCategory, CatalogProduct } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; out_of_stock?: string }>;
}) {
  const params = await searchParams;
  const q = (params?.q ?? "").trim();
  const categoryFilter = (params?.category ?? "").trim();
  const onlyOutOfStock = params?.out_of_stock === "1";

  const supabase = await createSupabaseServerClient();
  const [{ data: categories }, productsQ] = await Promise.all([
    supabase.from("catalog_categories").select("*").order("sort_order"),
    (async () => {
      let req = supabase
        .from("catalog_products")
        .select("*")
        .order("sort_order")
        .order("title");
      if (categoryFilter) req = req.eq("category_id", categoryFilter);
      if (onlyOutOfStock) req = req.eq("is_out_of_stock", true);
      if (q) req = req.ilike("title", `%${q}%`);
      return req;
    })(),
  ]);

  const products = (productsQ.data ?? []) as CatalogProduct[];
  const cats = (categories ?? []) as CatalogCategory[];
  const catById = new Map(cats.map((c) => [c.id, c]));

  return (
    <div>
      <PageHeader
        title="Produtos"
        subtitle={`${products.length} produto(s) no catálogo.`}
        actions={
          <Link href="/products/new" className="kumbu-btn-primary">
            <Plus className="h-4 w-4" /> Novo produto
          </Link>
        }
      />

      <form className="kumbu-card mb-4 flex flex-wrap items-end gap-3 p-4">
        <label className="flex-1 min-w-[200px] space-y-1.5">
          <span className="kumbu-label">Pesquisa</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Procurar produto pelo título"
            className="kumbu-input"
          />
        </label>
        <label className="space-y-1.5">
          <span className="kumbu-label">Categoria</span>
          <select name="category" defaultValue={categoryFilter} className="kumbu-input">
            <option value="">Todas</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="out_of_stock"
            value="1"
            defaultChecked={onlyOutOfStock}
            className="h-4 w-4 rounded border-slate-300 text-kumbu-red"
          />
          <span className="text-sm">Apenas esgotados</span>
        </label>
        <button className="kumbu-btn-ghost">Filtrar</button>
      </form>

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Sem produtos"
          description="Cria o primeiro produto para o catálogo Kumbu."
          action={
            <Link href="/products/new" className="kumbu-btn-primary">
              <Plus className="h-4 w-4" /> Criar produto
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => {
            const cat = catById.get(p.category_id);
            const accent = cat?.accent_hex ?? "5C6BC0";
            return (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="kumbu-card overflow-hidden hover:shadow-pop transition-shadow"
              >
                <div
                  className="aspect-[4/3] w-full"
                  style={{
                    background: `linear-gradient(135deg, #${accent}33 0%, #${accent}aa 100%)`,
                  }}
                />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-tight">{p.title}</h3>
                    {p.is_featured && (
                      <span className="kumbu-badge bg-amber-100 text-amber-700">
                        <Star className="h-3 w-3" /> Destaque
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{cat?.name ?? p.category_id}</p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-kumbu-red">
                      {p.price_label}
                    </span>
                    {p.old_price_label && (
                      <span className="text-xs line-through text-slate-400">
                        {p.old_price_label}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px]">
                    <span
                      className={cn(
                        "kumbu-badge",
                        p.is_out_of_stock
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      )}
                    >
                      {p.is_out_of_stock ? "Esgotado" : "Em stock"}
                    </span>
                    <span className="kumbu-badge bg-slate-100 text-slate-600">
                      ★ {p.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
