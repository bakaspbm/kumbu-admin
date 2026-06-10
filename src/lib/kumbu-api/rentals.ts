import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";

export type RentalItem = {
  id: string;
  product_id: string;
  product_title: string;
  renter_id: string;
  owner_id: string;
  renter_name: string;
  owner_name: string;
  rental_mode: string;
  check_in: string;
  check_out: string;
  nights: number;
  status: string;
  price_snapshot: Record<string, unknown> | null;
  created_at: string;
};

export type RentalDetail = RentalItem & {
  guest_message: string | null;
  conversation_id: string | null;
  updated_at: string;
  renter_email: string | null;
  owner_email: string | null;
};

type Paged<T> = {
  items: T[];
  page: number;
  size: number;
  total: number;
  total_pages: number;
};

export const rentalsApi = {
  pendingCount() {
    return kumbuApiFetch<{ count: number }>(
      "/admin/rentals/pending-count",
      {},
      { withAuth: true },
    );
  },

  list(params?: { status?: string; page?: number; size?: number }) {
    const sp = new URLSearchParams();
    if (params?.status) sp.set("status", params.status);
    if (params?.page != null) sp.set("page", String(params.page));
    if (params?.size != null) sp.set("size", String(params.size));
    const qs = sp.toString();
    return kumbuApiFetch<Paged<RentalItem>>(
      `/admin/rentals${qs ? `?${qs}` : ""}`,
      {},
      { withAuth: true },
    );
  },

  get(id: string) {
    return kumbuApiFetch<RentalDetail>(`/admin/rentals/${id}`, {}, { withAuth: true });
  },
};
