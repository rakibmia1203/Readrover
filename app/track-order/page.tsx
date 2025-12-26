"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, Input, Badge } from "@/components/ui";
import { useSearchParams } from "next/navigation";
import { formatBDT } from "@/lib/utils";

type TrackRes = { ok: true; order: any } | { ok: false; error: string };

export default function TrackOrderPage() {
  const sp = useSearchParams();
  const [orderNo, setOrderNo] = useState(sp.get("orderNo") ?? "");
  const [phone, setPhone] = useState(sp.get("phone") ?? "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrackRes | null>(null);

  useEffect(() => { const q = sp.get("orderNo"); if (q) setOrderNo(q); }, [sp]);

  async function track() {
    setLoading(true); setData(null);
    try {
      const res = await fetch(`/api/orders/track?orderNo=${encodeURIComponent(orderNo)}&phone=${encodeURIComponent(phone)}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      setData({ ok: true, order: j.order });
    } catch (e: any) {
      setData({ ok: false, error: e.message || "Error" });
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Track order</h1>
        <p className="mt-2 text-sm text-slate-600">Enter order number + phone to check status.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-3">
            <Input value={orderNo} onChange={(e) => setOrderNo(e.target.value)} placeholder="Order No (BN-YYYYMMDD-XXXXXX)" />
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
            <Button onClick={track} disabled={loading || !orderNo || !phone}>{loading ? "Checking..." : "Track"}</Button>
          </div>

          {data ? (
            data.ok ? (
              <div className="mt-6 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="dark">Order: {data.order.orderNo}</Badge>
                  <Badge tone="indigo">Status: {data.order.status}</Badge>
                  <Badge tone="pink">Total: {formatBDT(data.order.total)}</Badge>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 text-sm">
                  <div><span className="text-slate-500">Name:</span> {data.order.name}</div>
                  <div className="mt-1"><span className="text-slate-500">Phone:</span> {data.order.phone}</div>
                  <div className="mt-1"><span className="text-slate-500">Address:</span> {data.order.address}</div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4">
                  <div className="text-sm font-semibold">Items</div>
                  <div className="mt-2 space-y-2">
                    {data.order.items.map((it: any) => (
                      <div key={it.id} className="flex justify-between text-sm">
                        <div>
                          <div className="font-semibold">{it.book.title}</div>
                          <div className="text-slate-600">Qty: {it.qty}</div>
                        </div>
                        <div className="font-semibold">{formatBDT(it.qty * it.unitPrice)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-rose-600">{data.error}</div>
            )
          ) : null}

          <div className="mt-4 text-xs text-slate-500">Tip: Save Order No after checkout.</div>
        </CardContent>
      </Card>
    </div>
  );
}
