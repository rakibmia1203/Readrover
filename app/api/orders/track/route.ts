import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Q = z.object({
  orderNo: z.string().min(6),
  phone: z.string().min(6),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = Q.safeParse({
    orderNo: url.searchParams.get("orderNo"),
    phone: url.searchParams.get("phone"),
  });
  if (!parsed.success) return NextResponse.json({ error: "Missing orderNo/phone" }, { status: 400 });

  const orderNo = parsed.data.orderNo.trim();
  const phone = parsed.data.phone.trim();

  const order = await prisma.order.findFirst({
    where: { orderNo, phone },
    include: { items: { include: { book: { select: { title: true } } } } },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
}
