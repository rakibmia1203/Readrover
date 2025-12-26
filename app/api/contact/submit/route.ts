import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { z } from "zod";

const Body = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  subject: z.string().min(2).max(120),
  message: z.string().min(10).max(4000),
});

export async function POST(req: Request) {
  const s = await readSession();

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const m = await prisma.contactMessage.create({
    data: {
      userId: s?.sub ?? null,
      name: parsed.data.name.trim(),
      email: parsed.data.email.trim().toLowerCase(),
      subject: parsed.data.subject.trim(),
      message: parsed.data.message.trim(),
      status: "NEW",
    },
  });

  return NextResponse.json({ ok: true, id: m.id });
}
