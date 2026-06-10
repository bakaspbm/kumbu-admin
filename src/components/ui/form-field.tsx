"use client";

import { cn } from "@/lib/utils";

export function FieldError({
  name,
  fields,
  className,
}: {
  name: string;
  fields?: Record<string, string>;
  className?: string;
}) {
  const message = fields?.[name];
  if (!message) return null;
  return (
    <p className={cn("mt-1 text-xs text-rose-600", className)} role="alert">
      {message}
    </p>
  );
}

export function FieldCompact({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  readOnly,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  error?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="kumbu-label">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        readOnly={readOnly}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={cn("kumbu-input py-1.5", error && "border-rose-400 focus:border-rose-500")}
      />
      {error ? (
        <p className="text-xs text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </label>
  );
}

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  readOnly,
  placeholder,
  error,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  error?: string;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1", className)}>
      <span className="kumbu-label">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        readOnly={readOnly}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={cn("kumbu-input", error && "border-rose-400 focus:border-rose-500")}
      />
      {error ? (
        <p className="text-xs text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </label>
  );
}
