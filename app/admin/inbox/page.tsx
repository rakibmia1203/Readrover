"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { useToast } from "@/components/toast/ToastProvider";

type Msg = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
  resolvedAt: string | null;
};

export default function AdminInboxPage() {
  const [items, setItems] = useState<Msg[]>([]);
  const [filterStatus, setFilterStatus] = useState<"ALL" | Msg["status"]>("ALL");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const { push } = useToast();

  async function load(s: typeof filterStatus = filterStatus) {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/inbox?status=${encodeURIComponent(s)}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      setItems(j.messages || []);
    } catch (e: any) {
      setMsg(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, next: Msg["status"]) {
    try {
      const res = await fetch("/api/admin/inbox", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messageId: id, status: next }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      push({ title: "Updated", tone: "success" });
      await load();
    } catch (e: any) {
      push({ title: "Failed", desc: e.message || "Failed", tone: "error" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge tone="dark">Admin</Badge>
            <h1 className="mt-2 text-2xl font-semibold">Support inbox</h1>
            <p className="mt-2 text-sm text-slate-600">Messages submitted from the Contact form.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin"><Button variant="secondary">Back</Button></Link>
            <Button onClick={() => load()} disabled={loading}>{loading ? "Loading..." : "Reload"}</Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => {
              const v = e.target.value as any;
              setFilterStatus(v);
              load(v);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="ALL">All</option>
            <option value="NEW">New</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
        {msg ? <div className="mt-3 text-sm text-rose-600">{msg}</div> : null}
      </div>

      {items.length ? (
        <div className="space-y-3">
          {items.map((m) => (
            <Card key={m.id}>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{m.subject}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      {m.name} • <a className="font-semibold hover:opacity-80" href={`mailto:${m.email}`}>{m.email}</a>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={m.status === "NEW" ? "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800" :
                      m.status === "IN_PROGRESS" ? "rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800" :
                        "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800"}>{m.status}</span>

                    <select
                      value={m.status}
                      onChange={(e) => updateStatus(m.id, e.target.value as any)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <option value="NEW">NEW</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm whitespace-pre-wrap">{m.message}</div>

                {m.resolvedAt ? (
                  <div className="mt-3 text-xs text-slate-500">Resolved at: {new Date(m.resolvedAt).toLocaleString()}</div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-sm text-slate-600">No messages found.</div>
      )}
    </div>
  );
}
