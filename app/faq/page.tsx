import { site } from "@/lib/site";

export const metadata = { title: `FAQ — ${site.name}` };

const faqs = [
  {
    q: "Is this a real store?",
    a: "This is a portfolio/demo storefront. Core e-commerce flows are implemented, but payment processing is not included by default.",
  },
  {
    q: "How does Order Tracking work?",
    a: "After checkout, an order number is generated. Use Track Order to check the latest status set by the admin demo panel.",
  },
  {
    q: "Where is my Watchlist stored?",
    a: "If you are logged in, watchlist items are tied to your account. If you are browsing as a guest, watchlist items are stored against your email.",
  },
  {
    q: "Can I change theme colors?",
    a: "Yes. Use the theme switcher in the top bar. Themes are saved to localStorage so they persist across refresh.",
  },
  {
    q: "Do I need an account to buy?",
    a: "No. You can checkout as a guest using phone + address (COD-style flow). An account unlocks Dashboard + Watchlist sync.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight">FAQ</h1>
      <p className="mt-2 text-sm text-slate-600">Quick answers about the {site.name} demo experience.</p>

      <div className="mt-6 space-y-3">
        {faqs.map((f) => (
          <div key={f.q} className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-soft">
            <div className="text-sm font-semibold">{f.q}</div>
            <div className="mt-2 text-sm text-slate-600 leading-6">{f.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
