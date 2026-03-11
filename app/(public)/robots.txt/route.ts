export async function GET() {
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  const body = `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${siteUrl}/sitemap.xml`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
