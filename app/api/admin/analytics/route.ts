import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  const [users, books, ordersTotal, pending, shipped] = await Promise.all([
    prisma.user.count(),
    prisma.book.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED"] } } }),
    prisma.order.count({ where: { status: { in: ["SHIPPED", "DELIVERED"] } } }),
  ]);

  const days = 14;
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, total: true },
    orderBy: { createdAt: "asc" },
  });

  const seriesMap = new Map<string, { day: string; orders: number; revenue: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = isoDay(d);
    seriesMap.set(key, { day: key, orders: 0, revenue: 0 });
  }

  for (const o of orders) {
    const key = isoDay(o.createdAt);
    const slot = seriesMap.get(key);
    if (slot) {
      slot.orders += 1;
      slot.revenue += o.total;
    }
  }

  const series = Array.from(seriesMap.values());
  const revenue14 = series.reduce((s, x) => s + x.revenue, 0);

  // Top books by revenue (best-effort aggregation in app layer for SQLite)
  const items = await prisma.orderItem.findMany({
    select: { qty: true, unitPrice: true, book: { select: { id: true, title: true, slug: true } } },
    take: 1000,
  });

  const agg = new Map<string, { bookId: string; title: string; slug: string; qty: number; revenue: number }>();
  for (const it of items) {
    const id = it.book.id;
    const prev = agg.get(id) || { bookId: id, title: it.book.title, slug: it.book.slug, qty: 0, revenue: 0 };
    prev.qty += it.qty;
    prev.revenue += it.qty * it.unitPrice;
    agg.set(id, prev);
  }
  const topBooks = Array.from(agg.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 8);

  return NextResponse.json({
    cards: { users, books, orders: ordersTotal, pending, shipped, revenue14 },
    series,
    topBooks,
  });
}
