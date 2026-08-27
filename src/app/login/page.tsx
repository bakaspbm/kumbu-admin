import { ShieldCheck } from "lucide-react";
import { AuthPanel } from "./auth-panel";
import { LoginThemeToggle } from "./login-theme-toggle";

export const metadata = { title: "Entrar — Kumbu Admin" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; expired?: string }>;
}) {
  const params = await searchParams;
  const next = params?.next ?? "/dashboard";
  const expired = params?.expired === "1";

  return (
    <main className="relative min-h-screen overflow-hidden bg-kumbu-gradient">
      <LoginThemeToggle />
      <div className="absolute inset-0 -z-0 opacity-30 [background:radial-gradient(800px_circle_at_20%_20%,white,transparent_60%)] dark:opacity-10" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6 py-10">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-2xl bg-[var(--kumbu-surface)] shadow-pop md:grid-cols-2">
          <div className="hidden flex-col justify-between bg-kumbu-gradient p-10 text-white md:flex">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
              <ShieldCheck className="h-5 w-5" />
              KUMBU · ADMIN
            </div>
            <div>
              <h2 className="text-3xl font-bold leading-tight">Painel Admin</h2>
              <p className="mt-3 max-w-sm text-sm text-white/80">
                Gestão da plataforma Kumbú.
              </p>
            </div>
            <p className="text-xs text-white/60">
              © {new Date().getFullYear()} Kumbú
            </p>
          </div>

          <div className="p-8 sm:p-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-kumbu-ink">Entrar</h1>
              <p className="mt-1 text-sm text-[var(--kumbu-ink-subtle)]">
                Acesso reservado à equipa Kumbú.
              </p>
              {expired ? (
                <p className="mt-2 text-sm text-amber-700">
                  Sessão expirada. Entre novamente.
                </p>
              ) : null}
            </div>
            <AuthPanel next={next} />
          </div>
        </div>
      </div>
    </main>
  );
}
