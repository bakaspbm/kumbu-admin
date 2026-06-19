import { withSentryConfig } from "@sentry/nextjs";

function apiImageRemotePatterns() {
  const patterns = [
    { protocol: "http", hostname: "localhost", pathname: "/files/**" },
    { protocol: "http", hostname: "127.0.0.1", pathname: "/files/**" },
  ];
  const apiUrl = process.env.NEXT_PUBLIC_KUMBU_API_URL?.trim();
  if (apiUrl) {
    try {
      const parsed = new URL(apiUrl);
      patterns.push({
        protocol: parsed.protocol.replace(":", ""),
        hostname: parsed.hostname,
        pathname: "/files/**",
      });
    } catch {
      /* ignore */
    }
  }
  return patterns;
}

function buildContentSecurityPolicy() {
  const isDev = process.env.NODE_ENV === "development";
  const apiUrl = process.env.NEXT_PUBLIC_KUMBU_API_URL?.trim();
  let apiOrigin = "";
  if (apiUrl) {
    try {
      apiOrigin = new URL(apiUrl).origin;
    } catch {
      /* ignore */
    }
  }
  const connectSrc = [
    "'self'",
    apiOrigin,
    "https://*.sentry.io",
    "https://*.ingest.sentry.io",
    isDev ? "http://127.0.0.1:8080" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: { ignoreBuildErrors: false },
  images: {
    remotePatterns: apiImageRemotePatterns(),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: buildContentSecurityPolicy(),
          },
        ],
      },
    ];
  },
};

const hasSentryUpload = Boolean(
  process.env.SENTRY_AUTH_TOKEN &&
    process.env.SENTRY_ORG &&
    process.env.SENTRY_PROJECT,
);

const sentryEnabled = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN?.trim());

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !hasSentryUpload,
  widenClientFileUpload: true,
  disableLogger: true,
  sourcemaps: {
    disable: !hasSentryUpload,
  },
  tunnelRoute: sentryEnabled ? "/monitoring" : undefined,
});
