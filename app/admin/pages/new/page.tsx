"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye } from "lucide-react";

export default function NewPagePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<string>("draft");
  const [blocks, setBlocks] = useState("[]");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug: slug || autoSlug(title), blocks, status, seoTitle: seoTitle || null, seoDescription: seoDescription || null }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/pages/${data.id}`);
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Page</h1>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving || !title} className="btn-primary">
            <Save size={16} className="mr-1.5" /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="label">Title</label>
            <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); if (!slug) setSlug(autoSlug(e.target.value)); }} className="input text-lg font-semibold" placeholder="Page title" />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="label">Content Blocks</label>
            <textarea value={blocks} onChange={(e) => setBlocks(e.target.value)} className="input font-mono text-xs" rows={12} placeholder='[{"id":"1","type":"heading","data":{"text":"Hello","level":1},"order":0}]' />
            <p className="text-xs text-gray-400 mt-2">JSON block array. The visual drag-and-drop editor will be integrated here.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="label">Slug</label>
            <div className="flex items-center gap-1 text-sm text-gray-400 mb-1">/</div>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="input" placeholder="page-slug" />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="label">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-medium text-gray-900 mb-3">SEO</h3>
            <div className="space-y-3">
              <div>
                <label className="label">SEO Title</label>
                <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="input" placeholder="Override page title for search engines" maxLength={70} />
                <p className="text-xs text-gray-400 mt-1">{seoTitle.length}/70</p>
              </div>
              <div>
                <label className="label">Meta Description</label>
                <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="input" rows={3} placeholder="Page description for search results" maxLength={160} />
                <p className="text-xs text-gray-400 mt-1">{seoDescription.length}/160</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
