"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, CardContent, Input } from "@/components/ui";
import BookCard, { type BookLite } from "@/components/BookCard";
import { getRecent } from "@/components/RecentView";

type BookWithTags = BookLite & { tags: string };

export default function DiscoverPage() {
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const [recentBooks, setRecentBooks] = useState<BookWithTags[] | null>(null);
  const [recoBooks, setRecoBooks] = useState<BookLite[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    const slugs = getRecent().slice(0, 12);
    setRecentSlugs(slugs);
  }, []);

  useEffect(() => {
    (async () => {
      if (recentSlugs.length === 0) {
        setRecentBooks([]);
        setRecoBooks([]);
        return;
      }

      try {
        const r = await fetch("/api/books/by-slugs", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ slugs: recentSlugs }),
        });
        const j = await r.json();
        const recents: BookWithTags[] = (j.books ?? []) as any;
        setRecentBooks(recents);

        const keywords = (() => {
          const ks: string[] = [];
          for (const b of recents.slice(0, 4)) {
            if (b.category) ks.push(b.category);
            const t = (b.tags ?? "").split(",").map((x) => x.trim()).filter(Boolean);
            if (t[0]) ks.push(t[0]);
          }
          // unique + short list
          return Array.from(new Set(ks.map((x) => x.toLowerCase()))).slice(0, 2);
        })();

        if (keywords.length === 0) {
          setRecoBooks([]);
          return;
        }

        const res = await Promise.all(
          keywords.map((k) => fetch(`/api/books?q=${encodeURIComponent(k)}`).then((x) => x.json()))
        );

        const all: BookLite[] = res.flatMap((x) => (x.books ?? []) as BookLite[]);
        const seen = new Set(recentSlugs);
        const uniq: BookLite[] = [];
        const used = new Set<string>();
        for (const b of all) {
          if (seen.has(b.slug)) continue;
          if (used.has(b.slug)) continue;
          used.add(b.slug);
          uniq.push(b);
          if (uniq.length >= 8) break;
        }
        setRecoBooks(uniq);
      } catch {
        setRecentBooks([]);
        setRecoBooks([]);
      }
    })();
  }, [recentSlugs]);

  const quickChips = useMemo(
    () => [
      { label: "Best sellers", href: "/books?sort=top" },
      { label: "New arrivals", href: "/books" },
      { label: "Bangla", href: "/books?q=bangla" },
      { label: "English", href: "/books?q=english" },
      { label: "Programming", href: "/books?q=programming" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <Badge tone="dark">Pro feature</Badge>
        <h1 className="mt-3 text-2xl font-semibold">Discover</h1>
        <p className="mt-2 text-sm text-slate-600">
          Recently viewed + smart picks. This is designed to reduce drop-offs and bring users back to purchase faster.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr,auto] md:items-center">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, author, tags…"
          />
          <Link href={q.trim() ? `/books?q=${encodeURIComponent(q.trim())}` : "/books"}>
            <Button className="w-full md:w-auto">Search</Button>
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickChips.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-lg font-semibold">Recently viewed</div>
              <div className="mt-1 text-sm text-slate-600">Quick return to items you opened.</div>
            </div>
            <Link href="/recent" className="text-sm font-semibold hover:opacity-80">View raw history →</Link>
          </div>

          {recentBooks === null ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[260px] rounded-2xl border border-slate-200/70 bg-white/60 animate-pulse" />
              ))}
            </div>
          ) : recentBooks.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-sm text-slate-600">
              No recent items yet. Browse the shop and open a few books — they will appear here automatically.
              <div className="mt-4">
                <Link href="/books"><Button>Browse books</Button></Link>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recentBooks.map((b) => (
                <BookCard key={b.id} b={b} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-lg font-semibold">Smart picks for you</div>
          <div className="mt-1 text-sm text-slate-600">Based on your recently viewed categories and tags.</div>

          {recoBooks === null ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[260px] rounded-2xl border border-slate-200/70 bg-white/60 animate-pulse" />
              ))}
            </div>
          ) : recoBooks.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-sm text-slate-600">
              Open a few books first to generate recommendations.
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recoBooks.map((b) => (
                <BookCard key={b.id} b={b} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
