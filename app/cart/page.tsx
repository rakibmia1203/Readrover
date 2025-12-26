"use client";

import { useCart } from "@/components/cart/CartProvider";
import { formatBDT } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/toast/ToastProvider";
import { Button, Card, CardContent, Input, Textarea, Badge } from "@/components/ui";
import Link from "next/link";

type Me = { id: string; name: string; email: string; role: string };
type Address = { id: string; label: string | null; phone: string; address: string; city: string | null; isDefault: boolean };

export default function CartPage() {
  const { items, subtotal, setQty, remove, clear, couponCode, setCouponCode, applyCoupon, couponDiscount, couponReason } = useCart();
  const deliveryFee = useMemo(() => (Math.max(0, subtotal - couponDiscount) >= 1500 ? 0 : items.length ? 60 : 0), [subtotal, couponDiscount, items.length]);
  const total = Math.max(0, subtotal - couponDiscount) + deliveryFee;

  const [placing, setPlacing] = useState(false);
  const { push } = useToast();
  const [msg, setMsg] = useState<string | null>(null);
  const [orderNo, setOrderNo] = useState<string | null>(null);

  const [me, setMe] = useState<Me | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => setMe(j.user || null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!me) return;
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((j) => setAddresses(j.addresses || []))
      .catch(() => {});
  }, [me]);

  function fillFromAddress(a: Address) {
    const f = formRef.current;
    if (!f) return;
    const phone = f.elements.namedItem("phone") as HTMLInputElement | null;
    const addr = f.elements.namedItem("address") as HTMLTextAreaElement | null;
    if (phone) phone.value = a.phone || phone.value;
    if (addr) addr.value = `${a.address}${a.city ? `, ${a.city}` : ""}`;
    push({ title: "Filled from saved address", tone: "success" });
  }

  function prefillAccount() {
    const f = formRef.current;
    if (!f || !me) return;
    const name = f.elements.namedItem("name") as HTMLInputElement | null;
    const email = f.elements.namedItem("email") as HTMLInputElement | null;
    if (name && !name.value) name.value = me.name || "";
    if (email && !email.value) email.value = me.email || "";
  }

  useEffect(() => { prefillAccount(); }, [me]);

  async function placeOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setOrderNo(null);
    if (items.length === 0) { setMsg("Cart is empty."); return; }

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || "") || null,
      phone: String(fd.get("phone") || ""),
      address: String(fd.get("address") || ""),
      note: String(fd.get("note") || "") || null,
      couponCode: couponCode.trim().toUpperCase() || null,
      items: items.map((x) => ({ bookId: x.bookId, qty: x.qty, unitPrice: x.price })), // unitPrice ignored server-side
    };

    setPlacing(true);
    try {
      const res = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      clear();
      setMsg("Order placed successfully.");
      setOrderNo(data.orderNo);

      try {
        const KEY = "readrover_my_orders_v1";
        const raw = window.localStorage.getItem(KEY);
        const arr = raw ? JSON.parse(raw) : [];
        arr.unshift({ orderNo: data.orderNo, phone: payload.phone, name: payload.name, createdAt: Date.now() });
        window.localStorage.setItem(KEY, JSON.stringify(arr.slice(0, 20)));
      } catch {}

      (e.currentTarget as HTMLFormElement).reset();
    } catch (err: any) {
      setMsg(err.message || "Something went wrong.");
      push({ title: "Order failed", desc: err.message || "Something went wrong.", tone: "error" });
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr,440px]">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-xl font-semibold">Cart</h1>
              <p className="mt-1 text-sm text-slate-600">DB-backed coupons + COD checkout + instant order tracking.</p>
            </div>
            <Link href="/recent" className="text-sm font-semibold hover:opacity-80">Recently viewed →</Link>
          </div>

          {items.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Your cart is empty. <Link className="font-semibold" href="/books">Shop now</Link>.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {items.map((x) => (
                <div key={x.bookId} className="flex gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-3">
                  <img
                    src={x.coverUrl ?? "https://placehold.co/120x160?text=Cover"}
                    alt={x.title}
                    className="h-20 w-16 rounded-xl object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{x.title}</div>
                    <div className="mt-1 text-sm text-slate-600">{formatBDT(x.price)}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <Input type="number" min={1} max={99} value={x.qty} onChange={(e) => setQty(x.bookId, Number(e.target.value))} className="w-24" />
                      <Button variant="secondary" onClick={() => remove(x.bookId)} type="button">Remove</Button>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">{formatBDT(x.qty * x.price)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold">Summary</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatBDT(subtotal)}</span></div>
              <div className="flex justify-between"><span>Coupon discount</span><span>- {formatBDT(couponDiscount)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{formatBDT(deliveryFee)}</span></div>
              <div className="flex justify-between border-t pt-2 font-semibold"><span>Total</span><span>{formatBDT(total)}</span></div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-semibold">Coupon</div>
              <div className="mt-2 flex gap-2">
                <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="WELCOME50 / SAVE10 / FESTIVE100" />
                <Button variant="secondary" type="button" onClick={() => applyCoupon()}>Apply</Button>
              </div>
              {couponReason ? (
                <div className="mt-2 text-xs text-rose-600">Coupon not applied: {couponReason}</div>
              ) : couponCode && couponDiscount > 0 ? (
                <div className="mt-2 text-xs text-emerald-700">Coupon applied successfully.</div>
              ) : (
                <div className="mt-2 text-xs text-slate-500">Coupons are validated from database (admin can manage).</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold">Checkout (Cash on Delivery) <span id="checkout"></span></h2>

            {me ? (
              <div className="mt-3 rounded-2xl border border-slate-200/70 bg-white/80 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold">Saved addresses</div>
                  <Link href="/account/addresses" className="text-sm font-semibold hover:opacity-80">Manage →</Link>
                </div>
                {addresses.length ? (
                  <div className="mt-3 grid gap-2">
                    {addresses.slice(0, 3).map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => fillFromAddress(a)}
                        className="text-left rounded-2xl border border-slate-200/70 bg-white/80 p-3 transition hover:bg-slate-50"
                      >
                        <div className="text-sm font-semibold">{a.label || "Address"}{a.isDefault ? <span className="ml-2 text-xs font-semibold text-emerald-700">• Default</span> : null}</div>
                        <div className="mt-1 text-xs text-slate-600">{a.phone}</div>
                        <div className="mt-1 text-xs text-slate-700 line-clamp-2">{a.address}{a.city ? `, ${a.city}` : ""}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-slate-600">No saved addresses yet.</div>
                )}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                Want faster checkout? <Link className="font-semibold" href="/login?next=/cart#checkout">Login</Link> to use saved addresses.
              </div>
            )}

            <form ref={formRef} onSubmit={placeOrder} className="mt-4 space-y-2">
              <Input name="name" required placeholder="Your name" defaultValue={me?.name || ""} />
              <Input name="email" type="email" placeholder="Email (for receipt)" defaultValue={me?.email || ""} />
              <Input name="phone" required placeholder="Phone" />
              <Textarea name="address" required placeholder="Delivery address" className="min-h-[90px]" />
              <Input name="note" placeholder="Note (optional)" />
              <Button disabled={placing} className="w-full">{placing ? "Placing..." : "Place order"}</Button>

              {msg ? (
                <div className="text-sm text-slate-700">
                  {msg}
                  {orderNo ? (
                    <div className="mt-2 flex flex-wrap gap-2 items-center">
                      <Badge tone="dark">Order No: {orderNo}</Badge>
                      <Link className="text-sm font-semibold hover:opacity-80" href={`/track-order?orderNo=${encodeURIComponent(orderNo)}`}>Track this order →</Link>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="text-xs text-slate-500">Pricing is verified server-side to prevent tampering.</div>
            </form>
          </CardContent>
        </Card>
      </div>

      {items.length ? (
        <div className="fixed bottom-3 left-0 right-0 z-40 md:hidden">
          <div className="container">
            <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur px-4 py-3 shadow-soft flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-600">Total</div>
                <div className="text-sm font-semibold">{formatBDT(total)}</div>
              </div>
              <a href="#checkout" className="rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white">Checkout</a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
