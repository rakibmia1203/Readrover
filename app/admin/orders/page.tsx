"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { ORDER_STATUSES } from "@/lib/utils";
import Link from "next/link";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/orders");
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      setOrders(j.orders);
    } catch (e: any) {
      setMsg(e.message || "Error");
    } finally { setLoading(false); }
  }

  async function updateStatus(orderId: string, status: string) {
    setMsg(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      await load();
    } catch (e: any) {
      setMsg(e.message || "Error");
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge tone="dark">Admin</Badge>
            <h1 className="mt-2 text-2xl font-semibold">Manage orders</h1>
            <p className="mt-2 text-sm text-slate-600">View latest orders and update status.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin"><Button variant="secondary">Back to admin</Button></Link>
            <Button onClick={load} disabled={loading}>{loading ? "Loading..." : "Reload"}</Button>
          </div>
        </div>
        {msg ? <div className="mt-3 text-sm text-rose-600">{msg}</div> : null}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-sm text-slate-600">No orders found.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{o.orderNo}</div>
                    <div className="mt-1 text-sm text-slate-600">{o.name} • {o.phone}</div>
                    <div className="mt-1 text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="indigo">Status: {o.status}</Badge>
                    <select defaultValue={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm">
                  <div className="text-slate-500">Address</div>
                  <div className="mt-1">{o.address}</div>
                </div>

                <div className="mt-4 grid gap-2">
                  {o.items.map((it: any) => (
                    <div key={it.id} className="flex justify-between text-sm">
                      <div className="font-semibold">{it.book.title} <span className="text-slate-500 font-normal">x {it.qty}</span></div>
                      <div className="font-semibold">৳{it.qty * it.unitPrice}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex justify-end gap-3 text-sm">
                  <div className="text-slate-600">Subtotal: ৳{o.subtotal}</div>
                  <div className="text-slate-600">Delivery: ৳{o.deliveryFee}</div>
                  <div className="font-semibold">Total: ৳{o.total}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
