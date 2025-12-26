"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Card, CardContent, Input, Badge } from "@/components/ui";
import { formatBDT } from "@/lib/utils";

export default function WatchlistClient({
  initialItems,
  initialEmail,
  loggedIn,
}: {
  initialItems: any[];
  initialEmail: string;
  loggedIn: boolean;
}) {
  const search = useSearchParams();
  const didAutoLoad = useRef(false);
  const [email, setEmail] = useState(initialEmail);
  const [items, setItems] = useState<any[]>(initialItems);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // UX improvements:
  // 1) If redirected here after clicking “Watch this book”, show a confirmation message.
  // 2) If the user is not logged in and we have an email in the URL, auto-load the list.
  useEffect(() => {
    const added = search.get("added");
    const qEmail = search.get("email");
    if (added) setMsg("Added to your watchlist.");

    if (!loggedIn && !didAutoLoad.current && qEmail) {
      didAutoLoad.current = true;
      setEmail(qEmail);
      // Auto-load only if we don't already have items.
      if (items.length === 0) {
        void (async () => {
          try {
            setLoading(true);
            const q = new URLSearchParams();
            q.set("email", qEmail);
            const res = await fetch(`/api/watchlist/list?${q.toString()}`);
            const j = await res.json();
            if (!res.ok) throw new Error(j?.error || "Failed");
            setItems(j.items || []);
            if (!(j.items || []).length) setMsg("No watchlist items found.");
          } catch (e: any) {
            setMsg(e.message || "Error");
          } finally {
            setLoading(false);
          }
        })();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, loggedIn]);

  async function load() {
    setMsg(null);
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (!loggedIn) q.set("email", email);
      const res = await fetch(`/api/watchlist/list?${q.toString()}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      setItems(j.items || []);
      if (!(j.items || []).length) setMsg("No watchlist items found.");
    } catch (e: any) {
      setMsg(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  async function remove(bookId: string) {
    try {
      const res = await fetch("/api/watchlist/remove", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bookId, ...(loggedIn ? {} : { email }) }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      setItems((prev) => prev.filter((x) => x.bookId !== bookId));
    } catch (e: any) {
      setMsg(e.message || "Error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <Badge tone="dark">Watchlist</Badge>
        <h1 className="mt-2 text-2xl font-semibold">Price-drop alerts</h1>
        <p className="mt-2 text-sm text-slate-600">
          Save books you want to monitor. Later you can plug in email notifications.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {!loggedIn ? (
            <div className="grid gap-2 md:grid-cols-[1fr,180px]">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email used in watchlist" />
              <Button variant="secondary" onClick={load} disabled={loading || !email}>{loading ? "Loading..." : "Load"}</Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-slate-600">Showing items for your account.</div>
              <Button variant="secondary" onClick={load} disabled={loading}>{loading ? "Refreshing..." : "Refresh"}</Button>
            </div>
          )}

          {msg ? (
            <div className={`text-sm ${msg.toLowerCase().includes("added") ? "text-emerald-700" : "text-rose-600"}`}>
              {msg}
            </div>
          ) : null}

          {items.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Nothing saved yet. Browse <Link className="font-semibold" href="/books">books</Link> and click “Watch this book”.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it) => (
                <div key={it.id} className="rounded-2xl border border-slate-200/70 bg-white/80 p-4">
                  <Link href={`/books/${it.book.slug}`} className="block">
                    <div className="text-sm font-semibold line-clamp-2">{it.book.title}</div>
                    <div className="mt-2 text-sm font-semibold">{formatBDT(it.book.salePrice ?? it.book.price)}</div>
                    <div className="mt-1 text-xs text-slate-500">Saved: {new Date(it.createdAt).toLocaleDateString()}</div>
                  </Link>
                  <div className="mt-3">
                    <Button variant="secondary" onClick={() => remove(it.bookId)} type="button">Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
