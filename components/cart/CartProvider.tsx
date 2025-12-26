"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { clamp } from "@/lib/utils";

export type CartItem = {
  bookId: string;
  slug: string;
  title: string;
  price: number;
  coverUrl?: string | null;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  couponCode: string;
  couponDiscount: number;
  couponReason?: string | null;
  setCouponCode: (code: string) => void;
  applyCoupon: () => Promise<void>;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (bookId: string) => void;
  setQty: (bookId: string, qty: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

const KEY = "readrover_cart_v3";
const COUPON_KEY = "readrover_coupon_v3";
const COUPON_DISCOUNT_KEY = "readrover_coupon_discount_v1";

async function validate(code: string, subtotal: number) {
  const res = await fetch("/api/coupons/validate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code, subtotal }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error || "Failed");
  return j as any;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // ✅ Load from localStorage on first render (prevents initial [] overwrite)
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    return safeParse<CartItem[]>(window.localStorage.getItem(KEY), []);
  });

  const [couponCode, setCouponCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(COUPON_KEY) || "";
  });

  const [couponDiscount, setCouponDiscount] = useState(() => {
    if (typeof window === "undefined") return 0;
    const raw = window.localStorage.getItem(COUPON_DISCOUNT_KEY);
    const n = Number(raw || "0");
    return Number.isFinite(n) ? n : 0;
  });

  const [couponReason, setCouponReason] = useState<string | null>(null);

  const lastValidateRef = useRef<{ code: string; subtotal: number } | null>(null);

  // ✅ Persist to localStorage after state changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(COUPON_KEY, couponCode);
    } catch {}
  }, [couponCode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(COUPON_DISCOUNT_KEY, String(couponDiscount));
    } catch {}
  }, [couponDiscount]);

  const count = useMemo(() => items.reduce((s, x) => s + x.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, x) => s + x.qty * x.price, 0), [items]);

  async function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    setCouponCode(code);

    if (!code) {
      setCouponDiscount(0);
      setCouponReason(null);
      lastValidateRef.current = null;
      return;
    }

    try {
      const out = await validate(code, subtotal);
      if (!out.ok) {
        setCouponDiscount(0);
        setCouponReason(out.reason || "INVALID");
      } else {
        setCouponDiscount(out.discount || 0);
        setCouponReason(null);
      }
      lastValidateRef.current = { code, subtotal };
    } catch {
      setCouponDiscount(0);
      setCouponReason("ERROR");
    }
  }

  // Auto revalidate when subtotal changes (e.g., quantity changes).
  useEffect(() => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    if (typeof window === "undefined") return;

    const last = lastValidateRef.current;
    if (last && last.code === code && last.subtotal === subtotal) return;

    const t = window.setTimeout(async () => {
      try {
        const out = await validate(code, subtotal);
        if (!out.ok) {
          setCouponDiscount(0);
          setCouponReason(out.reason || "INVALID");
        } else {
          setCouponDiscount(out.discount || 0);
          setCouponReason(null);
        }
        lastValidateRef.current = { code, subtotal };
      } catch {
        // keep previous discount on transient network errors
      }
    }, 250);

    return () => window.clearTimeout(t);
  }, [subtotal, couponCode]);

  const api: CartCtx = useMemo(() => {
    return {
      items,
      count,
      subtotal,
      couponCode,
      couponDiscount,
      couponReason,
      setCouponCode,
      applyCoupon,
      add: (item, qty = 1) =>
        setItems((prev) => {
          const idx = prev.findIndex((p) => p.bookId === item.bookId);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], qty: clamp(copy[idx].qty + qty, 1, 99) };
            return copy;
          }
          return [...prev, { ...item, qty: clamp(qty, 1, 99) }];
        }),
      remove: (bookId) => setItems((prev) => prev.filter((x) => x.bookId !== bookId)),
      setQty: (bookId, qty) =>
        setItems((prev) =>
          prev.map((x) => (x.bookId === bookId ? { ...x, qty: clamp(qty, 1, 99) } : x))
        ),
      clear: () => {
        setItems([]);
        setCouponCode("");
        setCouponDiscount(0);
        setCouponReason(null);
        lastValidateRef.current = null;
      },
    };
  }, [items, count, subtotal, couponCode, couponDiscount, couponReason]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
