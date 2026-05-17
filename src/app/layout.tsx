import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kumbu Admin",
  description: "Painel Super Admin do Kumbú",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#C62828",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body
        className="min-h-screen bg-kumbu-bg text-kumbu-ink antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
