import { ShieldCheck } from "lucide-react";
import { AuthPanel } from "./auth-panel";
import { LoginThemeToggle } from "./login-theme-toggle";
export const metadata = { title: "Entrar — Kumbu Admin" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params?.next ?? "/dashboard";

  return (
    <main className="relative min-h-screen overflow-hidden bg-kumbu-gradient">
      <LoginThemeToggle />
      <div className="absolute inset-0 -z-0 opacity-30 [background:radial-gradient(800px_circle_at_20%_20%,white,transparent_60%)] dark:opacity-10" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-10">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-2xl bg-[var(--kumbu-surface)] shadow-pop md:grid-cols-2">
          <div className="hidden md:flex flex-col justify-between bg-kumbu-gradient p-10 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide">
              <ShieldCheck className="h-5 w-5" />
              KUMBU · CONSOLE
            </div>
            <div>
              <h2 className="text-3xl font-bold leading-tight">
                Painel Super Admin
              </h2>
              <p className="mt-3 max-w-sm text-sm text-white/80">
                Controlo total sobre utilizadores, pedidos, catálogo, marketing
                e operações da plataforma Kumbú.
              </p>
            </div>
            <p className="text-xs text-white/60">
              © {new Date().getFullYear()} Kumbú. Acesso restrito.
            </p>
          </div>

          <div className="p-8 sm:p-10">
            <div className="mb-8">
              <p className="kumbu-label">Acesso Privilegiado</p>
              <h1 className="mt-1 text-2xl font-bold text-kumbu-ink">
                Entrar no Kumbú Admin
              </h1>
              <p className="mt-1 text-sm text-[var(--kumbu-ink-subtle)]">
                Apenas contas marcadas como administradoras conseguem entrar.
              </p>
            </div>
            <AuthPanel next={next} />
          </div>
        </div>
      </div>
    </main>
  );
}
