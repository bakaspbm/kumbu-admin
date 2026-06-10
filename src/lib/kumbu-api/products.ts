import { createAdminResource } from "@/lib/kumbu-api/resource";
import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";

const resource = createAdminResource("/admin/products");

export const productsApi = {
  list: resource.list,
  get: resource.get,
  create: resource.create,
  update: resource.update,
  patch: resource.patch,
  remove: resource.remove,
  toggleFlag(id: string, input: { field: "is_featured" | "is_out_of_stock"; value: boolean }) {
    const path = input.field === "is_featured" ? "featured" : "out-of-stock";
    return kumbuApiFetch<void>(
      `/admin/products/${id}/${path}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: input.value }),
      },
      { withAuth: true },
    );
  },
};
