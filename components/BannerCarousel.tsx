"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button, Badge } from "@/components/ui";

type Slide = {
  title: string;
  subtitle: string;
  cta: { label: string; href: string };
  tone: "primary" | "secondary";
  pills: string[];
};

export default function BannerCarousel() {
  const slides: Slide[] = useMemo(() => ([
    {
      title: "Blue Deals Week",
      subtitle: "Coupons + free delivery rule + fast discovery. Built to feel premium on mobile.",
      cta: { label: "Shop deals", href: "/books?sort=top" },
      tone: "primary",
      pills: ["WELCOME50", "SAVE10", "FESTIVE100"],
    },
    {
      title: "BookMatch + Discover",
      subtitle: "BookMatch + Discover gives faster return visits and higher conversion.",
      cta: { label: "Try BookMatch", href: "/bookmatch" },
      tone: "secondary",
      pills: ["Smart picks", "Recently viewed", "Faster checkout"],
    },
    {
      title: "Track Orders Easily",
      subtitle: "Track using Order No + phone. Dashboard can recover your recent orders.",
      cta: { label: "Open dashboard", href: "/dashboard" },
      tone: "secondary",
      pills: ["Order history", "Quick track", "Mobile-first"],
    },
  ]), []);

  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [slides.length]);

  const s = slides[i];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-soft">
      {/* animated gradient blobs */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sky-300/25 blur-3xl animate-floatSlow" />
      <div className="pointer-events-none absolute -left-28 -bottom-28 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/15 blur-3xl animate-floatFast" />

      <div className="relative p-6 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <Badge tone="dark">Featured</Badge>
          <div className="flex gap-1">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className={"h-2 w-2 rounded-full transition " + (idx === i ? "bg-slate-900" : "bg-slate-300 hover:bg-slate-400")}
                aria-label={`Go to slide ${idx + 1}`}
                type="button"
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="mt-4 grid gap-5 md:grid-cols-[1.2fr,0.8fr] md:items-center"
          >
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{s.title}</h1>
              <p className="text-sm leading-6 text-slate-600">{s.subtitle}</p>

              <div className="flex flex-wrap gap-2 pt-1">
                {s.pills.map((p) => (
                  <span key={p} className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
                    {p}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href={s.cta.href}>
                  <Button variant={s.tone === "primary" ? "primary" : "secondary"} className="relative overflow-hidden">
                    <span className="relative z-10">{s.cta.label}</span>
                    <span className="btn-shine" />
                  </Button>
                </Link>
                <Link href="/books">
                  <Button variant="ghost">Browse all →</Button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-sky-50 to-white p-5">
              <div className="text-sm font-semibold text-slate-900">Quick links</div>
              <div className="mt-3 grid gap-2">
                <Link className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50" href="/collections">
                  Collections
                </Link>
                <Link className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50" href="/discover">
                  Discover
                </Link>
                <Link className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50" href="/track-order">
                  Track Order
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
