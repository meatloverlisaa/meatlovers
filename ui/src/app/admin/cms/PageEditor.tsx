"use client";

import { useState } from "react";
import type { ContentPage } from "./types";
import { PAGE_TYPES } from "./types";

export function PageEditor({
  page,
  onSave,
  onCancel,
}: {
  page: ContentPage | null;
  onSave: (data: Partial<ContentPage>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<ContentPage>>(
    page || { title: "", slug: "", page_type: "CUSTOM", content: "", is_published: false, meta_title: "", meta_description: "" }
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-zinc-200 overflow-hidden animate-in fade-in zoom-in-95"
        style={{ animation: "fadeIn 0.2s ease-out" }}
      >
        <div className="bg-gradient-to-r from-red-700 to-red-900 px-6 py-4">
          <h2 className="text-lg font-bold text-white">
            {page ? "Edit Page" : "Create New Page"}
          </h2>
          <p className="text-sm text-red-200 mt-0.5">
            {page ? `Editing "${page.title}"` : "Add a new content page to your website"}
          </p>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-800 mb-1.5">Title *</label>
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData({ ...formData, title, slug: formData.slug || autoSlug(title) });
                }}
                placeholder="e.g. Our Story"
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-800 mb-1.5">Slug *</label>
              <input
                type="text"
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="our-story"
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-800 mb-1.5">Page Type</label>
              <select
                value={formData.page_type || "CUSTOM"}
                onChange={(e) => setFormData({ ...formData, page_type: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition"
              >
                {PAGE_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-zinc-200 px-4 py-2.5 w-full hover:bg-zinc-50 transition">
                <input
                  type="checkbox"
                  checked={formData.is_published || false}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-300 text-red-700 focus:ring-red-500"
                />
                <span className="text-sm font-semibold text-zinc-800">Published</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-800 mb-1.5">Content *</label>
            <textarea
              value={formData.content || ""}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              placeholder="Page content (supports HTML)..."
              className="w-full resize-none rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-800 mb-1.5">Meta Title</label>
              <input
                type="text"
                value={formData.meta_title || ""}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                placeholder="SEO title"
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-800 mb-1.5">Meta Description</label>
              <input
                type="text"
                value={(formData.meta_description as string) || ""}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                placeholder="SEO description"
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !formData.title || !formData.slug || !formData.content}
            className="rounded-lg bg-red-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-50 transition shadow-sm"
          >
            {saving ? "Saving..." : page ? "Update Page" : "Create Page"}
          </button>
        </div>
      </div>
    </div>
  );
}
