import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { BlockRenderer } from "@/components/public/BlockRenderer";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props { params: { slug: string[] } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug.join("/");
  const page = db.select().from(schema.pages).where(eq(schema.pages.slug, slug)).get();
  if (!page) return {};

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || undefined,
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.seoDescription || undefined,
      images: page.seoOgImage ? [page.seoOgImage] : undefined,
    },
    robots: page.robots || "index,follow",
    alternates: page.canonicalUrl ? { canonical: page.canonicalUrl } : undefined,
  };
}

export default function DynamicPage({ params }: Props) {
  const slug = params.slug.join("/");
  const page = db.select().from(schema.pages).where(eq(schema.pages.slug, slug)).get();

  if (!page || page.status !== "published") notFound();

  const blocks = JSON.parse(page.blocks);
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BlockRenderer blocks={blocks} />
    </main>
  );
}
