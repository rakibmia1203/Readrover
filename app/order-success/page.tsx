"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge, Button, Card, CardContent } from "@/components/ui";

const KEY = "readrover_recent_orders_v1";

export default function OrderSuccessPage() {
  const sp = useSearchParams();
  const [orderNo, setOrderNo] = useState<string>("");

  useEffect(() => {
    const q = sp.get("orderNo") ?? "";
    setOrderNo(q);
    if (!q) return;

    // store for dashboard history
    try {
      const raw = window.localStorage.getItem(KEY);
      const prev: string[] = raw ? JSON.parse(raw) : [];
      const next = [q, ...prev.filter((x) => x !== q)].slice(0, 20);
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }, [sp]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <Badge tone="dark">Success</Badge>
        <h1 className="mt-3 text-2xl font-semibold">Order placed</h1>
        <p className="mt-2 text-sm text-slate-600">
          Save your order number. You can also find it later in the Dashboard.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <div className="text-sm text-slate-600">Order No</div>
            <div className="mt-1 text-xl font-semibold">{orderNo || "—"}</div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={orderNo ? `/track-order?orderNo=${encodeURIComponent(orderNo)}` : "/track-order"}>
              <Button>Track this order</Button>
            </Link>
            <Link href="/dashboard"><Button variant="secondary">Go to dashboard</Button></Link>
            <Link href="/books"><Button variant="ghost">Continue shopping →</Button></Link>
          </div>

          <div className="text-xs text-slate-500">
            Demo note: Payment gateway and SMS/email notifications are not enabled.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
