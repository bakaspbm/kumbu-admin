import { createAdminResource } from "@/lib/kumbu-api/resource";

const resource = createAdminResource("/admin/reports");

export const reportsApi = {
  list: resource.list,
  get: resource.get,
  create: resource.create,
  update: resource.update,
  patch: resource.patch,
  remove: resource.remove,
  setStatus(id: string, input: { status: string; admin_notes?: string | null }) {
    return resource.action<void>(id, "status", input, "PATCH");
  },
};

