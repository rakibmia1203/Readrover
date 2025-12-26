"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge, Button, Card, CardContent, Input, Textarea } from "@/components/ui";
import { useToast } from "@/components/toast/ToastProvider";
import { formatBDT } from "@/lib/utils";

type BookRow = {
  id: string;
  slug: string;
  title: string;
  author: string;
  publisher: string | null;
  language: string;
  category: string;
  tags: string;
  description: string;
  price: number;
  salePrice: number | null;
  stock: number;
  coverUrl: string | null;
  active: boolean;
  updatedAt: string;
};

function calcOff(price: number, salePrice: number | null) {
  if (!salePrice) return 0;
  if (salePrice >= price) return 0;
  return Math.round((1 - salePrice / price) * 100);
}

function num(v: FormDataEntryValue | null) {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export default function AdminBooksPage() {
  const toast = useToast();
  const [books, setBooks] = useState<BookRow[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "all">("active");
  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [edit, setEdit] = useState<BookRow | null>(null);

  async function load(nextQ?: string, nextStatus?: typeof status) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const qq = (nextQ ?? q).trim();
      const ss = (nextStatus ?? status).trim();
      if (qq) params.set("q", qq);
      params.set("status", ss);
      const res = await fetch(`/api/admin/books?${params.toString()}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to load books");
      setBooks(j.books || []);
    } catch (e: any) {
      toast.push({ title: "Could not load books", desc: e.message || "Error", tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return books;
    return books.filter((b) =>
      `${b.title} ${b.author} ${b.slug} ${b.category} ${b.tags}`.toLowerCase().includes(qq)
    );
  }, [books, q]);

  async function createBook(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const payload: any = {
      slug: String(fd.get("slug") || "").trim(),
      title: String(fd.get("title") || "").trim(),
      author: String(fd.get("author") || "").trim(),
      publisher: String(fd.get("publisher") || "").trim() || null,
      language: String(fd.get("language") || "Bangla").trim() || "Bangla",
      category: String(fd.get("category") || "").trim(),
      tags: String(fd.get("tags") || "").trim(),
      description: String(fd.get("description") || "").trim(),
      price: Number(fd.get("price") || 0),
      salePrice: num(fd.get("salePrice")) as any,
      stock: Number(fd.get("stock") || 0),
      coverUrl: String(fd.get("coverUrl") || "").trim() || null,
      active: true,
    };

    // Normalize salePrice
    if (payload.salePrice != null && payload.salePrice >= payload.price) payload.salePrice = null;

    try {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Create failed");
      toast.push({ title: "Book created", tone: "success" });
      setShowAdd(false);
      (e.currentTarget as HTMLFormElement).reset();
      await load("", status);
    } catch (e: any) {
      toast.push({ title: "Create failed", desc: e.message || "Error", tone: "error" });
    }
  }

  async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!edit) return;

    const fd = new FormData(e.currentTarget);
    const payload: any = {
      slug: String(fd.get("slug") || "").trim(),
      title: String(fd.get("title") || "").trim(),
      author: String(fd.get("author") || "").trim(),
      publisher: String(fd.get("publisher") || "").trim() || null,
      language: String(fd.get("language") || "Bangla").trim() || "Bangla",
      category: String(fd.get("category") || "").trim(),
      tags: String(fd.get("tags") || "").trim(),
      description: String(fd.get("description") || "").trim(),
      price: Number(fd.get("price") || 0),
      salePrice: num(fd.get("salePrice")),
      stock: Number(fd.get("stock") || 0),
      coverUrl: String(fd.get("coverUrl") || "").trim() || null,
    };

    if (payload.salePrice != null && payload.salePrice >= payload.price) payload.salePrice = null;

    try {
      const res = await fetch(`/api/admin/books/${edit.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Update failed");
      toast.push({ title: "Book updated", tone: "success" });
      setEdit(null);
      await load("", status);
    } catch (e: any) {
      toast.push({ title: "Update failed", desc: e.message || "Error", tone: "error" });
    }
  }

  async function toggleActive(b: BookRow) {
    try {
      const res = await fetch(`/api/admin/books/${b.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ active: !b.active }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      toast.push({ title: b.active ? "Book deactivated" : "Book activated", tone: "success" });
      await load("", status);
    } catch (e: any) {
      toast.push({ title: "Action failed", desc: e.message || "Error", tone: "error" });
    }
  }

  async function deleteBook(b: BookRow) {
    const ok = window.confirm(`Delete “${b.title}”? This cannot be undone.`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/books/${b.id}`, { method: "DELETE" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Delete failed");
      toast.push({ title: "Book deleted", tone: "success" });
      await load("", status);
    } catch (e: any) {
      toast.push({ title: "Delete failed", desc: e.message || "Error", tone: "error" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge tone="dark">Admin</Badge>
            <h1 className="mt-2 text-2xl font-semibold">Manage books</h1>
            <p className="mt-2 text-sm text-slate-600">Add, edit, discount, activate/deactivate, or delete books.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin"><Button variant="secondary">Back to admin</Button></Link>
            <Button variant="secondary" onClick={() => load()} disabled={loading}>{loading ? "Loading..." : "Reload"}</Button>
            <Button onClick={() => setShowAdd(true)}>Add book</Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr,auto]">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: title, author, slug, tags, category"
          />
          <div className="flex flex-wrap gap-2">
            {([
              ["active", "Active"],
              ["inactive", "Inactive"],
              ["all", "All"],
            ] as const).map(([k, label]) => (
              <Button
                key={k}
                variant={status === k ? "primary" : "secondary"}
                onClick={() => {
                  setStatus(k);
                  load(q, k);
                }}
                type="button"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-600">Showing <b>{filtered.length}</b> books</div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {filtered.length === 0 ? (
            <div className="text-sm text-slate-600">No books found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200/70 text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-3 pr-3">Book</th>
                    <th className="py-3 pr-3">Pricing</th>
                    <th className="py-3 pr-3">Stock</th>
                    <th className="py-3 pr-3">Status</th>
                    <th className="py-3 pr-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => {
                    const off = calcOff(b.price, b.salePrice);
                    const finalPrice = b.salePrice ?? b.price;
                    return (
                      <tr key={b.id} className="border-b border-slate-100">
                        <td className="py-4 pr-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-14 w-10 overflow-hidden rounded-lg bg-slate-100">
                              <Image
                                src={b.coverUrl ?? "/placeholder-cover.svg"}
                                alt={b.title}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-[240px]">
                              <div className="font-semibold line-clamp-1">{b.title}</div>
                              <div className="text-xs text-slate-600 line-clamp-1">{b.author} • {b.category} • {b.language}</div>
                              <div className="mt-1 text-[11px] text-slate-500">slug: <span className="font-mono">{b.slug}</span></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-3">
                          <div className="font-semibold">{formatBDT(finalPrice)}</div>
                          {b.salePrice ? (
                            <div className="text-xs text-slate-500">
                              <span className="line-through mr-2">{formatBDT(b.price)}</span>
                              {off > 0 ? <Badge tone="dark">{off}% OFF</Badge> : null}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500">No discount</div>
                          )}
                        </td>
                        <td className="py-4 pr-3">
                          <div className="font-semibold">{b.stock}</div>
                          {b.stock <= 5 ? <div className="text-xs text-rose-600">Low stock</div> : <div className="text-xs text-slate-500">OK</div>}
                        </td>
                        <td className="py-4 pr-3">
                          {b.active ? <Badge tone="indigo">Active</Badge> : <Badge tone="amber">Inactive</Badge>}
                        </td>
                        <td className="py-4 pr-3">
                          <div className="flex flex-wrap gap-2">
                            <Button variant="secondary" type="button" onClick={() => setEdit(b)}>Edit</Button>
                            <Button variant={b.active ? "secondary" : "primary"} type="button" onClick={() => toggleActive(b)}>
                              {b.active ? "Deactivate" : "Activate"}
                            </Button>
                            <Button variant="danger" type="button" onClick={() => deleteBook(b)}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add modal */}
      {showAdd ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAdd(false)} />
          <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200/70 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-lg font-semibold">Add new book</div>
                <div className="mt-1 text-sm text-slate-600">Create a new catalog item with optional discount.</div>
              </div>
              <Button variant="secondary" type="button" onClick={() => setShowAdd(false)}>Close</Button>
            </div>

            <form onSubmit={createBook} className="mt-4 grid gap-2 md:grid-cols-2">
              <Input name="slug" required placeholder="slug (unique)" />
              <Input name="title" required placeholder="title" />
              <Input name="author" required placeholder="author" />
              <Input name="publisher" placeholder="publisher" />
              <Input name="language" defaultValue="Bangla" placeholder="language" />
              <Input name="category" required placeholder="category" />
              <Input name="tags" required placeholder="tags (comma separated)" className="md:col-span-2" />
              <Textarea name="description" required placeholder="description" className="min-h-[110px] md:col-span-2" />
              <Input name="price" required type="number" placeholder="price (BDT)" />
              <Input name="salePrice" type="number" placeholder="salePrice (optional)" />
              <Input name="stock" required type="number" placeholder="stock" />
              <Input name="coverUrl" placeholder="cover image URL" className="md:col-span-2" />

              <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-600">
                  Discount is calculated automatically: <b>(price - salePrice) / price</b>.
                  <div className="mt-1 text-[11px] text-slate-500">Tip: If salePrice ≥ price, salePrice will be cleared.</div>
                </div>
                <Button>Create</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Edit modal */}
      {edit ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEdit(null)} />
          <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200/70 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-lg font-semibold">Edit book</div>
                <div className="mt-1 text-sm text-slate-600">Update price, discount, stock, and details.</div>
              </div>
              <Button variant="secondary" type="button" onClick={() => setEdit(null)}>Close</Button>
            </div>

            <form onSubmit={saveEdit} className="mt-4 grid gap-2 md:grid-cols-2">
              <Input name="slug" required defaultValue={edit.slug} placeholder="slug (unique)" />
              <Input name="title" required defaultValue={edit.title} placeholder="title" />
              <Input name="author" required defaultValue={edit.author} placeholder="author" />
              <Input name="publisher" defaultValue={edit.publisher ?? ""} placeholder="publisher" />
              <Input name="language" defaultValue={edit.language} placeholder="language" />
              <Input name="category" required defaultValue={edit.category} placeholder="category" />
              <Input name="tags" required defaultValue={edit.tags} placeholder="tags (comma separated)" className="md:col-span-2" />
              <Textarea name="description" required defaultValue={edit.description} placeholder="description" className="min-h-[110px] md:col-span-2" />
              <Input name="price" required type="number" defaultValue={edit.price} placeholder="price (BDT)" />
              <Input name="salePrice" type="number" defaultValue={edit.salePrice ?? ""} placeholder="salePrice (optional)" />
              <Input name="stock" required type="number" defaultValue={edit.stock} placeholder="stock" />
              <Input name="coverUrl" defaultValue={edit.coverUrl ?? ""} placeholder="cover image URL" className="md:col-span-2" />

              <div className="md:col-span-2 grid gap-2 rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                <div className="text-sm font-semibold">Discount preview</div>
                <div className="text-sm text-slate-700">
                  Current: <b>{formatBDT(edit.salePrice ?? edit.price)}</b>
                  {edit.salePrice ? <span className="ml-2 text-slate-500 line-through">{formatBDT(edit.price)}</span> : null}
                  {edit.salePrice ? <span className="ml-2"><Badge tone="dark">{calcOff(edit.price, edit.salePrice)}% OFF</Badge></span> : null}
                </div>
                <div className="text-[11px] text-slate-500">After saving, the table will refresh with new % OFF automatically.</div>
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
                <Button variant="secondary" type="button" onClick={() => setEdit(null)}>Cancel</Button>
                <Button>Save changes</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
