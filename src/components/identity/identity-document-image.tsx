"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { toBrowserIdentityDocumentUrl } from "@/lib/asset-url";
import { cn } from "@/lib/utils";

export function IdentityDocumentImage({
  userId,
  side,
  alt,
  className,
  fallbackClassName,
}: {
  userId: string;
  side: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-slate-200 bg-slate-50 text-slate-400",
          fallbackClassName ?? className,
        )}
        title="Não foi possível carregar a imagem"
      >
        <ImageOff className="h-4 w-4" aria-hidden />
        <span className="text-[9px] font-semibold">Indisponível</span>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={toBrowserIdentityDocumentUrl(userId, side)}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
