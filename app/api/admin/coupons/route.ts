import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ coupons });
}

const Create = z.object({
  code: z.string().min(2).max(30),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().int().min(1).max(100000),
  minSubtotal: z.number().int().min(0).optional(),
  maxDiscount: z.number().int().min(0).optional().nullable(),
  active: z.boolean().optional(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  usageLimit: z.number().int().min(1).optional().nullable(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Create.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });

  const code = parsed.data.code.trim().toUpperCase();
  const created = await prisma.coupon.create({
    data: {
      code,
      type: parsed.data.type,
      value: parsed.data.value,
      minSubtotal: parsed.data.minSubtotal ?? 0,
      maxDiscount: parsed.data.maxDiscount ?? null,
      active: parsed.data.active ?? true,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
      usageLimit: parsed.data.usageLimit ?? null,
    },
  });

  return NextResponse.json({ coupon: created });
}
