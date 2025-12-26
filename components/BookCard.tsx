import Link from "next/link";
import Image from "next/image";
import { formatBDT } from "@/lib/utils";
import { Badge } from "@/components/ui";

export type BookLite = {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  language: string;
  price: number;
  salePrice: number | null;
  coverUrl: string | null;
  ratingAvg: number;
  ratingCount: number;
};

export default function BookCard({ b }: { b: BookLite }) {
  const finalPrice = b.salePrice ?? b.price;
  const off = b.salePrice ? Math.round((1 - finalPrice / b.price) * 100) : 0;

  return (
    <Link href={`/books/${b.slug}`} className="group rounded-2xl border border-slate-200/70 bg-white/80 p-3 shadow-soft transition hover:-translate-y-1 hover:shadow-md hover:ring-2 hover:ring-sky-200/70">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-100">
        <Image
          src={b.coverUrl ?? "/placeholder-cover.svg"}
          alt={b.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute left-2 top-2 flex gap-2">
          {off > 0 ? <Badge tone="dark">{off}% OFF</Badge> : null}
          <Badge tone="indigo">{b.language}</Badge>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <div className="line-clamp-2 text-sm font-semibold">{b.title}</div>
        <div className="text-xs text-slate-600">{b.author}</div>

        <div className="flex items-end justify-between pt-1">
          <div>
            <div className="text-sm font-semibold">{formatBDT(finalPrice)}</div>
            {b.salePrice ? <div className="text-xs text-slate-500 line-through">{formatBDT(b.price)}</div> : null}
          </div>
          <div className="text-xs text-slate-500">⭐ {b.ratingAvg.toFixed(1)} ({b.ratingCount})</div>
        </div>

        <div className="text-[11px] text-slate-500">{b.category}</div>
      </div>
    </Link>
  );
}
