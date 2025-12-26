"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, CardContent, Input } from "@/components/ui";
import { useToast } from "@/components/toast/ToastProvider";
import { formatBDT } from "@/lib/utils";

type Coupon = {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minSubtotal: number;
  maxDiscount: number | null;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  createdAt: string;
};

export default function AdminCouponsPage() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const { push } = useToast();

  const editingCoupon = useMemo(() => items.find((x) => x.code === editing) || null, [items, editing]);

  async function load() {
    setLoading(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/coupons");
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      setItems(j.coupons || []);
    } catch (e: any) {
      setMsg(e.message || "Failed");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const payload: any = {
      code: String(fd.get("code") || ""),
      type: String(fd.get("type") || "FIXED"),
      value: Number(fd.get("value") || 0),
      minSubtotal: Number(fd.get("minSubtotal") || 0),
      maxDiscount: fd.get("maxDiscount") ? Number(fd.get("maxDiscount")) : null,
      usageLimit: fd.get("usageLimit") ? Number(fd.get("usageLimit")) : null,
      active: fd.get("active") === "on",
    };
    try {
      const res = await fetch("/api/admin/coupons", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      push({ title: "Coupon created", tone: "success" });
      (e.currentTarget as HTMLFormElement).reset();
      await load();
    } catch (e: any) {
      setMsg(e.message || "Failed");
      push({ title: "Create failed", desc: e.message || "Failed", tone: "error" });
    }
  }

  async function toggleActive(c: Coupon) {
    try {
      const res = await fetch(`/api/admin/coupons/${encodeURIComponent(c.code)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ active: !c.active }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      await load();
    } catch (e: any) {
      push({ title: "Update failed", desc: e.message || "Failed", tone: "error" });
    }
  }

  async function remove(c: Coupon) {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${encodeURIComponent(c.code)}`, { method: "DELETE" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      push({ title: "Deleted", tone: "success" });
      await load();
    } catch (e: any) {
      push({ title: "Delete failed", desc: e.message || "Failed", tone: "error" });
    }
  }

  function fillEdit(c: Coupon) {
    setEditing(c.code);
    const form = document.getElementById("editForm") as HTMLFormElement | null;
    if (!form) return;
    (form.elements.namedItem("type") as HTMLSelectElement).value = c.type;
    (form.elements.namedItem("value") as HTMLInputElement).value = String(c.value);
    (form.elements.namedItem("minSubtotal") as HTMLInputElement).value = String(c.minSubtotal || 0);
    (form.elements.namedItem("maxDiscount") as HTMLInputElement).value = c.maxDiscount == null ? "" : String(c.maxDiscount);
    (form.elements.namedItem("usageLimit") as HTMLInputElement).value = c.usageLimit == null ? "" : String(c.usageLimit);
    (form.elements.namedItem("active") as HTMLInputElement).checked = !!c.active;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const payload: any = {
      type: String(fd.get("type") || "FIXED"),
      value: Number(fd.get("value") || 0),
      minSubtotal: Number(fd.get("minSubtotal") || 0),
      maxDiscount: fd.get("maxDiscount") ? Number(fd.get("maxDiscount")) : null,
      usageLimit: fd.get("usageLimit") ? Number(fd.get("usageLimit")) : null,
      active: fd.get("active") === "on",
    };

    try {
      const res = await fetch(`/api/admin/coupons/${encodeURIComponent(editing)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      push({ title: "Updated", tone: "success" });
      setEditing(null);
      (e.currentTarget as HTMLFormElement).reset();
      await load();
    } catch (e: any) {
      setMsg(e.message || "Failed");
      push({ title: "Update failed", desc: e.message || "Failed", tone: "error" });
    }
  }

  function cancelEdit() {
    setEditing(null);
    const form = document.getElementById("editForm") as HTMLFormElement | null;
    form?.reset();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge tone="dark">Admin</Badge>
            <h1 className="mt-2 text-2xl font-semibold">Coupons</h1>
            <p className="mt-2 text-sm text-slate-600">Create and manage promo codes.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin"><Button variant="secondary">Back</Button></Link>
            <Button onClick={load} disabled={loading}>{loading ? "Loading..." : "Reload"}</Button>
          </div>
        </div>
        {msg ? <div className="mt-3 text-sm text-rose-600">{msg}</div> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="text-lg font-semibold">Create coupon</div>
            <form onSubmit={create} className="mt-4 grid gap-2 md:grid-cols-2">
              <Input name="code" required placeholder="CODE (e.g., WELCOME50)" />
              <select name="type" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
                <option value="FIXED">FIXED</option>
                <option value="PERCENT">PERCENT</option>
              </select>
              <Input name="value" required type="number" placeholder="Value (৳ or %)" />
              <Input name="minSubtotal" type="number" placeholder="Min subtotal" />
              <Input name="maxDiscount" type="number" placeholder="Max discount (optional)" />
              <Input name="usageLimit" type="number" placeholder="Usage limit (optional)" />
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm md:col-span-2">
                <input id="activeNew" name="active" type="checkbox" defaultChecked className="h-4 w-4" />
                <label htmlFor="activeNew" className="font-semibold">Active</label>
              </div>
              <Button className="md:col-span-2">Create</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-semibold">Edit coupon</div>
              {editingCoupon ? <div className="text-sm font-semibold text-slate-700">{editingCoupon.code}</div> : <div className="text-sm text-slate-500">Select a coupon</div>}
            </div>
            <form id="editForm" onSubmit={saveEdit} className="mt-4 grid gap-2 md:grid-cols-2">
              <select name="type" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm md:col-span-2" defaultValue="FIXED" disabled={!editing}>
                <option value="FIXED">FIXED</option>
                <option value="PERCENT">PERCENT</option>
              </select>
              <Input name="value" required type="number" placeholder="Value" disabled={!editing} />
              <Input name="minSubtotal" type="number" placeholder="Min subtotal" disabled={!editing} />
              <Input name="maxDiscount" type="number" placeholder="Max discount" disabled={!editing} />
              <Input name="usageLimit" type="number" placeholder="Usage limit" disabled={!editing} />
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm md:col-span-2">
                <input id="activeEdit" name="active" type="checkbox" defaultChecked className="h-4 w-4" disabled={!editing} />
                <label htmlFor="activeEdit" className="font-semibold">Active</label>
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button disabled={!editing} className="flex-1">Save changes</Button>
                <Button type="button" variant="ghost" onClick={cancelEdit} disabled={!editing}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-lg font-semibold">All coupons</div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-slate-500">
                <tr>
                  <th className="py-2 pr-3">Code</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Value</th>
                  <th className="py-2 pr-3">Min</th>
                  <th className="py-2 pr-3">Used</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.code} className="border-t">
                    <td className="py-3 pr-3 font-semibold">{c.code}</td>
                    <td className="py-3 pr-3">{c.type}</td>
                    <td className="py-3 pr-3 font-semibold">{c.type === "PERCENT" ? `${c.value}%` : formatBDT(c.value)}</td>
                    <td className="py-3 pr-3">{formatBDT(c.minSubtotal || 0)}</td>
                    <td className="py-3 pr-3">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                    <td className="py-3 pr-3">{c.active ? <span className="font-semibold text-emerald-700">Active</span> : <span className="font-semibold text-slate-500">Inactive</span>}</td>
                    <td className="py-3 pr-3">
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" onClick={() => fillEdit(c)}>Edit</Button>
                        <Button type="button" variant="ghost" onClick={() => toggleActive(c)}>{c.active ? "Disable" : "Enable"}</Button>
                        <Button type="button" variant="danger" onClick={() => remove(c)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!items.length ? <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No coupons yet.</div> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
