import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { format } from "date-fns";

export default function FormsPage() {
  const submissions = db.select().from(schema.formSubmissions).orderBy(desc(schema.formSubmissions.createdAt)).all();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Form Submissions</h1>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {submissions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No submissions yet.</div>
        ) : submissions.map((s) => (
          <div key={s.id} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${s.read ? "bg-gray-300" : "bg-brand-500"}`} />
              <span className="text-sm font-medium text-gray-700 capitalize">{s.formName}</span>
              <span className="text-xs text-gray-400 ml-auto">
                {s.createdAt ? format(new Date(s.createdAt), "MMM d, yyyy h:mm a") : ""}
              </span>
            </div>
            <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
              {JSON.stringify(JSON.parse(s.data), null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
