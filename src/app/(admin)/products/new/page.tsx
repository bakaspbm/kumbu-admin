import Link from "next/link";
import { ArrowLeft, Smartphone } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div>
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-kumbu-red"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <PageHeader
        title="Produtos na app"
        subtitle="Os anúncios são publicados pelos utilizadores no cliente móvel."
      />
      <div className="kumbu-card max-w-lg p-6">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl2 bg-rose-100 text-kumbu-red">
          <Smartphone className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-lg font-semibold">Criação só na app cliente</h2>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Cada utilizador publica os seus produtos com{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">seller_id = auth.uid()</code>.
          Neste painel podes moderar: editar, marcar destaque, esgotado ou remover do catálogo.
        </p>
        <Link href="/products" className="kumbu-btn-primary mt-5 inline-flex">
          Ver catálogo de utilizadores
        </Link>
      </div>
    </div>
  );
}
