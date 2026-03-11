import { db, schema } from "@/lib/db";
import { desc, ne } from "drizzle-orm";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { format } from "date-fns";

export default function PagesListPage() {
  const pages = db.select().from(schema.pages).where(ne(schema.pages.status, "trashed")).orderBy(desc(schema.pages.updatedAt)).all();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
        <Link href="/admin/pages/new" className="btn-primary"><Plus size={16} className="mr-1.5" /> New Page</Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {pages.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText size={40} className="mx-auto mb-3 text-gray-300" />
            <p>No pages yet. Create your first page!</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/pages/${page.id}`} className="font-medium text-gray-900 hover:text-brand-600">{page.title}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">/{page.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      page.status === "published" ? "bg-green-50 text-green-700" :
                      page.status === "draft" ? "bg-yellow-50 text-yellow-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{page.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {page.updatedAt ? format(new Date(page.updatedAt), "MMM d, yyyy") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
