import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Body = z.object({
  slugs: z.array(z.string().min(1)).min(1).max(20),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const slugs = parsed.data.slugs;
  const rows = await prisma.book.findMany({
    where: { slug: { in: slugs }, active: true },
    select: {
      id: true,
      slug: true,
      title: true,
      author: true,
      category: true,
      language: true,
      price: true,
      salePrice: true,
      coverUrl: true,
      ratingAvg: true,
      ratingCount: true,
      tags: true,
    },
  });

  const map = new Map(rows.map((r) => [r.slug, r]));
  const ordered = slugs.map((s) => map.get(s)).filter(Boolean);

  return NextResponse.json({ books: ordered });
}
