"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { toBrowserIdentityDocumentUrl } from "@/lib/asset-url";
import { cn } from "@/lib/utils";

type IdentityDocumentImageProps = {
  userId: string;
  side: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  /** When false, skip fetch and show missing-file message (server knows file is gone). */
  fileAvailable?: boolean;
};

export function IdentityDocumentImage({
  userId,
  side,
  alt,
  className,
  fallbackClassName,
  fileAvailable = true,
}: IdentityDocumentImageProps) {
  const [failed, setFailed] = useState(false);
  const unavailable = fileAvailable === false || failed;

  if (unavailable) {
    return (
      <span
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-amber-200 bg-amber-50 px-1 text-amber-800",
          fallbackClassName ?? className,
        )}
        title="Ficheiro não encontrado no servidor — peça ao utilizador que reenvie em Definições"
      >
        <ImageOff className="h-4 w-4 shrink-0" aria-hidden />
        <span className="text-center text-[9px] font-semibold leading-tight">
          {fileAvailable === false ? "Reenvio necessário" : "Indisponível"}
        </span>
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
