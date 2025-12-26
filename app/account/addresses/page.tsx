"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, CardContent, Input, Textarea } from "@/components/ui";
import { useToast } from "@/components/toast/ToastProvider";

type Address = {
  id: string;
  label: string | null;
  phone: string;
  address: string;
  city: string | null;
  isDefault: boolean;
  createdAt: string;
};

export default function AddressesPage() {
  const [items, setItems] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const { push } = useToast();

  const editing = useMemo(() => items.find((x) => x.id === editingId) || null, [items, editingId]);

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/addresses");
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      setItems(j.addresses || []);
    } catch (e: any) {
      setMsg(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setMsg(null);

  const formEl = e.currentTarget;           // ✅ capture now (before any await)
  const fd = new FormData(formEl);

  const payload = {
    label: (String(fd.get("label") || "").trim() || null),
    phone: String(fd.get("phone") || "").trim(),
    address: String(fd.get("address") || "").trim(),
    city: (String(fd.get("city") || "").trim() || null),
    isDefault: fd.get("isDefault") === "on",
  };

  try {
    const url = editingId ? `/api/addresses/${editingId}` : "/api/addresses";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || "Failed");

    push({ title: editingId ? "Address updated" : "Address added", tone: "success" });

    setEditingId(null);

    // ✅ safe reset (won't crash)
    formEl.reset();

    // ✅ reload list; if reload fails, don't mark save as failed
    try {
      await load();
    } catch {
      // optional: push({ title: "Saved, but refresh failed", tone: "warning" });
    }
  } catch (err: any) {
    setMsg(err.message || "Failed");
    push({ title: "Save failed", desc: err.message || "Failed", tone: "error" });
  }
}


  async function remove(id: string) {
    if (!confirm("Delete this address?")) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      push({ title: "Deleted", tone: "success" });
      await load();
    } catch (e: any) {
      push({ title: "Delete failed", desc: e.message || "Failed", tone: "error" });
    }
  }

  async function makeDefault(id: string) {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      push({ title: "Default address updated", tone: "success" });
      await load();
    } catch (e: any) {
      push({ title: "Failed", desc: e.message || "Failed", tone: "error" });
    }
  }

  function startEdit(a: Address) {
    setEditingId(a.id);
    // Fill form by setting input default values via DOM (simple)
    const form = document.getElementById("addrForm") as HTMLFormElement | null;
    if (!form) return;
    (form.elements.namedItem("label") as HTMLInputElement).value = a.label || "";
    (form.elements.namedItem("phone") as HTMLInputElement).value = a.phone || "";
    (form.elements.namedItem("address") as HTMLTextAreaElement).value = a.address || "";
    (form.elements.namedItem("city") as HTMLInputElement).value = a.city || "";
    (form.elements.namedItem("isDefault") as HTMLInputElement).checked = !!a.isDefault;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    const form = document.getElementById("addrForm") as HTMLFormElement | null;
    form?.reset();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge tone="dark">Account</Badge>
            <h1 className="mt-2 text-2xl font-semibold">Addresses</h1>
            <p className="mt-2 text-sm text-slate-600">Save delivery addresses for faster checkout.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/account"><Button variant="secondary">Back</Button></Link>
            <Button onClick={load} disabled={loading}>{loading ? "Loading..." : "Reload"}</Button>
          </div>
        </div>
        {msg ? <div className="mt-3 text-sm text-rose-600">{msg}</div> : null}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-semibold">{editingId ? "Edit address" : "Add new address"}</div>
            {editingId ? <Button type="button" variant="ghost" onClick={resetForm}>Cancel edit</Button> : null}
          </div>

          <form id="addrForm" onSubmit={save} className="mt-4 grid gap-2 md:grid-cols-2">
            <Input name="label" placeholder="Label (Home/Office)" />
            <Input name="phone" required placeholder="Phone" />
            <Input name="city" placeholder="City (optional)" />
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm">
              <input id="isDefault" name="isDefault" type="checkbox" className="h-4 w-4" />
              <label htmlFor="isDefault" className="font-semibold">Make default</label>
            </div>
            <Textarea name="address" required placeholder="Full address" className="min-h-[110px] md:col-span-2" />
            <Button className="md:col-span-2">{editingId ? "Update address" : "Save address"}</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((a) => (
          <Card key={a.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{a.label || "Address"}{a.isDefault ? <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">Default</span> : null}</div>
                  <div className="mt-1 text-sm text-slate-600">{a.phone}</div>
                </div>
                <div className="flex gap-2">
                  {!a.isDefault ? <Button type="button" variant="secondary" onClick={() => makeDefault(a.id)}>Set default</Button> : null}
                  <Button type="button" variant="ghost" onClick={() => startEdit(a)}>Edit</Button>
                  <Button type="button" variant="danger" onClick={() => remove(a.id)}>Delete</Button>
                </div>
              </div>
              <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm">
                {a.address}{a.city ? `, ${a.city}` : ""}
              </div>
            </CardContent>
          </Card>
        ))}
        {!items.length ? (
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-sm text-slate-600">
            No saved addresses yet. Add one above.
          </div>
        ) : null}
      </div>
    </div>
  );
}
