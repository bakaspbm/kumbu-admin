import { createAdminResource } from "@/lib/kumbu-api/resource";

const resource = createAdminResource("/admin/app/legal-documents");

export const legalApi = {
  list: resource.list,
  get: resource.get,
  create: resource.create,
  update: resource.update,
  patch: resource.patch,
  remove: resource.remove,
  seedDefaults() {
    return resource.create<void>({ action: "seed-defaults" });
  },
};

