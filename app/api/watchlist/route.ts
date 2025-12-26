import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { z } from "zod";

const Watch = z.object({ email: z.string().email(), bookId: z.string().min(5) });

export async function POST(req: Request) {
  const form = await req.formData();
  const parsed = Watch.safeParse({ email: form.get("email"), bookId: form.get("bookId") });
  if (!parsed.success) return NextResponse.redirect(new URL("/books", req.url));

  const s = await readSession();

  await prisma.watchlistItem.upsert({
    where: { email_bookId: { email: parsed.data.email, bookId: parsed.data.bookId } },
    update: {},
    create: { ...parsed.data, userId: s?.sub ?? null },
  });

  // UX: after saving, take the user to their Watchlist so they can confirm the item was added.
  // If the user is not logged in, we include the email in the URL so they can load their list.
  const added = await prisma.book.findUnique({ where: { id: parsed.data.bookId }, select: { slug: true } });
  const qs = new URLSearchParams();
  if (added?.slug) qs.set("added", added.slug);
  if (!s?.sub) qs.set("email", parsed.data.email);
  const to = `/watchlist${qs.toString() ? `?${qs.toString()}` : ""}`;
  return NextResponse.redirect(new URL(to, req.url));
}
