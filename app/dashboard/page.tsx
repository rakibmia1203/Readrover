"use client";

const RECENT_KEY = "readrover_recent_orders_v1";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, CardContent, Input } from "@/components/ui";
import { formatBDT } from "@/lib/utils";

type MyOrder = { orderNo: string; phone: string; name: string; createdAt: number };

function loadLocalOrders(): MyOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("readrover_my_orders_v1");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

export default function DashboardPage() {
  const [me, setMe] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [recentOrderNos, setRecentOrderNos] = useState<string[]>([]);
  const [localOrders, setLocalOrders] = useState<MyOrder[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [lookupMsg, setLookupMsg] = useState<string | null>(null);
  const [remoteOrders, setRemoteOrders] = useState<any[] | null>(null);

  const [myOrders, setMyOrders] = useState<any[] | null>(null);

  const [email, setEmail] = useState("");
  const [watchMsg, setWatchMsg] = useState<string | null>(null);
  const [watchItems, setWatchItems] = useState<any[] | null>(null);

  useEffect(() => {
    // If logged in, we can load real DB-backed data.
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => setMe(j.user || null))
      .catch(() => {});
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      setRecentOrderNos(arr);
    } catch {}

    setLocalOrders(loadLocalOrders());

    // Production mode: if user is logged in, load orders + watchlist from DB
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(async (j) => {
        if (!j.user) return;
        setMe(j.user);
        setEmail(j.user.email || "");

        try {
          const [oRes, wRes] = await Promise.all([
            fetch("/api/orders/by-user"),
            fetch("/api/watchlist/list"),
          ]);
          if (oRes.ok) {
            const oJ = await oRes.json();
            setMyOrders(oJ.orders || []);
          }
          if (wRes.ok) {
            const wJ = await wRes.json();
            setWatchItems(wJ.items || []);
          }
        } catch {
          // ignore
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!me) return;
    // Load orders + watchlist from DB
    (async () => {
      try {
        const res = await fetch("/api/orders/by-user");
        const j = await res.json();
        if (res.ok) setRemoteOrders(j.orders || []);
      } catch {}
      try {
        const res = await fetch("/api/watchlist/list");
        const j = await res.json();
        if (res.ok) setWatchItems(j.items || []);
      } catch {}
    })();
  }, [me]);

  const merged = useMemo(() => {
    const map = new Map<string, MyOrder>();
    for (const o of localOrders) map.set(o.orderNo, o);
    return [...map.values()].sort((a, b) => b.createdAt - a.createdAt);
  }, [localOrders]);

  async function lookupOrders() {
    setLookupMsg(null);
    setRemoteOrders(null);
    try {
      const res = await fetch(`/api/orders/by-phone?phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      setRemoteOrders(j.orders || []);
      if (!j.orders?.length) setLookupMsg("No orders found for this name + phone.");
    } catch (e: any) {
      setLookupMsg(e.message || "Error");
    }
  }

  async function loadWatchlist() {
    setWatchMsg(null);
    setWatchItems(null);
    try {
      const res = await fetch(`/api/watchlist/list?email=${encodeURIComponent(email)}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      setWatchItems(j.items || []);
      if (!j.items?.length) setWatchMsg("No watchlist items for this email.");
    } catch (e: any) {
      setWatchMsg(e.message || "Error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <Badge tone="dark">Customer</Badge>
        <h1 className="mt-2 text-2xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          One place for your order history, quick tracking, and watchlist{me ? ` — signed in as ${me.email}` : "."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Your recent orders</h2>
                <p className="mt-1 text-sm text-slate-600">If you're signed in, we show DB-backed orders. Otherwise we show locally saved orders (this browser only).</p>
              </div>
              <Link href="/track-order" className="text-sm font-semibold hover:opacity-80">Track manually →</Link>
            </div>

            {me && myOrders ? (
              myOrders.length ? (
                <div className="space-y-3">
                  {myOrders.map((o) => (
                    <div key={o.id} className="flex flex-col gap-2 rounded-2xl border border-slate-200/70 bg-white/80 p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm font-semibold">{o.orderNo}</div>
                        <div className="mt-1 text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</div>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <Badge tone="indigo">Status: {o.status}</Badge>
                          <Badge tone="pink">Total: {formatBDT(o.total)}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/track-order?orderNo=${encodeURIComponent(o.orderNo)}&phone=${encodeURIComponent(o.phone)}`}>
                          <Button>Track</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 text-sm text-slate-600">
                  No orders in your account yet.
                </div>
              )
            ) : null}

            {merged.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 text-sm text-slate-600">
                No saved orders yet. After you place an order, the order number will be saved here automatically.
              </div>
            ) : (
              <div className="space-y-3">
                {merged.map((o) => (
                  <div key={o.orderNo} className="flex flex-col gap-2 rounded-2xl border border-slate-200/70 bg-white/80 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-semibold">{o.orderNo}</div>
                      <div className="mt-1 text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</div>
                      <div className="mt-1 text-sm text-slate-600">{o.name} • {o.phone}</div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/track-order?orderNo=${encodeURIComponent(o.orderNo)}&phone=${encodeURIComponent(o.phone)}`}>
                        <Button>Track</Button>
                      </Link>
                      <Button variant="secondary" type="button" onClick={() => {
                        try {
                          const next = merged.filter(x => x.orderNo !== o.orderNo);
                          window.localStorage.setItem("readrover_my_orders_v1", JSON.stringify(next));
                          setLocalOrders(next);
                        } catch {}
                      }}>Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!me ? (
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm font-semibold">Recover orders (name + phone)</div>
              <div className="mt-2 grid gap-2 md:grid-cols-3">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name used in checkout" />
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone used in checkout" />
                <Button onClick={lookupOrders} disabled={!name || !phone}>Find orders</Button>
              </div>
              {lookupMsg ? <div className="mt-2 text-sm text-rose-600">{lookupMsg}</div> : null}

              {remoteOrders ? (
                <div className="mt-4 space-y-2">
                  {remoteOrders.map((o) => (
                    <div key={o.orderNo} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/70 bg-white/80 p-4">
                      <div>
                        <div className="text-sm font-semibold">{o.orderNo}</div>
                        <div className="mt-1 text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</div>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <Badge tone="indigo">Status: {o.status}</Badge>
                          <Badge tone="pink">Total: {formatBDT(o.total)}</Badge>
                        </div>
                      </div>
                      <Link href={`/track-order?orderNo=${encodeURIComponent(o.orderNo)}&phone=${encodeURIComponent(phone)}`}>
                        <Button>Open</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-semibold">Watchlist</h2>
            <p className="text-sm text-slate-600">See books you subscribed for price-drop alerts.</p>
            {!me ? (
              <>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email used in watchlist" />
                <Button variant="secondary" onClick={loadWatchlist} disabled={!email}>Load watchlist</Button>
              </>
            ) : (
              <Link href="/watchlist"><Button variant="secondary">Open watchlist</Button></Link>
            )}
            {watchMsg ? <div className="text-sm text-rose-600">{watchMsg}</div> : null}

            {watchItems ? (
              watchItems.length === 0 ? null : (
                <div className="space-y-2">
                  {watchItems.map((it) => (
                    <Link key={it.id} href={`/books/${it.book.slug}`} className="block rounded-2xl border border-slate-200/70 bg-white/80 p-3 hover:shadow-md transition">
                      <div className="text-sm font-semibold line-clamp-2">{it.book.title}</div>
                      <div className="mt-1 text-sm text-slate-600">{formatBDT(it.book.salePrice ?? it.book.price)}</div>
                      <div className="mt-1 text-xs text-slate-500">Saved: {new Date(it.createdAt).toLocaleDateString()}</div>
                    </Link>
                  ))}
                </div>
              )
            ) : null}

            <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
              Production upgrade: real accounts + persistent dashboard across devices.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
