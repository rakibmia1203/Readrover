"use client";

import { useState } from "react";
import { Button, Card, CardContent, Input, Badge } from "@/components/ui";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Registration failed");
      router.push("/account");
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
        <h1 className="mt-3 text-2xl font-semibold">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">A real account system (not a demo) with secure password hashing.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
            <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 8 chars)" type="password" required />
            <Button className="w-full" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
            {msg ? <div className="text-sm text-rose-600">{msg}</div> : null}
            <div className="text-sm text-slate-600">
              Already have an account? <Link className="font-semibold hover:opacity-80" href="/login">Login</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
