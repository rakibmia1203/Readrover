"use client";

import { useState } from "react";
import { Button, Card, CardContent, Input, Badge } from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Login failed");
      router.push(next);
      router.refresh();
    } catch (e: any) {
      setMsg(e.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <Badge tone="dark">Account</Badge>
        <h1 className="mt-3 text-2xl font-semibold">Login</h1>
        <p className="mt-2 text-sm text-slate-600">Access your orders, addresses, and watchlist.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-3">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
            <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
            <Button className="w-full" disabled={loading}>{loading ? "Signing in..." : "Login"}</Button>
            {msg ? <div className="text-sm text-rose-600">{msg}</div> : null}
            <div className="text-sm text-slate-600">
              New here? <Link className="font-semibold hover:opacity-80" href="/register">Create an account</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
