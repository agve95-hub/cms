import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageEditor } from "@/components/admin/PageEditor";

interface Props { params: { id: string } }

export default function EditPostPage({ params }: Props) {
  const post = db.select().from(schema.posts).where(eq(schema.posts.id, params.id)).get();
  if (!post) notFound();

  // Reuse PageEditor (it works for both pages and posts)
  return <PageEditor page={{ ...post, seoTitle: post.seoTitle, seoDescription: post.seoDescription, publishAt: post.publishAt }} />;
}
