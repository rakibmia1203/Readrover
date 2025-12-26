"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "./cart/CartProvider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";
import PromoBar from "@/components/PromoBar";
import { site } from "@/lib/site";

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const p = usePathname();
  const active = p === href || (href !== "/" && p.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "rounded-xl px-3 py-2 text-sm font-semibold transition",
        active ? "bg-brand-gradient text-white" : "text-slate-700 hover:bg-slate-100"
      )}
    >
      {label}
    </Link>
  );
}

function MenuItem({ href, title, desc, onClick }: { href: string; title: string; desc?: string; onClick?: () => void }) {
  const p = usePathname();
  const active = p === href || (href !== "/" && p.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group rounded-2xl border p-3 transition",
        active
          ? "border-[rgb(var(--accent-solid)/0.55)] bg-[rgb(var(--accent-soft)/0.65)]"
          : "border-[rgb(var(--border)/0.70)] bg-[rgb(var(--surface)/0.90)] hover:bg-[rgb(var(--surface))]"
      )}
    >
      <div className={cn("text-sm font-semibold", active ? "text-slate-900" : "text-slate-800")}>{title}</div>
      {desc ? <div className="mt-1 text-xs text-slate-600">{desc}</div> : null}
    </Link>
  );
}

function MenuSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="grid gap-2">{children}</div>
    </div>
  );
}

