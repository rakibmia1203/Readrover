import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Patch = z.object({
  type: z.enum(["PERCENT", "FIXED"]).optional(),
  value: z.number().int().min(1).max(100000).optional(),
  minSubtotal: z.number().int().min(0).optional(),
  maxDiscount: z.number().int().min(0).optional().nullable(),
  active: z.boolean().optional(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  usageLimit: z.number().int().min(1).optional().nullable(),
  usedCount: z.number().int().min(0).optional(),
});

export async function PATCH(req: Request, { params }: { params: { code: string } }) {
  const code = params.code.trim().toUpperCase();
  const json = await req.json().catch(() => null);
  const parsed = Patch.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.coupon.update({
    where: { code },
    data: {
      type: parsed.data.type,
      value: parsed.data.value,
      minSubtotal: parsed.data.minSubtotal,
      maxDiscount: parsed.data.maxDiscount === undefined ? undefined : (parsed.data.maxDiscount ?? null),
      active: parsed.data.active,
      startsAt: parsed.data.startsAt === undefined ? undefined : (parsed.data.startsAt ? new Date(parsed.data.startsAt) : null),
      endsAt: parsed.data.endsAt === undefined ? undefined : (parsed.data.endsAt ? new Date(parsed.data.endsAt) : null),
      usageLimit: parsed.data.usageLimit === undefined ? undefined : (parsed.data.usageLimit ?? null),
      usedCount: parsed.data.usedCount,
    },
  });

  return NextResponse.json({ coupon: updated });
}

export async function DELETE(_req: Request, { params }: { params: { code: string } }) {
  const code = params.code.trim().toUpperCase();
  await prisma.coupon.delete({ where: { code } });
  return NextResponse.json({ ok: true });
}
