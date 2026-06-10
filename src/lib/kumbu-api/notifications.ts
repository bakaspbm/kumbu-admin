import { createAdminResource } from "@/lib/kumbu-api/resource";

const resource = createAdminResource("/admin/notifications");

export const notificationsApi = {
  list: resource.list,
  get: resource.get,
  create: resource.create,
  update: resource.update,
  patch: resource.patch,
  remove: resource.remove,
  markRead(id: string) {
    return resource.action<void>(id, "read", {}, "POST");
  },
  hide(id: string) {
    return resource.action<void>(id, "hide", {}, "POST");
  },
  unhide(id: string) {
    return resource.action<void>(id, "unhide", {}, "POST");
  },
};

