import Link from "next/link";
import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, Badge } from "@/components/ui";

function s(x: string | string[] | undefined) { return Array.isArray(x) ? x[0] : x; }
const PAGE_SIZE = 16;

// Cache catalog pages for 30s in production to speed up navigation.
export const revalidate = 30;

export default async function BooksPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined>; }) {
  const q = (s(searchParams?.q) ?? "").trim();
  const category = (s(searchParams?.category) ?? "").trim();
  const language = (s(searchParams?.language) ?? "").trim();
  const sort = (s(searchParams?.sort) ?? "new").trim();
  const page = Math.max(1, Number(s(searchParams?.page) ?? "1") || 1);

  const where: any = {};
  where.active = true;
  if (category) where.category = category;
  if (language) where.language = language;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { author: { contains: q } },
      { tags: { contains: q } },
    ];
  }

  const orderBy =
    sort === "price_low"
      ? [{ salePrice: "asc" as const }, { price: "asc" as const }]
      : sort === "price_high"
      ? [{ salePrice: "desc" as const }, { price: "desc" as const }]
      : sort === "top"
      ? [{ ratingAvg: "desc" as const }, { ratingCount: "desc" as const }]
      : [{ createdAt: "desc" as const }];

  const [total, books, cats, langs] = await Promise.all([
    prisma.book.count({ where }),
    prisma.book.findMany({
      where, orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id:true, slug:true, title:true, author:true, category:true, language:true, price:true, salePrice:true, coverUrl:true, ratingAvg:true, ratingCount:true },
    }),
    prisma.book.findMany({ where: { active: true }, select: { category: true }, distinct: ["category"] }),
    prisma.book.findMany({ where: { active: true }, select: { language: true }, distinct: ["language"] }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function hrefWith(next: Record<string, string>) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (category) p.set("category", category);
    if (language) p.set("language", language);
    if (sort) p.set("sort", sort);
    Object.entries(next).forEach(([k,v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    return `/books?${p.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Shop</h1>
            <p className="mt-1 text-sm text-slate-600">Search, filter, sort, paginate — mobile-first UI.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {q ? <Badge tone="indigo">Search: {q}</Badge> : null}
              {category ? <Badge tone="pink">Category: {category}</Badge> : null}
              {language ? <Badge tone="amber">Language: {language}</Badge> : null}
              <Badge>Total: {total}</Badge>
            </div>
          </div>
          <div className="w-full max-w-md">
            <SearchBar />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[260px,1fr]">
        <Card className="h-fit">
          <CardContent className="pt-6 space-y-4">
            <div>
              <div className="text-sm font-semibold">Sort</div>
              <div className="mt-2 grid gap-2">
                {[
                  ["new","Newest"],
                  ["top","Top rated"],
                  ["price_low","Price low → high"],
                  ["price_high","Price high → low"],
                ].map(([k, label]) => (
                  <Link key={k} href={hrefWith({ sort: k as string, page: "1" })}
                     className={"rounded-xl border px-3 py-2 text-sm " + (sort===k ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-50")}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold">Category</div>
              <div className="mt-2 grid gap-2">
                <Link href={hrefWith({ category: "", page: "1" })}
                   className={"rounded-xl border px-3 py-2 text-sm " + (!category ? "bg-slate-900 text-white border-slate-900" : "hover:bg-slate-50")}>
                  All
                </Link>
                {cats.map((c) => (
                  <Link key={c.category} href={hrefWith({ category: c.category, page: "1" })}
                     className={"rounded-xl border px-3 py-2 text-sm " + (category===c.category ? "bg-slate-900 text-white border-slate-900" : "hover:bg-slate-50")}>
                    {c.category}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold">Language</div>
              <div className="mt-2 grid gap-2">
                <Link href={hrefWith({ language: "", page: "1" })}
                   className={"rounded-xl border px-3 py-2 text-sm " + (!language ? "bg-slate-900 text-white border-slate-900" : "hover:bg-slate-50")}>
                  All
                </Link>
                {langs.map((l) => (
                  <Link key={l.language} href={hrefWith({ language: l.language, page: "1" })}
                     className={"rounded-xl border px-3 py-2 text-sm " + (language===l.language ? "bg-slate-900 text-white border-slate-900" : "hover:bg-slate-50")}>
                    {l.language}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/books" className="text-sm font-semibold hover:opacity-80">Reset filters</Link>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {books.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-sm text-slate-600">No books found.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {books.map((b) => <BookCard key={b.id} b={b} />)}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">Page {page} of {pageCount}</div>
            <div className="flex gap-2">
              <Link className={"rounded-xl border px-3 py-2 text-sm " + (page<=1 ? "pointer-events-none opacity-50" : "hover:bg-slate-50")} href={hrefWith({ page: String(page-1) })}>Prev</Link>
              <Link className={"rounded-xl border px-3 py-2 text-sm " + (page>=pageCount ? "pointer-events-none opacity-50" : "hover:bg-slate-50")} href={hrefWith({ page: String(page+1) })}>Next</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
