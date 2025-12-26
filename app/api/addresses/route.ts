import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { z } from "zod";

const CreateSchema = z.object({
  label: z.string().max(40).optional().nullable(),
  phone: z.string().min(6).max(30),
  address: z.string().min(8).max(500),
  city: z.string().max(60).optional().nullable(),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  const s = await readSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await prisma.address.findMany({
    where: { userId: s.sub },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ addresses });
}

export async function POST(req: Request) {
  const s = await readSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const data = parsed.data;

  const created = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({ where: { userId: s.sub }, data: { isDefault: false } });
    }
    return tx.address.create({
      data: {
        userId: s.sub,
        label: data.label?.trim() || null,
        phone: data.phone.trim(),
        address: data.address.trim(),
        city: data.city?.trim() || null,
        isDefault: !!data.isDefault,
      },
    });
  });

  return NextResponse.json({ address: created });
}
