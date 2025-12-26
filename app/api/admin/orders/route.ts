import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { z } from "zod";
import { ORDER_STATUSES } from "@/lib/utils";

async function requireAdmin() {
  const s = await readSession();
  if (!s || s.role !== "ADMIN") return null;
  return s;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { items: { include: { book: { select: { title: true } } } } },
  });

  return NextResponse.json({ orders });
}

const PatchSchema = z.object({
  orderId: z.string().min(5),
  status: z.enum(ORDER_STATUSES),
});

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const updated = await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ order: updated });
}
