import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url.replace(/\/$/, "");

  const staticRoutes = [
    "",
    "/books",
    "/collections",
    "/discover",
    "/bookmatch",
    "/recent",
    "/cart",
    "/track-order",
    "/watchlist",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
    "/login",
    "/register",
  ];

  const books = await prisma.book.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } });

  return [
    ...staticRoutes.map((p) => ({
      url: `${base}${p}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.7,
    })),
    ...books.map((b) => ({
      url: `${base}/books/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
