export const env = {
  kumbuApiUrl:
    process.env.KUMBU_API_URL ??
    process.env.NEXT_PUBLIC_KUMBU_API_URL ??
    "http://localhost:8080/api/v1",
  superAdminEmail: process.env.SUPER_ADMIN_EMAIL?.trim() || "admin@kumbu.app",
} as const;
