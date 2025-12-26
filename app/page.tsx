import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BookCard from "@/components/BookCard";
import BannerCarousel from "@/components/BannerCarousel";
import OfferTimer from "@/components/OfferTimer";
import SearchBar from "@/components/SearchBar";
import { Badge, Card, CardContent } from "@/components/ui";
import { site } from "@/lib/site";

// Cache the homepage HTML for 60s in production to avoid repeated DB reads.
export const revalidate = 60;

export default async function HomePage() {
  const [featured, newest, sale, bookCount, reviewCount, cats, langs] = await Promise.all([
    prisma.book.findMany({
      where: { active: true },
      orderBy: [{ ratingAvg: "desc" }, { ratingCount: "desc" }],
      take: 8,
      select: { id: true, slug: true, title: true, author: true, category: true, language: true, price: true, salePrice: true, coverUrl: true, ratingAvg: true, ratingCount: true },
    }),
    prisma.book.findMany({
      where: { active: true },
      orderBy: [{ createdAt: "desc" }],
      take: 4,
      select: { id: true, slug: true, title: true, author: true, category: true, language: true, price: true, salePrice: true, coverUrl: true, ratingAvg: true, ratingCount: true },
    }),
    prisma.book.findMany({
      where: { active: true, salePrice: { not: null } },
      orderBy: [{ ratingAvg: "desc" }, { ratingCount: "desc" }],
      take: 4,
      select: { id: true, slug: true, title: true, author: true, category: true, language: true, price: true, salePrice: true, coverUrl: true, ratingAvg: true, ratingCount: true },
    }),
    prisma.book.count({ where: { active: true } }),
    prisma.review.count(),
    prisma.book.findMany({ where: { active: true }, select: { category: true }, distinct: ["category"] }),
    prisma.book.findMany({ where: { active: true }, select: { language: true }, distinct: ["language"] }),
  ]);

  const topCats = cats
    .map((c) => c.category)
    .filter(Boolean)
    .slice(0, 10);

  const topLangs = langs
    .map((l) => l.language)
    .filter(Boolean)
    .slice(0, 6);

  return (
    <div className="space-y-12">
      {/* Premium hero */}
      <section className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <div
          className="relative overflow-hidden rounded-3xl border border-[rgb(var(--border)/0.70)] bg-[rgb(var(--surface)/0.80)] p-6 shadow-soft backdrop-blur md:p-10"
          style={{
            backgroundImage: "url(/brand/readrover-hero.svg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-white/35" />
          <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-brand-gradient-soft blur-2xl opacity-70 animate-floatSlow" />
          <div className="pointer-events-none absolute -bottom-28 -left-28 h-96 w-96 rounded-full bg-brand-gradient-soft blur-2xl opacity-55 animate-float" />

          <div className="relative space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="indigo">Smart picks</Badge>
              <Badge tone="pink">Watchlist alerts</Badge>
              <Badge tone="amber">Instant tracking</Badge>
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {site.name}: {site.tagline}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
                Search and filter instantly, use BookMatch to get recommendations, save books to your watchlist, apply coupons, and track orders with order number + phone.
              </p>
            </div>

            <div className="max-w-xl">
              <SearchBar placeholder="Search books: title, author, tags..." />
              <div className="mt-2 text-xs text-slate-600">Tip: try searching “AI”, “NLP”, “Operating System”, or an author name.</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/books"
                className="relative inline-flex items-center justify-center rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:opacity-95"
              >
                Browse books
                <span className="btn-shine" aria-hidden="true" />
              </Link>
              <Link
                href="/discover"
                className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition border-[rgb(var(--border)/0.85)] bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface)/0.92)]"
              >
                Open Discover
              </Link>
              <Link
                href="/track-order"
                className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition border-[rgb(var(--border)/0.85)] bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface)/0.92)]"
              >
                Track order
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[rgb(var(--border)/0.70)] bg-[rgb(var(--surface)/0.92)] p-4">
                <div className="text-xs font-semibold text-slate-500">Books</div>
                <div className="mt-1 text-2xl font-bold">{bookCount}</div>
                <div className="mt-1 text-xs text-slate-600">Available in catalog</div>
              </div>
              <div className="rounded-2xl border border-[rgb(var(--border)/0.70)] bg-[rgb(var(--surface)/0.92)] p-4">
                <div className="text-xs font-semibold text-slate-500">Reviews</div>
                <div className="mt-1 text-2xl font-bold">{reviewCount}</div>
                <div className="mt-1 text-xs text-slate-600">Verified customer feedback</div>
              </div>
              <div className="rounded-2xl border border-[rgb(var(--border)/0.70)] bg-[rgb(var(--surface)/0.92)] p-4">
                <div className="text-xs font-semibold text-slate-500">Languages</div>
                <div className="mt-1 text-2xl font-bold">{topLangs.length}</div>
                <div className="mt-1 text-xs text-slate-600">Multi-language support</div>
              </div>
            </div>

            {topCats.length ? (
              <div className="pt-2">
                <div className="text-xs font-semibold text-slate-500">Popular categories</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {topCats.map((c) => (
                    <Link
                      key={c}
                      href={`/books?category=${encodeURIComponent(c)}`}
                      className="rounded-full border border-[rgb(var(--border)/0.75)] bg-[rgb(var(--surface))] px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-[rgb(var(--surface)/0.92)]"
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <BannerCarousel />

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge tone="dark">Limited time</Badge>
                  <div className="mt-2 text-sm font-semibold">Flash sale countdown</div>
                  <p className="mt-1 text-sm text-slate-600">Clear deals, fast checkout, and instant order tracking.</p>
                </div>
              </div>
              <div className="mt-4">
                <OfferTimer />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feature blocks */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <Badge tone="indigo">Discover</Badge>
            <div className="mt-2 text-sm font-semibold">Return visits built-in</div>
            <p className="mt-2 text-sm text-slate-600">Recently viewed + smart picks based on browsing. Helps users buy faster.</p>
            <Link href="/discover" className="mt-3 inline-block text-sm font-semibold hover:opacity-80">Open Discover →</Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Badge tone="pink">BookMatch</Badge>
            <div className="mt-2 text-sm font-semibold">Recommendations without noise</div>
            <p className="mt-2 text-sm text-slate-600">Quiz-style matching reduces search friction and improves product discovery.</p>
            <Link href="/bookmatch" className="mt-3 inline-block text-sm font-semibold hover:opacity-80">Start quiz →</Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Badge tone="amber">Tracking</Badge>
            <div className="mt-2 text-sm font-semibold">Track orders instantly</div>
            <p className="mt-2 text-sm text-slate-600">Order number + phone lookup. Works even without account sign-in.</p>
            <Link href="/track-order" className="mt-3 inline-block text-sm font-semibold hover:opacity-80">Track now →</Link>
          </CardContent>
        </Card>
      </section>

      {/* Flash sale */}
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold">Flash sale</h2>
          <Link href="/books?sort=top" className="text-sm text-slate-600 hover:opacity-80">See more →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sale.map((b) => <BookCard key={b.id} b={b} />)}
        </div>
      </section>

      {/* Top picks */}
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold">Top picks</h2>
          <Link href="/books?sort=top" className="text-sm text-slate-600 hover:opacity-80">View all →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((b) => <BookCard key={b.id} b={b} />)}
        </div>
      </section>

      {/* New arrivals */}
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold">New arrivals</h2>
          <Link href="/books" className="text-sm text-slate-600 hover:opacity-80">Browse →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {newest.map((b) => <BookCard key={b.id} b={b} />)}
        </div>
      </section>

      {/* How it works + testimonial */}
      <section className="grid gap-4 lg:grid-cols-[1fr,0.9fr]">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">How it works</div>
                <p className="mt-1 text-sm text-slate-600">A clean funnel: discover → save → checkout → track.</p>
              </div>
              <Badge>Fast</Badge>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                { t: "Discover", d: "Search, filter, or use BookMatch to find a good fit." },
                { t: "Save", d: "Add to watchlist for quick return visits and alerts." },
                { t: "Buy & track", d: "Checkout and track your order with phone + order no." },
              ].map((x) => (
                <div key={x.t} className="rounded-2xl border border-[rgb(var(--border)/0.70)] bg-[rgb(var(--surface)/0.90)] p-4">
                  <div className="text-sm font-semibold">{x.t}</div>
                  <div className="mt-1 text-sm text-slate-600">{x.d}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Badge tone="dark">Customer voice</Badge>
            <div className="mt-3 text-sm font-semibold">“Discover makes buying feel effortless.”</div>
            <p className="mt-2 text-sm text-slate-600">
              I can return to my recently viewed books, compare prices quickly, and track orders without calling anyone.
            </p>
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-[rgb(var(--border)/0.70)] bg-[rgb(var(--surface)/0.90)] p-4">
              <div>
                <div className="text-sm font-semibold">Rakib</div>
                <div className="text-xs text-slate-500">Regular customer</div>
              </div>
              <div className="text-sm font-semibold">★★★★★</div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/register" className="relative inline-flex items-center justify-center rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:opacity-95">
                Create account
                <span className="btn-shine" aria-hidden="true" />
              </Link>
              <Link href="/books" className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition border-[rgb(var(--border)/0.85)] bg-[rgb(var(--surface))] hover:bg-[rgb(var(--surface)/0.92)]">
                Start shopping
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
