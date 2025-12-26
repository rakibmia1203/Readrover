import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import Link from "next/link";
import { formatBDT } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const s = await readSession();
  if (!s) redirect("/login?next=/account");

  const user = await prisma.user.findUnique({
    where: { id: s.sub },
    select: {
      id: true, name: true, email: true, role: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { items: { include: { book: { select: { title: true } } } } },
      },
      addresses: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <Badge tone="dark">My account</Badge>
        <h1 className="mt-3 text-2xl font-semibold">{user?.name}</h1>
        <p className="mt-2 text-sm text-slate-600">{user?.email}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <form action="/api/auth/logout" method="post">
            <Button variant="secondary">Logout</Button>
          </form>
          <Link href="/books"><Button>Shop</Button></Link>
          {user?.role === "ADMIN" ? <Link href="/admin"><Button variant="ghost">Admin →</Button></Link> : null}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Recent orders</div>
              <Link className="text-sm font-semibold hover:opacity-80" href="/track-order">Track order →</Link>
            </div>
            {user?.orders?.length ? (
              <div className="mt-4 space-y-3">
                {user.orders.map((o) => (
                  <div key={o.id} className="rounded-2xl border border-slate-200/70 bg-white/80 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold">{o.orderNo}</div>
                      <div className="text-sm text-slate-600">{new Date(o.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone="indigo">{o.status}</Badge>
                      <Badge tone="pink">{formatBDT(o.total)}</Badge>
                    </div>
                    <div className="mt-3 text-sm text-slate-700">
                      {o.items.slice(0,3).map((it) => (
                        <div key={it.id} className="flex justify-between">
                          <span className="font-semibold">{it.book.title}</span>
                          <span className="text-slate-600">x {it.qty}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3">
                      <Link className="text-sm font-semibold hover:opacity-80" href={`/track-order?orderNo=${encodeURIComponent(o.orderNo)}`}>Track →</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No orders yet.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-lg font-semibold">Addresses</div>
            <div className="mt-2 text-sm text-slate-600">Saved for faster checkout and one-click fill at checkout.</div>

            {user?.addresses?.length ? (
              <div className="mt-4 space-y-3">
                {user.addresses.map((a) => (
                  <div key={a.id} className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-sm">
                    <div className="font-semibold">{a.label || "Address"}</div>
                    <div className="mt-1 text-slate-600">{a.phone}</div>
                    <div className="mt-1">{a.address}{a.city ? `, ${a.city}` : ""}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                No saved addresses yet. You can still checkout as usual.
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
  <Link href="/account/addresses"><Button variant="secondary">Manage addresses</Button></Link>
  <Link href="/cart#checkout"><Button>Checkout</Button></Link>
</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
