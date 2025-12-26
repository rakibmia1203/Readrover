import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";

export async function GET() {
  const s = await readSession();
  if (!s) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { id: s.sub, name: s.name, email: s.email, role: s.role } });
}
