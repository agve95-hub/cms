import { db, schema } from "@/lib/db";
import { eq, ne, and, desc } from "drizzle-orm";
import { BlockRenderer } from "@/components/public/BlockRenderer";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import type { Metadata } from "next";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = db.select().from(schema.posts).where(eq(schema.posts.slug, params.slug)).get();
  if (!post) return {};
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || undefined,
      images: post.seoOgImage ? [post.seoOgImage] : undefined,
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = db.select().from(schema.posts).where(eq(schema.posts.slug, params.slug)).get();
  if (!post || post.status !== "published") notFound();

  const blocks = JSON.parse(post.blocks);

  // Related posts (simple: most recent, excluding current)
  const related = db.select().from(schema.posts)
    .where(and(eq(schema.posts.status, "published"), ne(schema.posts.id, post.id)))
    .orderBy(desc(schema.posts.createdAt))
    .limit(3)
    .all();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <time className="block text-sm text-gray-400 mb-8">
          {post.createdAt ? format(new Date(post.createdAt), "MMMM d, yyyy") : ""}
        </time>
        <div className="prose prose-lg max-w-none">
          <BlockRenderer blocks={blocks} />
        </div>
      </article>
      {related.length > 0 && (
        <aside className="mt-16 border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((r) => (
              <Link key={r.id} href={`/blog/${r.slug}`} className="group">
                <h3 className="font-semibold text-gray-900 group-hover:text-brand-600">{r.title}</h3>
                {r.excerpt && <p className="mt-1 text-sm text-gray-500 line-clamp-2">{r.excerpt}</p>}
              </Link>
            ))}
          </div>
        </aside>
      )}
    </main>
  );
}
