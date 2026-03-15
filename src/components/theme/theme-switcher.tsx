"use client";

import { useState } from "react";
import { Moon, Sun, Eye } from "lucide-react";
import { useTheme, type Theme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

const THEMES: { id: Theme; label: string; icon: typeof Moon }[] = [
  { id: "dark", label: "深色", icon: Moon },
  { id: "light", label: "浅色", icon: Sun },
  { id: "eye-care", label: "护眼", icon: Eye },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];
  const Icon = current.icon;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm",
          "transition-colors hover:bg-accent/50"
        )}
        aria-label="切换主题"
      >
        <Icon className="size-4" />
        <span>{current.label}</span>
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className={cn(
              "absolute bottom-full left-0 z-50 mb-2 flex flex-col rounded-lg border border-border bg-card py-1 shadow-lg"
            )}
          >
            {THEMES.map((t) => {
              const TIcon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-4 py-2 text-left text-sm",
                    "hover:bg-accent/50",
                    theme === t.id && "bg-accent/30 text-primary"
                  )}
                >
                  <TIcon className="size-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
