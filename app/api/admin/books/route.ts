import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function s(v: string | null) {
  return (v ?? "").trim();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = s(url.searchParams.get("q"));
  const status = s(url.searchParams.get("status")) || "active"; // active | inactive | all

  const where: any = {};

  if (status === "active") where.active = true;
  if (status === "inactive") where.active = false;

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { author: { contains: q } },
      { slug: { contains: q } },
      { category: { contains: q } },
      { tags: { contains: q } },
    ];
  }

  const books = await prisma.book.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    take: 300,
    select: {
      id: true,
      slug: true,
      title: true,
      author: true,
      publisher: true,
      language: true,
      category: true,
      tags: true,
      description: true,
      price: true,
      salePrice: true,
      stock: true,
      coverUrl: true,
      active: true,
      createdAt: true,
      updatedAt: true,
      ratingAvg: true,
      ratingCount: true,
    },
  });

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
  active: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BookCreate.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const created = await prisma.book.create({ data: parsed.data });
    return NextResponse.json({ book: created });
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("slug")) {
      return NextResponse.json({ error: "Slug already exists. Use a unique slug." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
