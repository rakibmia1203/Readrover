"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/components/toast/ToastProvider";
import { cn } from "@/lib/utils";

type Promo = { label: string; code: string; desc: string };

export default function PromoBar({ className }: { className?: string }) {
  const promos = useMemo<Promo[]>(
    () => [
      { label: "New user", code: "HELLO50", desc: "Flat ৳50 off on your first order" },
      { label: "Delivery", code: "FREESHIP", desc: "Free delivery on orders over ৳999" },
      { label: "Weekend", code: "WEEKEND10", desc: "10% off this weekend (selected titles)" },
    ],
    []
  );
  const { push } = useToast();
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setI((v) => (v + 1) % promos.length), 6000);
    return () => window.clearInterval(t);
  }, [promos.length]);

  const p = promos[i];

  return (
    <div className={cn("border-b", "border-[rgb(var(--border)/0.65)]", className)}>
      <div className="container flex items-center justify-between py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={p.code}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap items-center gap-2 text-xs sm:text-sm"
          >
            <span className="inline-flex items-center rounded-full bg-[rgb(var(--ring)/0.10)] px-2 py-1 font-semibold">
              {p.label}
            </span>
            <span className="font-semibold">{p.desc}</span>
            <span className="hidden sm:inline" style={{ color: "rgb(var(--muted))" }}>
              — use code
            </span>
            <span className="inline-flex items-center rounded-full bg-brand-gradient px-2 py-1 font-semibold text-white">
              {p.code}
            </span>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(p.code);
              push({ title: "Coupon copied", desc: `${p.code} copied to clipboard`, tone: "success" });
            } catch {
              push({ title: "Copy failed", desc: "Your browser blocked clipboard access.", tone: "error" });
            }
          }}
          className={cn(
            "relative overflow-hidden rounded-xl px-3 py-1.5 text-xs font-semibold text-white",
            "bg-brand-gradient shadow-soft hover:opacity-95"
          )}
        >
          Copy
          <span className="btn-shine" />
        </button>
      </div>
    </div>
  );
}
