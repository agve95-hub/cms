import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";

export default function RedirectsPage() {
  const redirectsList = db.select().from(schema.redirects).orderBy(desc(schema.redirects.createdAt)).all();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Redirects</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {redirectsList.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No redirects configured.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {redirectsList.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">{r.sourcePath}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">{r.destination}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{r.hits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
