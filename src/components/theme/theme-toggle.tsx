"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme/theme-provider";
import type { ThemeMode } from "@/lib/theme";

const OPTIONS: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Escuro", icon: Moon },
  { id: "system", label: "Sistema", icon: Monitor },
];

type Props = {
  compact?: boolean;
  className?: string;
};

export function ThemeToggle({ compact = false, className }: Props) {
  const { mode, setMode } = useTheme();
  const activeIndex = OPTIONS.findIndex((o) => o.id === mode);

  return (
    <div
      className={cn(
        "theme-toggle relative inline-flex rounded-full border border-[var(--kumbu-border)] bg-[var(--kumbu-surface-muted)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        compact ? "gap-0" : "gap-0.5",
        className,
      )}
      role="group"
      aria-label="Tema do painel"
    >
      <span
        aria-hidden
        className="theme-toggle-thumb absolute top-1 bottom-1 rounded-full bg-[var(--kumbu-surface)] shadow-[0_1px_3px_rgba(0,0,0,0.12),0_0_0_1px_var(--kumbu-border)] transition-[left,width] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{
          width: `calc((100% - 0.5rem) / ${OPTIONS.length})`,
          left: `calc(0.25rem + ${activeIndex} * ((100% - 0.5rem) / ${OPTIONS.length}))`,
        }}
      />
      {OPTIONS.map(({ id, label, icon: Icon }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={cn(
              "relative z-10 inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-colors duration-200",
              compact ? "min-w-[2.25rem] px-2" : "min-w-[4.5rem]",
              active
                ? "text-[var(--kumbu-ink)]"
                : "text-[var(--kumbu-ink-subtle)] hover:text-[var(--kumbu-ink-muted)]",
            )}
            aria-pressed={active}
            title={label}
          >
            <Icon
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-transform duration-300",
                active && id === "dark" && "rotate-[-8deg]",
                active && id === "light" && "rotate-[8deg]",
              )}
              aria-hidden
            />
            {!compact && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Atalho rápido só ícone — alterna claro/escuro. */
export function ThemeToggleIcon({ className }: { className?: string }) {
  const { resolved, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-chip border border-[var(--kumbu-border)] bg-[var(--kumbu-surface)] text-[var(--kumbu-ink-muted)] transition hover:bg-[var(--kumbu-surface-hover)] hover:text-[var(--kumbu-ink)]",
        className,
      )}
      aria-label={resolved === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
      title={resolved === "dark" ? "Tema claro" : "Tema escuro"}
    >
      <Sun
        className={cn(
          "absolute h-4 w-4 transition-all duration-300",
          resolved === "dark"
            ? "scale-0 rotate-90 opacity-0"
            : "scale-100 rotate-0 opacity-100",
        )}
      />
      <Moon
        className={cn(
          "absolute h-4 w-4 transition-all duration-300",
          resolved === "dark"
            ? "scale-100 rotate-0 opacity-100"
            : "scale-0 -rotate-90 opacity-0",
        )}
      />
    </button>
  );
}
