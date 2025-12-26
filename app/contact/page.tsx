"use client";

import { useState } from "react";
import { Badge, Button, Card, CardContent, Input, Textarea } from "@/components/ui";
import { site } from "@/lib/site";
import { useToast } from "@/components/toast/ToastProvider";

export default function ContactPage() {
  const { push } = useToast();
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      subject: String(fd.get("subject") || ""),
      message: String(fd.get("message") || ""),
    };

    setSending(true);
    try {
      const res = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed");
      setMsg("Message sent. Our team will reply as soon as possible.");
      push({ title: "Sent", desc: "Thanks for reaching out.", tone: "success" });
      (e.currentTarget as HTMLFormElement).reset();
    } catch (err: any) {
      setMsg(err.message || "Failed");
      push({ title: "Failed", desc: err.message || "Failed", tone: "error" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <Badge tone="dark">Support</Badge>
        <h1 className="mt-3 text-2xl font-semibold">Contact</h1>
        <p className="mt-2 text-sm text-slate-600">For help with orders, shipping, returns, or feedback.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr,360px]">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold">Send a message</h2>
            <p className="mt-2 text-sm text-slate-600">We typically respond within business hours.</p>

            <form onSubmit={submit} className="mt-4 space-y-2">
              <div className="grid gap-2 md:grid-cols-2">
                <Input name="name" required placeholder="Your name" />
                <Input name="email" required type="email" placeholder="Email" />
              </div>
              <Input name="subject" required placeholder="Subject" />
              <Textarea name="message" required placeholder="Write your message..." className="min-h-[140px]" />
              <Button disabled={sending} className="w-full">{sending ? "Sending..." : "Send"}</Button>
              {msg ? <div className="mt-2 text-sm text-slate-700">{msg}</div> : null}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-3 text-sm">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</div>
              <div className="mt-1 font-semibold">{site.supportEmail}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Working hours</div>
              <div className="mt-1">10:00–20:00 (Sat–Thu)</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</div>
              <div className="mt-1">Dhaka, Bangladesh</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
              Tip: Include your <span className="font-semibold">order number</span> for faster support.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
