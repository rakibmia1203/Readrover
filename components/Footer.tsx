"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useToast } from "@/components/toast/ToastProvider";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

function Icon({ name, className }: { name: "twitter" | "github" | "facebook" | "mail"; className?: string }) {
  const paths = {
    twitter:
      "M18.6 4.4c-.7.3-1.4.5-2.2.6.8-.5 1.4-1.2 1.7-2.1-.7.4-1.5.8-2.4.9a3.7 3.7 0 0 0-6.4 2.5c0 .3 0 .6.1.8A10.6 10.6 0 0 1 2.2 3.2a3.7 3.7 0 0 0 1.1 5 3.6 3.6 0 0 1-1.7-.5v.1c0 1.8 1.3 3.4 3.1 3.7-.3.1-.7.1-1 .1-.2 0-.5 0-.7-.1.5 1.6 2 2.7 3.7 2.8A7.5 7.5 0 0 1 1 16.1a10.6 10.6 0 0 0 5.7 1.7c6.9 0 10.7-5.8 10.7-10.7v-.5c.7-.5 1.3-1.2 1.8-2z",
    github:
      "M10 1.2A8.8 8.8 0 0 0 7.2 18c.4.1.5-.2.5-.4v-1.6c-2 .4-2.4-.9-2.4-.9-.3-.8-.8-1-1-1-.9-.6.1-.6.1-.6 1 0 1.5 1 1.5 1 .8 1.5 2.2 1 2.7.8.1-.6.3-1 .6-1.2-1.6-.2-3.3-.8-3.3-3.6 0-.8.3-1.5.8-2-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.6 7.6 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.5 1.1.2 1.9.1 2.1.5.5.8 1.2.8 2 0 2.8-1.7 3.4-3.3 3.6.3.3.7.8.7 1.7v2.5c0 .2.1.5.5.4A8.8 8.8 0 0 0 10 1.2z",
    facebook:
      "M10 1.2A8.8 8.8 0 1 0 10 19.8 8.8 8.8 0 0 0 10 1.2zm1.1 9.2H9.8v6H7.6v-6H6.5V8.6h1.1V7.4c0-1.1.5-2.8 2.8-2.8h2V6.3h-1.4c-.2 0-.6.1-.6.7v1.6h2l-.2 1.8z",
    mail:
      "M2.5 5.3A2.3 2.3 0 0 1 4.8 3h10.4a2.3 2.3 0 0 1 2.3 2.3v9.4a2.3 2.3 0 0 1-2.3 2.3H4.8a2.3 2.3 0 0 1-2.3-2.3V5.3zm2.3-.5a.8.8 0 0 0-.8.8v.2l6 3.7 6-3.7v-.2a.8.8 0 0 0-.8-.8H4.8zm11.2 3.1-5.7 3.5a.8.8 0 0 1-.8 0L3.8 7.9v6.8c0 .4.4.8.8.8h10.4c.4 0 .8-.4.8-.8V7.9z",
  } as const;

  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={cn("h-5 w-5", className)}>
      <path d={paths[name]} />
    </svg>
  );
}

export default function Footer() {
  const { push } = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const year = useMemo(() => new Date().getFullYear(), []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = email.trim();
    if (!val || !val.includes("@")) {
      push({ title: "Enter a valid email", desc: "We’ll send occasional updates (no spam).", tone: "error" });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: val, source: "footer" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Subscription failed");
      push({
        title: data?.already ? "You’re already subscribed" : "Subscribed successfully",
        desc: "Thanks — you’ll get updates and offers.",
        tone: "success",
      });
      setEmail("");
    } catch (err: any) {
      push({ title: "Couldn’t subscribe", desc: err?.message ?? "Please try again.", tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <footer className="border-t border-slate-200/60 bg-white/70 backdrop-blur">
      <div className="h-[2px] w-full bg-brand-gradient" />

      <div className="container py-12">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-3">
              <Image src="/brand/readrover-mark.svg" alt={site.name} width={36} height={36} priority={false} />
              <div>
                <div className="text-sm font-extrabold tracking-tight text-slate-900">{site.name}</div>
                <div className="text-xs text-slate-600">{site.tagline}</div>
              </div>
            </div>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
              A modern online bookstore with conversion-focused UX: Discover, BookMatch, Watchlist, Coupons, and instant order tracking.
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-soft">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl bg-slate-900/5 p-2">
                  <Icon name="mail" className="text-slate-700" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">Get updates</div>
                  <div className="mt-1 text-sm text-slate-600">New arrivals, price drops, and occasional offers. No spam.</div>
                </div>
              </div>
              <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 w-full flex-1 rounded-xl border border-slate-200 bg-white/90 px-3 text-sm outline-none ring-brand-600/20 focus:ring-4"
                />
                <button
                  disabled={busy}
                  className={cn(
                    "relative inline-flex h-11 items-center justify-center rounded-xl bg-brand-gradient px-4 text-sm font-semibold text-white shadow-soft transition hover:opacity-95",
                    busy ? "opacity-70" : ""
                  )}
                >
                  <span className="btn-shine" aria-hidden="true" />
                  {busy ? "Subscribing…" : "Subscribe"}
                </button>
              </form>
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm text-slate-600">
              <a className="inline-flex items-center gap-2 hover:opacity-80" href="#" aria-label="Twitter">
                <Icon name="twitter" />
                <span className="hidden sm:inline">Twitter</span>
              </a>
              <a className="inline-flex items-center gap-2 hover:opacity-80" href="#" aria-label="GitHub">
                <Icon name="github" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
              <a className="inline-flex items-center gap-2 hover:opacity-80" href="#" aria-label="Facebook">
                <Icon name="facebook" />
                <span className="hidden sm:inline">Facebook</span>
              </a>
            </div>

            <div className="mt-3 text-xs text-slate-500">
              Support: <a className="hover:opacity-80" href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3">
            <div>
              <div className="text-sm font-semibold">Explore</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><Link className="hover:opacity-80" href="/books">Shop</Link></li>
                <li><Link className="hover:opacity-80" href="/collections">Collections</Link></li>
                <li><Link className="hover:opacity-80" href="/discover">Discover</Link></li>
                <li><Link className="hover:opacity-80" href="/bookmatch">BookMatch</Link></li>
                <li><Link className="hover:opacity-80" href="/recent">Recently viewed</Link></li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold">Orders</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><Link className="hover:opacity-80" href="/cart">Cart</Link></li>
                <li><Link className="hover:opacity-80" href="/track-order">Track order</Link></li>
                <li><Link className="hover:opacity-80" href="/watchlist">Watchlist</Link></li>
                <li><Link className="hover:opacity-80" href="/account">My account</Link></li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold">Support</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li><Link className="hover:opacity-80" href="/contact">Contact</Link></li>
                <li><Link className="hover:opacity-80" href="/privacy">Privacy</Link></li>
                <li><Link className="hover:opacity-80" href="/terms">Terms</Link></li>
                <li><Link className="hover:opacity-80" href="/faq">FAQ</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200/70 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-slate-500">© {year} {site.name}. Built with Next.js + Prisma. Payment gateway is not included.</div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
              Status: Online (local)
            </span>
            <span className="text-slate-300">•</span>
            <span>Bangladesh-ready COD flow</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
