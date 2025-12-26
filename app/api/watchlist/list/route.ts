import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { z } from "zod";

const Q = z.object({ email: z.string().email().optional() });

export async function GET(req: Request) {
  const url = new URL(req.url);
  const s = await readSession();
  const parsed = Q.safeParse({ email: url.searchParams.get("email") ?? undefined });
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const email = (parsed.data.email ?? s?.email ?? "").trim().toLowerCase();
  if (!email && !s) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const where: any = s ? { OR: [{ userId: s.sub }, { email }] } : { email };
  const items = await prisma.watchlistItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { book: { select: { slug: true, title: true, price: true, salePrice: true } } },
  });

  return NextResponse.json({ items });
}
