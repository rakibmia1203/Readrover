import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Body = z.object({
  code: z.string().min(1),
  subtotal: z.number().int().min(0),
});

function fail(code: string, reason: string, extra?: Record<string, any>) {
  return NextResponse.json({ ok: false, code, discount: 0, reason, ...(extra || {}) });
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const code = parsed.data.code.trim().toUpperCase();
  const subtotal = parsed.data.subtotal;
  if (!code) return fail("", "MISSING_CODE");

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon) return fail(code, "NOT_FOUND");
  if (!coupon.active) return fail(code, "INACTIVE");

  const now = new Date();
  if (coupon.startsAt && now < coupon.startsAt) return fail(code, "NOT_STARTED", { startsAt: coupon.startsAt });
  if (coupon.endsAt && now > coupon.endsAt) return fail(code, "EXPIRED", { endsAt: coupon.endsAt });
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return fail(code, "MIN_SUBTOTAL", { minSubtotal: coupon.minSubtotal });
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return fail(code, "LIMIT_REACHED");

  let discount = 0;
  if (coupon.type === "PERCENT") discount = Math.floor(subtotal * (coupon.value / 100));
  else discount = coupon.value;

  if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.max(0, Math.min(discount, subtotal));

  return NextResponse.json({
    ok: true,
    code,
    discount,
    coupon: {
      type: coupon.type,
      value: coupon.value,
      minSubtotal: coupon.minSubtotal,
      maxDiscount: coupon.maxDiscount,
    },
  });
}
