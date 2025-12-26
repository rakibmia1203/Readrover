"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui";

const KEY = "readrover_offer_deadline_v1";

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function OfferTimer() {
  const [left, setLeft] = useState<number>(0);

  const deadline = useMemo(() => {
    if (typeof window === "undefined") return Date.now() + 2 * 60 * 60 * 1000;
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const v = Number(raw);
      if (!Number.isNaN(v) && v > Date.now()) return v;
    }
    // create a fresh 6 hour window
    const v = Date.now() + 6 * 60 * 60 * 1000;
    window.localStorage.setItem(KEY, String(v));
    return v;
  }, []);

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, deadline - Date.now()));
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, [deadline]);

  const sec = Math.floor(left / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-4 shadow-soft">
      <div>
        <div className="text-sm font-semibold">Flash sale ends in</div>
        <div className="mt-1 text-xs text-slate-600">Limited-time demo offer to showcase a premium UX.</div>
      </div>
      <div className="flex items-center gap-2">
        <Badge tone="indigo" className="text-sm">{pad(h)}:{pad(m)}:{pad(s)}</Badge>
        <Badge tone="dark">Up to 30% OFF</Badge>
      </div>
    </div>
  );
}
