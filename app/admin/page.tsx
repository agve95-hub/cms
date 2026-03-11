import { db, schema } from "@/lib/db";
import { eq, desc, count } from "drizzle-orm";
import Link from "next/link";
import { FileText, PenTool, Image, Inbox, Clock } from "lucide-react";
import { format } from "date-fns";

export default function DashboardPage() {
  const pageCount = db.select({ count: count() }).from(schema.pages).get()?.count || 0;
  const postCount = db.select({ count: count() }).from(schema.posts).get()?.count || 0;
  const mediaCount = db.select({ count: count() }).from(schema.media).get()?.count || 0;
  const unreadForms = db.select({ count: count() }).from(schema.formSubmissions).where(eq(schema.formSubmissions.read, false)).get()?.count || 0;

  const recentActivity = db.select().from(schema.activityLog).orderBy(desc(schema.activityLog.createdAt)).limit(10).all();
  const drafts = db.select().from(schema.pages).where(eq(schema.pages.status, "draft")).limit(5).all();
  const draftPosts = db.select().from(schema.posts).where(eq(schema.posts.status, "draft")).limit(5).all();

  const stats = [
    { label: "Pages", value: pageCount, icon: FileText, href: "/admin/pages", color: "bg-blue-50 text-blue-700" },
    { label: "Posts", value: postCount, icon: PenTool, href: "/admin/posts", color: "bg-green-50 text-green-700" },
    { label: "Media", value: mediaCount, icon: Image, href: "/admin/media", color: "bg-purple-50 text-purple-700" },
    { label: "Unread Forms", value: unreadForms, icon: Inbox, href: "/admin/forms", color: "bg-amber-50 text-amber-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center`}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-sm">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <Activity size={14} className="text-gray-400 mt-1 shrink-0" />
                  <div>
                    <span className="font-medium text-gray-700 capitalize">{a.action}</span>
                    <span className="text-gray-500"> {a.entityType}: </span>
                    <span className="text-gray-900">{a.entityTitle}</span>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {a.createdAt ? format(new Date(a.createdAt), "MMM d, h:mm a") : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Drafts</h2>
          {[...drafts, ...draftPosts].length === 0 ? (
            <p className="text-gray-500 text-sm">No drafts.</p>
          ) : (
            <div className="space-y-2">
              {drafts.map((d) => (
                <Link key={d.id} href={`/admin/pages/${d.id}`} className="flex items-center gap-2 text-sm hover:bg-gray-50 p-2 rounded-lg">
                  <FileText size={14} className="text-gray-400" />
                  <span className="text-gray-900">{d.title}</span>
                  <span className="text-xs text-gray-400 ml-auto">Page</span>
                </Link>
              ))}
              {draftPosts.map((d) => (
                <Link key={d.id} href={`/admin/posts/${d.id}`} className="flex items-center gap-2 text-sm hover:bg-gray-50 p-2 rounded-lg">
                  <PenTool size={14} className="text-gray-400" />
                  <span className="text-gray-900">{d.title}</span>
                  <span className="text-xs text-gray-400 ml-auto">Post</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Activity({ size, className }: { size: number; className?: string }) {
  return <Clock size={size} className={className} />;
}
