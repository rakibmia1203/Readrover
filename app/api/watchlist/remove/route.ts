import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { z } from "zod";

const Body = z.object({
  bookId: z.string().min(5),
  email: z.string().email().optional(),
});

export async function POST(req: Request) {
  const s = await readSession();
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const email = (parsed.data.email ?? s?.email ?? "").trim().toLowerCase();
  if (!email && !s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.watchlistItem.deleteMany({
    where: {
      bookId: parsed.data.bookId,
      ...(s ? { OR: [{ userId: s.sub }, { email }] } : { email }),
    },
  });

  return NextResponse.json({ ok: true });
}
