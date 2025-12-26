import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createSessionCookie } from "@/lib/auth";

const RegisterSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const email = parsed.data.email.trim().toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: { name: parsed.data.name.trim(), email, passwordHash, role: "USER" },
  });

  await createSessionCookie({ sub: user.id, role: "USER", name: user.name, email: user.email });
  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
