import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { Image } from "lucide-react";

export default function MediaPage() {
  const allMedia = db.select().from(schema.media).orderBy(desc(schema.media.createdAt)).all();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
      </div>

      {allMedia.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          <Image size={40} className="mx-auto mb-3 text-gray-300" />
          <p>No media uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {allMedia.map((m) => (
            <div key={m.id} className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="aspect-square bg-gray-100">
                <img src={`/${m.filepath}`} alt={m.altText || m.filename} className="w-full h-full object-cover" />
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-600 truncate">{m.filename}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
