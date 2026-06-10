import { createAdminResource } from "@/lib/kumbu-api/resource";

const resource = createAdminResource("/admin/app/support-settings");

export const supportApi = {
  list: resource.list,
  get: resource.get,
  create: resource.create,
  update: resource.update,
  patch: resource.patch,
  remove: resource.remove,
};

