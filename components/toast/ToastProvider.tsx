"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Toast = { id: string; title: string; desc?: string; tone?: "info" | "success" | "error" };

type ToastCtx = {
  push: (t: Omit<Toast, "id">) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const api = useMemo<ToastCtx>(() => ({
    push: (t) => {
      const id = uid();
      setToasts((prev) => [{ id, ...t }, ...prev].slice(0, 4));
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, 3200);
    },
  }), []);

  return (
    <Ctx.Provider value={api}>
      {children}

      {/* Desktop */}
      <div className="pointer-events-none fixed right-4 top-4 z-[60] hidden w-[360px] space-y-2 md:block">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 16, y: -6 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.22 }}
              className={cn(
                "pointer-events-auto rounded-2xl border bg-white/90 backdrop-blur px-4 py-3 shadow-soft",
                t.tone === "success" ? "border-emerald-200" : t.tone === "error" ? "border-rose-200" : "border-slate-200"
              )}
            >
              <div className="text-sm font-semibold">{t.title}</div>
              {t.desc ? <div className="mt-1 text-sm text-slate-600">{t.desc}</div> : null}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mobile */}
      <div className="pointer-events-none fixed bottom-3 left-0 right-0 z-[60] px-4 md:hidden">
        <AnimatePresence>
          {toasts.slice(0, 1).map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.22 }}
              className={cn(
                "pointer-events-auto mx-auto max-w-lg rounded-2xl border bg-white/92 backdrop-blur px-4 py-3 shadow-soft",
                t.tone === "success" ? "border-emerald-200" : t.tone === "error" ? "border-rose-200" : "border-slate-200"
              )}
            >
              <div className="text-sm font-semibold">{t.title}</div>
              {t.desc ? <div className="mt-1 text-sm text-slate-600">{t.desc}</div> : null}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
