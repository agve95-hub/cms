import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export const generateSitemap = (): string => {
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";

  const publishedPages = db
    .select({ slug: schema.pages.slug, updatedAt: schema.pages.updatedAt })
    .from(schema.pages)
    .where(eq(schema.pages.status, "published"))
    .all();

  const publishedPosts = db
    .select({ slug: schema.posts.slug, updatedAt: schema.posts.updatedAt })
    .from(schema.posts)
    .where(eq(schema.posts.status, "published"))
    .all();

  const urls = [
    { loc: siteUrl, priority: "1.0", changefreq: "daily" },
    ...publishedPages.map((p) => ({
      loc: `${siteUrl}/${p.slug}`,
      lastmod: p.updatedAt,
      priority: "0.8",
      changefreq: "weekly",
    })),
    { loc: `${siteUrl}/blog`, priority: "0.9", changefreq: "daily" },
    ...publishedPosts.map((p) => ({
      loc: `${siteUrl}/blog/${p.slug}`,
      lastmod: p.updatedAt,
      priority: "0.7",
      changefreq: "monthly",
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${(u as Record<string, unknown>).lastmod ? `<lastmod>${(u as Record<string, unknown>).lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;
};
