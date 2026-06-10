import { createAdminResource } from "@/lib/kumbu-api/resource";

const resource = createAdminResource("/admin/conversations");

export const conversationsApi = {
  list: resource.list,
  get: resource.get,
  create: resource.create,
  update: resource.update,
  patch: resource.patch,
  remove: resource.remove,
  block(id: string, input: { reason?: string }) {
    return resource.action<void>(id, "block", input, "POST");
  },
  unblock(id: string) {
    return resource.action<void>(id, "unblock", {}, "POST");
  },
};

