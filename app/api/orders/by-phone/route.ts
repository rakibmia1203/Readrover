import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Q = z.object({
  phone: z.string().min(6),
  name: z.string().min(2),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = Q.safeParse({
    phone: url.searchParams.get("phone"),
    name: url.searchParams.get("name"),
  });
  if (!parsed.success) return NextResponse.json({ error: "Missing name/phone" }, { status: 400 });

  const phone = parsed.data.phone.trim();
  const name = parsed.data.name.trim();

  const orders = await prisma.order.findMany({
    where: {
      phone,
      name: { contains: name, mode: "insensitive" },
    },
    orderBy: { createdAt: "desc" },
    take: 25,
    select: { orderNo: true, createdAt: true, status: true, total: true },
  });

  return NextResponse.json({ orders });
}
