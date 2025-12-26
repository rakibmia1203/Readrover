"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { THEMES, THEME_KEY, type ThemeId } from "./themes";
import { useToast } from "@/components/toast/ToastProvider";

function applyTheme(id: ThemeId) {
  document.documentElement.dataset.theme = id;
  window.localStorage.setItem(THEME_KEY, id);
}

export default function ThemeSwitcher({ compact }: { compact?: boolean }) {
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeId>("sunset");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Load persisted theme (if any)
    try {
      const stored = window.localStorage.getItem(THEME_KEY) as ThemeId | null;
      const next = stored && THEMES.some((t) => t.id === stored) ? stored : "sunset";
      setTheme(next);
      document.documentElement.dataset.theme = next;
    } catch {
      // no-op
    }
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const current = useMemo(() => THEMES.find((t) => t.id === theme) ?? THEMES[0], [theme]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
          "border-[rgb(var(--border)/0.85)] bg-[rgb(var(--surface)/0.75)] hover:bg-[rgb(var(--surface)/0.9)]",
          compact ? "px-2" : ""
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Switch theme"
      >
        <span className="inline-flex items-center gap-1">
          {current.swatches.map((c) => (
            <span
              key={c}
              className="h-3 w-3 rounded-full ring-1 ring-black/5"
              style={{ background: c }}
            />
          ))}
        </span>
        {compact ? null : <span className="hidden sm:inline">Theme</span>}
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute right-0 mt-2 w-56 rounded-2xl border p-2 shadow-soft",
            "border-[rgb(var(--border)/0.85)] bg-[rgb(var(--surface)/0.92)] backdrop-blur"
          )}
        >
          <div className="px-2 pb-2 text-xs font-semibold" style={{ color: "rgb(var(--muted))" }}>
            Choose a theme
          </div>
          <div className="space-y-1">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  setTheme(t.id);
                  applyTheme(t.id);
                  setOpen(false);
                  push({ title: "Theme updated", desc: `${t.label}${t.note ? ` — ${t.note}` : ""}` });
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-sm font-semibold transition",
                  t.id === theme
                    ? "bg-[rgb(var(--ring)/0.10)]"
                    : "hover:bg-[rgb(var(--surface)/0.9)]"
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    {t.swatches.map((c) => (
                      <span key={c} className="h-3 w-3 rounded-full ring-1 ring-black/5" style={{ background: c }} />
                    ))}
                  </span>
                  <span>
                    {t.label}
                    {t.note ? <span className="ml-2 text-xs font-semibold" style={{ color: "rgb(var(--muted))" }}>{t.note}</span> : null}
                  </span>
                </span>
                {t.id === theme ? <span className="text-xs" style={{ color: "rgb(var(--muted))" }}>Active</span> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
