import { toBrowserSecureFileUrl } from "@/lib/asset-url";

export function ChatAttachment({
  url,
  className,
}: {
  url: string;
  className?: string;
}) {
  const safeUrl = toBrowserSecureFileUrl(url);
  if (!safeUrl) return null;

  const isPdf = url.toLowerCase().includes(".pdf");

  if (isPdf) {
    return (
      <a
        href={safeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={
          className ??
          "mb-2 inline-flex items-center gap-1 rounded-lg border border-[var(--kumbu-border)] bg-[var(--kumbu-surface)] px-2.5 py-1.5 text-xs font-semibold text-kumbu-red transition hover:opacity-90"
        }
      >
        PDF — abrir ficheiro
      </a>
    );
  }

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mb-2 block overflow-hidden rounded-lg"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={safeUrl}
        alt="Anexo"
        className="max-h-48 w-full object-cover"
      />
    </a>
  );
}
