import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";

export async function GET() {
  const s = await readSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: s.sub },
    orderBy: { createdAt: "desc" },
    take: 25,
    include: { items: { include: { book: { select: { title: true, slug: true } } } } },
  });

  return NextResponse.json({ orders });
}
