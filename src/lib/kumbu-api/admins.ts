import { createAdminResource } from "@/lib/kumbu-api/resource";

const resource = createAdminResource("/admin/system/admins");

export const adminsApi = {
  list: resource.list,
  get: resource.get,
  create: resource.create,
  update: resource.update,
  patch: resource.patch,
  remove: resource.remove,
  invite(input: { email: string; password: string; role: string }) {
    return resource.create<void>(input);
  },
};

