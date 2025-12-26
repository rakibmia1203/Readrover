import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/toast/ToastProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { THEME_KEY } from "@/components/theme/themes";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: "A modern online bookshop for fast discovery: smart picks, watchlist, coupons, and instant order tracking.",
  applicationName: site.name,
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: "Smarter picks. Faster delivery.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: "Smarter picks. Faster delivery.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="sunset" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const k = ${JSON.stringify(THEME_KEY)};
    const stored = window.localStorage.getItem(k);
    if (stored) document.documentElement.dataset.theme = stored;
  } catch (e) {}
})();`,
          }}
        />
      </head>
      <body>
        <ToastProvider>
          <CartProvider>
            <Navbar />
            <main className="container py-8">{children}</main>
            <Footer />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
