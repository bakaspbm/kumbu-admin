import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { logoutAction } from "../login/actions";

export const metadata = { title: "Sem permissões — Kumbu Admin" };

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-kumbu-gradient-soft">
      <div className="kumbu-card max-w-md w-full p-8 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-kumbu-red mx-auto">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-xl font-bold">Sem permissões de administrador</h1>
        <p className="mt-2 text-sm text-slate-500">
          A sua conta não está registada como administradora. Peça a um super
          admin para adicionar o seu utilizador na tabela{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5">admin_users</code>.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <form action={logoutAction}>
            <button className="kumbu-btn-primary">Sair</button>
          </form>
          <Link href="/login" className="kumbu-btn-ghost">
            Voltar ao login
          </Link>
        </div>
      </div>
    </main>
  );
}
