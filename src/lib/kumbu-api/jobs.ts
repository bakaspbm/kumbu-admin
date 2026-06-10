import { kumbuApiFetch } from "@/lib/kumbu-api/server-client";

export type JobListingItem = {
  id: string;
  title: string;
  price_label: string | null;
  category_id: string;
  job_listing_status: string;
  job_meta: Record<string, unknown> | null;
  seller_id: string;
  seller_name: string | null;
  seller_email: string | null;
  created_at: string;
  deleted_at: string | null;
};

export type JobApplicationItem = {
  id: string;
  job_id: string;
  job_title: string;
  applicant_id: string;
  employer_id: string;
  status: string;
  created_at: string;
  applicant_name: string;
  employer_name: string;
  cv_title: string | null;
};

export type JobApplicationDetail = JobApplicationItem & {
  cover_message: string | null;
  conversation_id: string | null;
  cv_id: string | null;
  cv_snapshot: Record<string, unknown> | null;
  cv_viewed_at: string | null;
  updated_at: string;
  applicant_email: string | null;
  employer_email: string | null;
};

type Paged<T> = {
  items: T[];
  page: number;
  size: number;
  total: number;
  total_pages: number;
};

export const jobsApi = {
  pendingApplicationsCount() {
    return kumbuApiFetch<{ count: number }>(
      "/admin/jobs/applications/pending-count",
      {},
      { withAuth: true },
    );
  },

  listListings(params?: { status?: string; q?: string; page?: number; size?: number }) {
    const sp = new URLSearchParams();
    if (params?.status) sp.set("status", params.status);
    if (params?.q) sp.set("q", params.q);
    if (params?.page != null) sp.set("page", String(params.page));
    if (params?.size != null) sp.set("size", String(params.size));
    const qs = sp.toString();
    return kumbuApiFetch<Paged<JobListingItem>>(
      `/admin/jobs/listings${qs ? `?${qs}` : ""}`,
      {},
      { withAuth: true },
    );
  },

  updateListingStatus(id: string, status: "active" | "filled_hidden") {
    return kumbuApiFetch<JobListingItem>(
      `/admin/jobs/listings/${id}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
      { withAuth: true },
    );
  },

  deleteListing(id: string) {
    return kumbuApiFetch<void>(
      `/admin/jobs/listings/${id}`,
      { method: "DELETE" },
      { withAuth: true },
    );
  },

  listApplications(params?: { status?: string; page?: number; size?: number }) {
    const sp = new URLSearchParams();
    if (params?.status) sp.set("status", params.status);
    if (params?.page != null) sp.set("page", String(params.page));
    if (params?.size != null) sp.set("size", String(params.size));
    const qs = sp.toString();
    return kumbuApiFetch<Paged<JobApplicationItem>>(
      `/admin/jobs/applications${qs ? `?${qs}` : ""}`,
      {},
      { withAuth: true },
    );
  },

  getApplication(id: string) {
    return kumbuApiFetch<JobApplicationDetail>(
      `/admin/jobs/applications/${id}`,
      {},
      { withAuth: true },
    );
  },
};