export default function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<null | "explore" | "orders" | "account" | "support">(null);
  const [me, setMe] = useState<{ name: string; role: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const menuWrapRef = useRef<HTMLDivElement>(null);

  const isAdmin = me?.role === "ADMIN";

  useEffect(() => {
    setActiveMenu(null);
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      const t = e.target as Node | null;
      if (!t) return;
      if (menuWrapRef.current && !menuWrapRef.current.contains(t)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => setMe(j.user ? { name: j.user.name, role: j.user.role } : null))
      .catch(() => {});
  }, []);

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setMe(null);
    router.push("/");
    router.refresh();
  }

  const menuBtnCls = useMemo(
    () =>
      cn(
        "rounded-xl px-3 py-2 text-sm font-semibold transition",
        "text-slate-700 hover:bg-slate-100",
        "inline-flex items-center gap-1"
      ),
    []
  );

  function MenuButton({ id, label }: { id: "explore" | "orders" | "account" | "support"; label: string }) {
    const on = activeMenu === id;
    return (
      <button
        type="button"
        className={cn(menuBtnCls, on ? "bg-slate-100" : "")}
        onClick={() => setActiveMenu((cur) => (cur === id ? null : id))}
        aria-expanded={on}
        aria-haspopup="menu"
      >
        {label}
        <span className={cn("text-xs transition", on ? "rotate-180" : "")} aria-hidden="true">
          ▾
        </span>
      </button>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-[rgb(var(--surface)/0.65)] backdrop-blur">
      <PromoBar className="bg-[rgb(var(--surface)/0.35)]" />
      <div className="border-b border-[rgb(var(--border)/0.65)]" />
      <div className="container flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-3 transition hover:scale-[1.01]">
          <Image src="/brand/readrover-mark.svg" alt="ReadRover" width={34} height={34} priority />
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-tight text-slate-900">{site.name}</div>
            <div className="hidden text-xs text-slate-600 md:block">{site.tagline}</div>
          </div>
        </Link>

        <nav ref={menuWrapRef} className="hidden items-center gap-1 md:flex">
          <NavLink href="/books" label="Shop" />
          <NavLink href="/collections" label="Collections" />

          {/* Explore */}
          <div className="relative">
            <MenuButton id="explore" label="Explore" />
            {activeMenu === "explore" ? (
              <div
                role="menu"
                className="absolute left-0 mt-2 w-[380px] rounded-3xl border border-[rgb(var(--border)/0.70)] bg-[rgb(var(--surface)/0.95)] p-3 shadow-soft backdrop-blur"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <MenuSection label="Personalized">
                    <MenuItem href="/discover" title="Discover" desc="Recently viewed + smart picks" />
                    <MenuItem href="/bookmatch" title="BookMatch" desc="Quiz-based recommendations" />
                    <MenuItem href="/recent" title="Recently viewed" desc="Continue where you left off" />
                  </MenuSection>
                  <MenuSection label="Browse">
                    <MenuItem href="/books" title="All books" desc="Search, filter, sort" />
                    <MenuItem href="/collections" title="Collections" desc="Curated shelves" />
                  </MenuSection>
                </div>
              </div>
            ) : null}
          </div>

          {/* Orders */}
          <div className="relative">
            <MenuButton id="orders" label="Orders" />
            {activeMenu === "orders" ? (
              <div
                role="menu"
                className="absolute left-0 mt-2 w-[360px] rounded-3xl border border-[rgb(var(--border)/0.70)] bg-[rgb(var(--surface)/0.95)] p-3 shadow-soft backdrop-blur"
              >
                <MenuSection label="Checkout">
                  <div className="grid gap-2 md:grid-cols-2">
                    <MenuItem href="/cart" title="Cart" desc="Review items & coupons" />
                    <MenuItem href="/track-order" title="Track order" desc="Order no + phone" />
                  </div>
                </MenuSection>
                {me ? (
                  <div className="mt-3">
                    <MenuSection label="History">
                      <MenuItem href="/dashboard" title="Dashboard" desc="Orders, profile, status" />
                    </MenuSection>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Account */}
          <div className="relative">
            <MenuButton id="account" label="Account" />
            {activeMenu === "account" ? (
              <div
                role="menu"
                className="absolute left-0 mt-2 w-[360px] rounded-3xl border border-[rgb(var(--border)/0.70)] bg-[rgb(var(--surface)/0.95)] p-3 shadow-soft backdrop-blur"
              >
                <MenuSection label="Saved">
                  <div className="grid gap-2 md:grid-cols-2">
                    <MenuItem href="/watchlist" title="Watchlist" desc="Price-drop alerts" />
                    <MenuItem href="/account/addresses" title="Addresses" desc="Saved delivery info" />
                    <MenuItem href="/account" title="My account" desc="Profile & settings" />
                  </div>
                </MenuSection>

                <div className="mt-3">
                  <MenuSection label="Access">
                    {me ? (
                      <div className="grid gap-2">
                        {isAdmin ? (
  <div className="grid gap-2 md:grid-cols-2">
    <MenuItem href="/admin" title="Admin home" desc="Quick actions" />
    <MenuItem href="/admin/orders" title="Orders" desc="Manage status" />
    <MenuItem href="/admin/books" title="Books" desc="Manage catalog" />
    <MenuItem href="/admin/analytics" title="Analytics" desc="Orders & revenue" />
    <MenuItem href="/admin/coupons" title="Coupons" desc="Promo codes" />
    <MenuItem href="/admin/inbox" title="Inbox" desc="Support messages" />
  </div>
) : null}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenu(null);
                            logout();
                          }}
                          className="rounded-2xl border border-[rgb(var(--border)/0.70)] bg-[rgb(var(--surface)/0.90)] p-3 text-left text-sm font-semibold transition hover:bg-[rgb(var(--surface))]"
                        >
                          Logout
                          <div className="mt-1 text-xs font-normal text-slate-600">End your current session</div>
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-2 md:grid-cols-2">
                        <MenuItem href="/login" title="Login" desc="Sign in to continue" />
                        <MenuItem href="/register" title="Sign up" desc="Create a new account" />
                      </div>
                    )}
                  </MenuSection>
                </div>
              </div>
            ) : null}
          </div>

          {/* Support */}
          <div className="relative">
            <MenuButton id="support" label="Support" />
            {activeMenu === "support" ? (
              <div
                role="menu"
                className="absolute left-0 mt-2 w-[320px] rounded-3xl border border-[rgb(var(--border)/0.70)] bg-[rgb(var(--surface)/0.95)] p-3 shadow-soft backdrop-blur"
              >
                <MenuSection label="Help">
                  <div className="grid gap-2">
                    <MenuItem href="/contact" title="Contact" desc="Get help or share feedback" />
                    <MenuItem href="/privacy" title="Privacy" desc="Policies & data" />
                    <MenuItem href="/terms" title="Terms" desc="Site terms" />
                    <MenuItem href="/faq" title="FAQ" desc="Common questions" />
                  </div>
                </MenuSection>
              </div>
            ) : null}
          </div>
        </nav>

        <div className="flex items-center gap-2 transition hover:scale-[1.01]">
          <Link
            href="/cart"
            className={cn(
              "relative rounded-xl border px-3 py-2 text-sm font-semibold transition",
              "border-[rgb(var(--border)/0.85)] bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface)/0.92)]"
            )}
          >
            Cart <span className="ml-2 rounded-full bg-[rgb(var(--accent-solid))] px-2 py-0.5 text-xs text-white">{count}</span>
          </Link>
          <ThemeSwitcher compact />

          <Button variant="secondary" className="md:hidden px-3" type="button" onClick={() => setOpen((v) => !v)}>
            ☰
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-[rgb(var(--border)/0.65)] bg-[rgb(var(--surface)/0.92)] backdrop-blur md:hidden">
          <div className="container flex flex-col gap-1 py-3">
            <div className="flex items-center justify-between rounded-xl px-3 py-2">
              <div className="text-sm font-semibold" style={{ color: "rgb(var(--muted))" }}>
                Theme
              </div>
              <ThemeSwitcher />
            </div>

            <div className="mt-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Browse</div>
            <NavLink href="/books" label="Shop" onClick={() => setOpen(false)} />
            <NavLink href="/collections" label="Collections" onClick={() => setOpen(false)} />

            <div className="mt-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Explore</div>
            <NavLink href="/discover" label="Discover" onClick={() => setOpen(false)} />
            <NavLink href="/bookmatch" label="BookMatch" onClick={() => setOpen(false)} />
            <Link
              href="/recent"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Recently viewed
            </Link>

            <div className="mt-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Orders</div>
            <NavLink href="/cart" label="Cart" onClick={() => setOpen(false)} />
            <NavLink href="/track-order" label="Track Order" onClick={() => setOpen(false)} />
            {me ? <NavLink href="/dashboard" label="Dashboard" onClick={() => setOpen(false)} /> : null}

            <div className="mt-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Account</div>
            <NavLink href="/watchlist" label="Watchlist" onClick={() => setOpen(false)} />
            <NavLink href="/account/addresses" label="Addresses" onClick={() => setOpen(false)} />
            <NavLink href="/account" label="My account" onClick={() => setOpen(false)} />
            {isAdmin ? (
              <>
                <NavLink href="/admin" label="Admin home" onClick={() => setOpen(false)} />
                <NavLink href="/admin/orders" label="Admin orders" onClick={() => setOpen(false)} />
                <NavLink href="/admin/books" label="Admin books" onClick={() => setOpen(false)} />
                <NavLink href="/admin/analytics" label="Admin analytics" onClick={() => setOpen(false)} />
                <NavLink href="/admin/coupons" label="Admin coupons" onClick={() => setOpen(false)} />
                <NavLink href="/admin/inbox" label="Admin inbox" onClick={() => setOpen(false)} />
              </>
            ) : null}

            {me ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Logout
              </button>
            ) : (
              <>
                <NavLink href="/login" label="Login" onClick={() => setOpen(false)} />
                <NavLink href="/register" label="Sign up" onClick={() => setOpen(false)} />
              </>
            )}

            <div className="mt-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Support</div>
            <NavLink href="/contact" label="Contact" onClick={() => setOpen(false)} />
            <NavLink href="/privacy" label="Privacy" onClick={() => setOpen(false)} />
            <NavLink href="/terms" label="Terms" onClick={() => setOpen(false)} />
            <NavLink href="/faq" label="FAQ" onClick={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </header>
  );
}
