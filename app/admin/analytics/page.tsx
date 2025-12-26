"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { formatBDT } from "@/lib/utils";

type Series = { day: string; orders: number; revenue: number };
type TopBook = { bookId: string; title: string; slug: string; qty: number; revenue: number };

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/analytics");
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      setData(j);
    } catch (e: any) {
      setMsg(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const maxOrders = useMemo(() => {
    const s: Series[] = data?.series || [];
    return Math.max(1, ...s.map((x) => x.orders));
  }, [data]);

  const maxRevenue = useMemo(() => {
    const s: Series[] = data?.series || [];
    return Math.max(1, ...s.map((x) => x.revenue));
  }, [data]);

  const cards = data?.cards || null;
  const series: Series[] = data?.series || [];
  const topBooks: TopBook[] = data?.topBooks || [];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge tone="dark">Admin</Badge>
            <h1 className="mt-2 text-2xl font-semibold">Analytics</h1>
            <p className="mt-2 text-sm text-slate-600">Orders, revenue, and top products (last 14 days).</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin"><Button variant="secondary">Back</Button></Link>
            <Button onClick={load} disabled={loading}>{loading ? "Loading..." : "Reload"}</Button>
          </div>
        </div>
        {msg ? <div className="mt-3 text-sm text-rose-600">{msg}</div> : null}
      </div>

      {cards ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Card><CardContent className="pt-6"><div className="text-xs text-slate-500">Users</div><div className="mt-1 text-2xl font-semibold">{cards.users}</div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-xs text-slate-500">Books</div><div className="mt-1 text-2xl font-semibold">{cards.books}</div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-xs text-slate-500">Orders</div><div className="mt-1 text-2xl font-semibold">{cards.orders}</div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-xs text-slate-500">Pending</div><div className="mt-1 text-2xl font-semibold">{cards.pending}</div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-xs text-slate-500">Revenue (14d)</div><div className="mt-1 text-2xl font-semibold">{formatBDT(cards.revenue14 || 0)}</div></CardContent></Card>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="text-lg font-semibold">Orders by day</div>
            <div className="mt-4 space-y-2">
              {series.map((s) => (
                <div key={s.day} className="grid grid-cols-[90px,1fr,50px] items-center gap-3 text-sm">
                  <div className="text-slate-600">{s.day.slice(5)}</div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-2 bg-[rgb(var(--accent-solid))]" style={{ width: `${Math.round((s.orders / maxOrders) * 100)}%` }} />
                  </div>
                  <div className="text-right font-semibold">{s.orders}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-lg font-semibold">Revenue by day</div>
            <div className="mt-4 space-y-2">
              {series.map((s) => (
                <div key={s.day} className="grid grid-cols-[90px,1fr,90px] items-center gap-3 text-sm">
                  <div className="text-slate-600">{s.day.slice(5)}</div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-2 bg-[rgb(var(--accent-solid))]" style={{ width: `${Math.round((s.revenue / maxRevenue) * 100)}%` }} />
                  </div>
                  <div className="text-right font-semibold">{formatBDT(s.revenue)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold">Top books</div>
              <div className="mt-1 text-sm text-slate-600">By revenue (all time, best effort)</div>
            </div>
            <Link href="/books" className="text-sm font-semibold hover:opacity-80">View catalog →</Link>
          </div>

          {topBooks.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-slate-500">
                  <tr>
                    <th className="py-2 pr-3">Book</th>
                    <th className="py-2 pr-3">Qty</th>
                    <th className="py-2 pr-3">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topBooks.map((b) => (
                    <tr key={b.bookId} className="border-t">
                      <td className="py-3 pr-3">
                        <Link href={`/books/${b.slug}`} className="font-semibold hover:opacity-80">{b.title}</Link>
                      </td>
                      <td className="py-3 pr-3">{b.qty}</td>
                      <td className="py-3 pr-3 font-semibold">{formatBDT(b.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No sales data yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
