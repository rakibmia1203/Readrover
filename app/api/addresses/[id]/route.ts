import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { z } from "zod";

const PatchSchema = z.object({
  label: z.string().max(40).optional().nullable(),
  phone: z.string().min(6).max(30).optional(),
  address: z.string().min(8).max(500).optional(),
  city: z.string().max(60).optional().nullable(),
  isDefault: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const s = await readSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const id = params.id;
  const existing = await prisma.address.findFirst({ where: { id, userId: s.sub } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({ where: { userId: s.sub }, data: { isDefault: false } });
    }

    return tx.address.update({
      where: { id },
      data: {
        label: data.label === undefined ? undefined : (data.label?.trim() || null),
        phone: data.phone === undefined ? undefined : data.phone.trim(),
        address: data.address === undefined ? undefined : data.address.trim(),
        city: data.city === undefined ? undefined : (data.city?.trim() || null),
        isDefault: data.isDefault === undefined ? undefined : !!data.isDefault,
      },
    });
  });

  return NextResponse.json({ address: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = await readSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.id;
  const existing = await prisma.address.findFirst({ where: { id, userId: s.sub } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
