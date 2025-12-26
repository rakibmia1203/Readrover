import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const where: any = {};
  where.active = true;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { author: { contains: q } },
      { tags: { contains: q } },
    ];
  }
  const books = await prisma.book.findMany({ where, orderBy: [{ createdAt: "desc" }], take: 50 });
  return NextResponse.json({ books });
}

const BookCreate = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  author: z.string().min(2),
  publisher: z.string().optional().nullable(),
  language: z.string().min(2).default("Bangla"),
  category: z.string().min(2),
  tags: z.string().min(2),
  description: z.string().min(10),
  price: z.number().int().min(1),
  salePrice: z.number().int().min(1).nullable().optional(),
  stock: z.number().int().min(0).default(0),
  coverUrl: z.string().url().nullable().optional(),
});

async function adminOk() {
    const { readSession } = await import("@/lib/auth");
  const s = await readSession();
  return !!s && s.role === "ADMIN";
}

export async function POST(req: Request) {
  if (!(await adminOk())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json();
  const parsed = BookCreate.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const created = await prisma.book.create({ data: parsed.data });
  return NextResponse.json({ book: created });
}
