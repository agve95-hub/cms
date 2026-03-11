import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { format } from "date-fns";

export const metadata = { title: "Blog" };

export default function BlogPage() {
  const posts = db.select().from(schema.posts)
    .where(eq(schema.posts.status, "published"))
    .orderBy(desc(schema.posts.createdAt))
    .all();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Blog</h1>
      {posts.length === 0 && <p className="text-gray-500">No posts yet.</p>}
      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.id} className="border-b border-gray-200 pb-8">
            <Link href={`/blog/${post.slug}`} className="group">
              <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                {post.title}
              </h2>
            </Link>
            {post.excerpt && <p className="mt-2 text-gray-600">{post.excerpt}</p>}
            <time className="mt-2 block text-sm text-gray-400">
              {post.createdAt ? format(new Date(post.createdAt), "MMMM d, yyyy") : ""}
            </time>
          </article>
        ))}
      </div>
    </main>
  );
}
