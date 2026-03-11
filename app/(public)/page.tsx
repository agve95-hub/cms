import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { BlockRenderer } from "@/components/public/BlockRenderer";

export default function HomePage() {
  const page = db.select().from(schema.pages)
    .where(eq(schema.pages.slug, "home"))
    .get();

  if (!page || page.status !== "published") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome</h1>
          <p className="text-gray-600">Visit <a href="/admin" className="text-brand-600 underline">/admin</a> to set up your site.</p>
        </div>
      </main>
    );
  }

  const blocks = JSON.parse(page.blocks);
  return (
    <main className="min-h-screen">
      <BlockRenderer blocks={blocks} />
    </main>
  );
}
