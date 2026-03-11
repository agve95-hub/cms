import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { format } from "date-fns";

export default function ActivityPage() {
  const activities = db.select().from(schema.activityLog).orderBy(desc(schema.activityLog.createdAt)).limit(100).all();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Activity Log</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activities.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 text-sm capitalize text-gray-700">{a.action}</td>
                <td className="px-4 py-3 text-sm text-gray-500 capitalize">{a.entityType}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{a.entityTitle}</td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {a.createdAt ? format(new Date(a.createdAt), "MMM d, yyyy h:mm a") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
