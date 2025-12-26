import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "ALL";
  const take = Math.min(200, Math.max(10, Number(url.searchParams.get("take") || "50")));

  const where: any = {};
  if (status !== "ALL") where.status = status;

  const messages = await prisma.contactMessage.findMany({
    where,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take,
  });

  return NextResponse.json({ messages });
}

const Patch = z.object({
  messageId: z.string().min(10),
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED"]),
});

export async function PATCH(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Patch.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const updated = await prisma.contactMessage.update({
    where: { id: parsed.data.messageId },
    data: {
      status: parsed.data.status,
      resolvedAt: parsed.data.status === "RESOLVED" ? new Date() : null,
    },
  });

  return NextResponse.json({ message: updated });
}
