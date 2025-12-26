import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const BodySchema = z.object({
  email: z.string().email(),
  source: z.string().min(1).max(64).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const source = parsed.data.source?.trim();

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ ok: true, already: true });
    }

    await prisma.newsletterSubscriber.create({
      data: {
        email,
        source: source || null,
      },
    });

    return NextResponse.json({ ok: true, already: false });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
