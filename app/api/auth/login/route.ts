import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createSessionCookie } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = LoginSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  await createSessionCookie({ sub: user.id, role: user.role as any, name: user.name, email: user.email });
  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
