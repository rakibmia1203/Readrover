"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, Input, Textarea, Badge } from "@/components/ui";

export default function AdminPage() {
  const [msg, setMsg] = useState<string | null>(null);

  async function addBook(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const payload: any = Object.fromEntries(fd.entries());
    payload.price = Number(payload.price);
    payload.salePrice = payload.salePrice ? Number(payload.salePrice) : null;
    payload.stock = Number(payload.stock);

    const res = await fetch("/api/admin/books", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) { setMsg(data?.error || "Failed"); return; }
    setMsg("Book created.");
    (e.currentTarget as HTMLFormElement).reset();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge tone="dark">Admin</Badge>
            <h1 className="mt-2 text-2xl font-semibold">Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">Manage catalog and orders.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/orders"><Button variant="secondary">Manage orders</Button></Link>
            <Link href="/admin/books"><Button variant="secondary">Manage books</Button></Link>
            <Button variant="danger" onClick={logout} type="button">Logout</Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold">Add book</h2>
          <form onSubmit={addBook} className="mt-4 grid gap-2 md:grid-cols-2">
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
            <Button className="md:col-span-2">Create</Button>
          </form>

          {msg ? <div className="mt-3 text-sm text-slate-700">{msg}</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}
