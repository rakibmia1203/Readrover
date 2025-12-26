import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { z } from "zod";

const ReviewCreate = z.object({
  bookId: z.string().min(5),
  name: z.string().min(2),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(2).max(300),
});

export async function POST(req: Request) {
  const s = await readSession();
  const form = await req.formData();
  const parsed = ReviewCreate.safeParse({
    bookId: form.get("bookId"),
    name: form.get("name"),
    rating: form.get("rating"),
    comment: form.get("comment"),
  });

  if (!parsed.success) return NextResponse.redirect(new URL("/books", req.url));

  const r = await prisma.review.create({ data: { ...parsed.data, userId: s?.sub ?? null } });

  const agg = await prisma.review.aggregate({
    where: { bookId: r.bookId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.book.update({
    where: { id: r.bookId },
    data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count.rating ?? 0 },
  });

  const book = await prisma.book.findUnique({ where: { id: r.bookId } });
  return NextResponse.redirect(new URL(`/books/${book?.slug ?? ""}`, req.url));
}
