import { db, schema } from "@/lib/db";

export default function MenusPage() {
  const menus = db.select().from(schema.navigationMenus).all();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Navigation Menus</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {menus.length === 0 ? (
          <p className="text-gray-500 text-sm">No menus configured yet. Menus can be managed via the API.</p>
        ) : (
          <div className="space-y-4">
            {menus.map((m) => (
              <div key={m.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">{m.name}</h3>
                <pre className="text-xs text-gray-500 mt-2 overflow-x-auto">{JSON.stringify(JSON.parse(m.items), null, 2)}</pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
