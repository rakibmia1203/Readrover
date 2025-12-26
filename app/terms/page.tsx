import { site } from "@/lib/site";

export const metadata = { title: `Terms — ${site.name}` };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight">Terms & Conditions</h1>
      <p className="mt-2 text-sm text-slate-600">
        This is a portfolio/demo storefront. Ordering, payment, and shipping flows are simulated for product demonstration.
      </p>

      <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-soft">
        <section>
          <h2 className="text-sm font-semibold">1) Demo scope</h2>
          <p className="mt-2 text-sm text-slate-600">
            Features such as coupons, watchlists, tracking, and admin order status are included as a functional demo. Real payment processing is not included by default.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">2) Content</h2>
          <p className="mt-2 text-sm text-slate-600">
            Book data, images, and pricing may be placeholder/sample content. Replace them with your actual catalog before production use.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">3) Newsletter</h2>
          <p className="mt-2 text-sm text-slate-600">
            If you subscribe to the newsletter, your email is stored for updates. In a production deployment, you should add a proper privacy policy and an unsubscribe workflow.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold">4) Liability</h2>
          <p className="mt-2 text-sm text-slate-600">
            The demo is provided “as is” without warranties. For a production website, add proper legal terms, refund policies, and compliance text.
          </p>
        </section>

        <div className="text-xs text-slate-500">If you need help, contact: {site.supportEmail}</div>
      </div>
    </div>
  );
}
