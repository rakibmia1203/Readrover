import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { nanoid } from "nanoid";
import { readSession } from "@/lib/auth";
import nodemailer from "nodemailer";

const OrderCreate = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(6).max(30),
  address: z.string().min(8).max(800),
  note: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  items: z.array(z.object({
    bookId: z.string().min(5),
    qty: z.number().int().min(1).max(99),
    unitPrice: z.number().int().min(1).optional(), // accepted but ignored (server-side pricing)
  })).min(1),
});

function computeDiscount(coupon: any, subtotal: number) {
  let discount = 0;
  if (coupon.type === "PERCENT") discount = Math.floor(subtotal * (coupon.value / 100));
  else discount = coupon.value;

  if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.max(0, Math.min(discount, subtotal));
  return discount;
}

async function validateCoupon(code: string | null | undefined, subtotal: number) {
  if (!code) return { code: null as string | null, discount: 0 };
  const c = code.trim().toUpperCase();
  if (!c) return { code: null, discount: 0 };

  const coupon = await prisma.coupon.findUnique({ where: { code: c } });
  if (!coupon || !coupon.active) return { code: null, discount: 0 };

  const now = new Date();
  if (coupon.startsAt && now < coupon.startsAt) return { code: null, discount: 0 };
  if (coupon.endsAt && now > coupon.endsAt) return { code: null, discount: 0 };
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return { code: null, discount: 0 };
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { code: null, discount: 0 };

  const discount = computeDiscount(coupon, subtotal);
  if (discount <= 0) return { code: null, discount: 0 };
  return { code: c, discount };
}

async function maybeSendOrderEmail(to: string | null | undefined, orderNo: string, total: number) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;
  if (!to || !host || !user || !pass || !from) return;

  const port = Number(process.env.SMTP_PORT || "587");
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject: `Order confirmed: ${orderNo}`,
    text: `Thanks for your order. Order No: ${orderNo}. Total: ৳${total}.`,
  });
}

export async function POST(req: Request) {
  const s = await readSession();
  const json = await req.json().catch(() => null);
  const parsed = OrderCreate.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });

  const reqItems = parsed.data.items;

  // Server-side pricing + stock check
  const ids = reqItems.map((x) => x.bookId);
  const books = await prisma.book.findMany({ where: { id: { in: ids }, active: true } });
  const byId = new Map(books.map((b) => [b.id, b]));

  const items = reqItems.map((it) => {
    const b = byId.get(it.bookId);
    if (!b) throw new Error("INVALID_BOOK");
    if (b.stock < it.qty) throw new Error(`OUT_OF_STOCK:${b.title}`);
    const unitPrice = (b.salePrice ?? b.price);
    return { bookId: b.id, qty: it.qty, unitPrice };
  });

  const subtotal = items.reduce((sum, x) => sum + x.qty * x.unitPrice, 0);
  const coupon = await validateCoupon(parsed.data.couponCode ?? null, subtotal);
  const afterDiscount = Math.max(0, subtotal - coupon.discount);
  const deliveryFee = afterDiscount >= 1500 ? 0 : 60;
  const total = afterDiscount + deliveryFee;

  const orderNo = `RR-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${nanoid(6).toUpperCase()}`;

  try {
    const created = await prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          orderNo,
          name: parsed.data.name,
          phone: parsed.data.phone,
          address: parsed.data.address,
          note: parsed.data.note ?? null,
          status: "PENDING",
          couponCode: coupon.code,
          email: (parsed.data.email ?? s?.email ?? null),
          userId: s?.sub ?? null,
          couponDiscount: coupon.discount,
          subtotal,
          deliveryFee,
          total,
          items: { create: items.map((x) => ({ bookId: x.bookId, qty: x.qty, unitPrice: x.unitPrice })) },
        },
      });

      for (const it of items) {
        await tx.book.update({ where: { id: it.bookId }, data: { stock: { decrement: it.qty } } });
      }

      if (coupon.code && coupon.discount > 0) {
        await tx.coupon.update({ where: { code: coupon.code }, data: { usedCount: { increment: 1 } } });
      }

      return o;
    });

    await maybeSendOrderEmail(parsed.data.email ?? s?.email ?? null, created.orderNo, created.total);

    return NextResponse.json({ orderId: created.id, orderNo: created.orderNo });
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.startsWith("OUT_OF_STOCK:")) return NextResponse.json({ error: `Out of stock: ${msg.split(":")[1]}` }, { status: 400 });
    if (msg === "INVALID_BOOK") return NextResponse.json({ error: "Invalid book" }, { status: 400 });
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
