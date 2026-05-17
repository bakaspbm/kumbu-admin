/* eslint-disable @next/next/no-img-element */
import { cn, initialsFromName } from "@/lib/utils";

export function Avatar({
  src,
  name,
  email,
  size = 36,
  className,
}: {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: number;
  className?: string;
}) {
  const initials = initialsFromName(name, email);
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-full bg-kumbu-gradient text-white font-semibold",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {src ? (
        <img
          src={src}
          alt={name ?? email ?? "avatar"}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      ) : (
        initials
      )}
    </span>
  );
}
