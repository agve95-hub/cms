import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export default function TrashPage() {
  const trashedPages = db.select().from(schema.pages).where(eq(schema.pages.status, "trashed")).orderBy(desc(schema.pages.updatedAt)).all();
  const trashedPosts = db.select().from(schema.posts).where(eq(schema.posts.status, "trashed")).orderBy(desc(schema.posts.updatedAt)).all();

  const items = [
    ...trashedPages.map((p) => ({ ...p, type: "page" as const })),
    ...trashedPosts.map((p) => ({ ...p, type: "post" as const })),
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Trash</h1>
      <p className="text-sm text-gray-500 mb-4">Items in trash are automatically deleted after 30 days.</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Trash is empty.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 capitalize">{item.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
