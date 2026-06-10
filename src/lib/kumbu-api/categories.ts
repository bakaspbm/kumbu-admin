import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";
import { createAdminResource } from "@/lib/kumbu-api/resource";

const categories = createAdminResource("/admin/catalog/categories");

export const categoriesApi = {
  list: categories.list,
  get: categories.get,
  create: categories.create,
  update: categories.update,
  patch: categories.patch,
  remove: categories.remove,
  listSubcategories(categoryId: string) {
    return kumbuApiFetch<unknown[]>(
      `/admin/catalog/categories/${encodeURIComponent(categoryId)}/subcategories`,
      { method: "GET" },
      { withAuth: true },
    );
  },
  upsertSubcategory(
    categoryId: string,
    input: Record<string, unknown>,
    isEdit = false,
  ) {
    const base = `/admin/catalog/categories/${encodeURIComponent(categoryId)}/subcategories`;
    if (isEdit && input.id) {
      return kumbuApiFetch<void>(
        `${base}/${encodeURIComponent(String(input.id))}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
        { withAuth: true },
      );
    }
    return kumbuApiFetch<void>(base, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }, { withAuth: true });
  },
  removeSubcategory(categoryId: string, subcategoryId: string) {
    return kumbuApiFetch<void>(
      `/admin/catalog/categories/${encodeURIComponent(categoryId)}/subcategories/${encodeURIComponent(subcategoryId)}`,
      { method: "DELETE" },
      { withAuth: true },
    );
  },
};
