import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BookUpdate = z.object({
  slug: z.string().min(2).optional(),
  title: z.string().min(2).optional(),
  author: z.string().min(2).optional(),
  publisher: z.string().optional().nullable(),
  language: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  tags: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  price: z.number().int().min(1).optional(),
  salePrice: z.number().int().min(1).nullable().optional(),
  stock: z.number().int().min(0).optional(),
  coverUrl: z.string().url().nullable().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const json = await req.json().catch(() => null);
  const parsed = BookUpdate.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  // Normalize salePrice: if equal/higher than price, treat as null.
  const data: any = { ...parsed.data };
  if (data.price != null && data.salePrice != null && data.salePrice >= data.price) {
    data.salePrice = null;
  }

  try {
    const updated = await prisma.book.update({ where: { id: params.id }, data });
    return NextResponse.json({ book: updated });
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("slug")) {
      return NextResponse.json({ error: "Slug already exists. Use a unique slug." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.book.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const code = e?.code;
    // Prisma foreign key constraint failure (SQLite/others) often surface as P2003
    if (code === "P2003") {
      return NextResponse.json(
        { error: "This book has related orders/reviews. You can't delete it. Use Deactivate instead." },
        { status: 409 }
      );
    }
    const msg = String(e?.message || "");
    if (msg.toLowerCase().includes("foreign key") || msg.toLowerCase().includes("constraint")) {
      return NextResponse.json(
        { error: "This book has related orders/reviews. You can't delete it. Use Deactivate instead." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
