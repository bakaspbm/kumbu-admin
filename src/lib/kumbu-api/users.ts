import { createAdminResource } from "@/lib/kumbu-api/resource";

const resource = createAdminResource("/admin/users");

export const usersApi = {
  list: resource.list,
  get: resource.get,
  create: resource.create,
  update: resource.update,
  patch: resource.patch,
  remove: resource.remove,
  ban(id: string, input: { reason?: string; until?: string | null } = {}) {
    return resource.action<void>(id, "ban", input, "POST");
  },
  unban(id: string) {
    return resource.action<void>(id, "unban", {}, "POST");
  },
  restore(id: string) {
    return resource.action<void>(id, "restore", {}, "POST");
  },
};

