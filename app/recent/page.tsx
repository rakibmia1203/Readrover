"use client";

import { useEffect, useState } from "react";
import { getRecent } from "@/components/RecentView";
import { Card, CardContent, Badge } from "@/components/ui";
import Link from "next/link";

export default function RecentPage() {
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => setItems(getRecent()), []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Recently viewed</h1>
        <p className="mt-2 text-sm text-slate-600">Mobile-friendly quick return to items.</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-sm text-slate-600">No recently viewed items yet.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((slug) => (
            <Link key={slug} href={`/books/${slug}`}>
              <Card className="hover:shadow-md transition">
                <CardContent className="pt-6">
                  <Badge tone="indigo">Recently</Badge>
                  <div className="mt-2 text-sm font-semibold">{slug}</div>
                  <div className="mt-1 text-sm text-slate-600">Open →</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
