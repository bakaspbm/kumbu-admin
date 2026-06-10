import { createAdminResource } from "@/lib/kumbu-api/resource";

const resource = createAdminResource("/admin/orders");

export const ordersApi = {
  list: resource.list,
  get: resource.get,
  create: resource.create,
  update: resource.update,
  patch: resource.patch,
  remove: resource.remove,
  updateStatus(id: string, input: { status: string; show_track?: boolean }) {
    return resource.action<void>(id, "status", input, "PATCH");
  },
};

