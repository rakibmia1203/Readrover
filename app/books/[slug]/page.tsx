import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { formatBDT } from "@/lib/utils";
import AddToCartButton from "@/components/AddToCartButton";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import Link from "next/link";
import ClientRecent from "./recent-client";

export default async function BookDetailsPage({ params }: { params: { slug: string } }) {
  const s = await readSession();
  const book = await prisma.book.findFirst({
    where: { slug: params.slug, active: true },
    include: { reviews: { orderBy: { createdAt: "desc" }, take: 6 } },
  });

  if (!book) return <div className="rounded-2xl border bg-white p-6 text-sm">Book not found.</div>;

  const finalPrice = book.salePrice ?? book.price;
  const tags = book.tags.split(",").map((t) => t.trim()).filter(Boolean);

  const related = await prisma.book.findMany({
    where: { active: true, id: { not: book.id }, OR: tags.slice(0,2).map((t) => ({ tags: { contains: t } })) },
    take: 4,
    select: { id:true, slug:true, title:true, author:true, price:true, salePrice:true },
  });

  return (
    <div className="space-y-6">
      <ClientRecent slug={book.slug} />

      <nav className="text-sm text-slate-600">
        <Link className="hover:opacity-80" href="/">Home</Link> <span className="mx-2">/</span>
        <Link className="hover:opacity-80" href="/books">Shop</Link> <span className="mx-2">/</span>
        <span className="text-slate-900 font-semibold">{book.title}</span>
      </nav>

      <div className="grid gap-6 md:grid-cols-[340px,1fr]">
        <Card>
          <CardContent className="pt-6">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100">
              <img src={book.coverUrl ?? "https://placehold.co/600x800?text=Cover"} alt={book.title} className="h-full w-full object-cover" />
              <div className="absolute left-3 top-3 flex gap-2">
                <Badge tone="indigo">{book.language}</Badge>
                <Badge tone="pink">{book.category}</Badge>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="text-2xl font-semibold">{formatBDT(finalPrice)}</div>
              {book.salePrice ? <div className="text-sm text-slate-500 line-through">{formatBDT(book.price)}</div> : null}

              <AddToCartButton bookId={book.id} slug={book.slug} title={book.title} price={finalPrice} coverUrl={book.coverUrl} />

              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <div><span className="text-slate-500">Stock:</span> <b>{book.stock}</b></div>
                <div className="mt-1"><span className="text-slate-500">Delivery:</span> <b>24–72h</b> (demo)</div>
                <div className="mt-1"><span className="text-slate-500">COD:</span> <b>Available</b></div>
              </div>

              <form action="/api/watchlist" method="post" className="space-y-2">
                <input type="hidden" name="bookId" value={book.id} />
                {s?.email ? (
                  <>
                    <input type="hidden" name="email" value={s.email} />
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                      Logged in as <b>{s.email}</b>. We'll use this email for price-drop alerts.
                      <div className="mt-2 text-xs text-slate-500">
                        View saved items in <Link href="/watchlist" className="font-semibold hover:opacity-80">Watchlist</Link>.
                      </div>
                    </div>
                  </>
                ) : (
                  <input name="email" type="email" required placeholder="Email for price-drop alert"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200" />
                )}
                <Button variant="secondary" className="w-full">Watch this book</Button>
                <div className="text-[11px] text-slate-500">We store your watchlist entry now. You can view it in Watchlist.</div>
              </form>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h1 className="text-2xl font-semibold">{book.title}</h1>
              <div className="mt-2 text-sm text-slate-600">{book.author} • {book.publisher ?? "—"}</div>
              <div className="mt-3 text-sm leading-6 text-slate-700">{book.description}</div>

              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Link key={t} href={`/books?q=${encodeURIComponent(t)}`} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs hover:bg-slate-50">
                    {t}
                  </Link>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="text-sm font-semibold">Rating</div>
                <div className="text-sm text-slate-600">⭐ {book.ratingAvg.toFixed(1)} ({book.ratingCount})</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold">Reviews</h2>

              <form action="/api/reviews" method="post" className="mt-4 grid gap-2 md:grid-cols-4">
                <input type="hidden" name="bookId" value={book.id} />
                <input name="name" required placeholder="Your name" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                <select name="rating" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" defaultValue="5">
                  <option value="5">5</option><option value="4">4</option><option value="3">3</option><option value="2">2</option><option value="1">1</option>
                </select>
                <input name="comment" required placeholder="Short review" className="md:col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                <Button className="md:col-span-4">Submit review</Button>
              </form>

              <div className="mt-4 space-y-3">
                {book.reviews.length === 0 ? <div className="text-sm text-slate-600">No reviews yet.</div> : book.reviews.map((r) => (
                  <div key={r.id} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{r.name}</div>
                      <div className="text-sm">⭐ {r.rating}</div>
                    </div>
                    <div className="mt-1 text-sm text-slate-700">{r.comment}</div>
                    <div className="mt-1 text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold">Related books</h2>
          <Link href="/books" className="text-sm text-slate-600 hover:opacity-80">Browse all →</Link>
        </div>
        {related.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-sm text-slate-600">No related books found.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((b) => (
              <Link key={b.id} href={`/books/${b.slug}`} className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-soft hover:shadow-md transition">
                <div className="text-sm font-semibold line-clamp-2">{b.title}</div>
                <div className="mt-1 text-xs text-slate-600">{b.author}</div>
                <div className="mt-2 text-sm font-semibold">{formatBDT(b.salePrice ?? b.price)}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
