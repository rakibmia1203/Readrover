import { readSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import WatchlistClient from "@/components/WatchlistClient";

export default async function WatchlistPage() {
  const s = await readSession();

  const email = s?.email ?? "";
  const items = await prisma.watchlistItem.findMany({
    where: s ? { OR: [{ userId: s.sub }, { email }] } : { email: "__none__" },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { book: { select: { slug: true, title: true, price: true, salePrice: true } } },
  });

  return <WatchlistClient initialItems={items} initialEmail={email} loggedIn={!!s} />;
}
