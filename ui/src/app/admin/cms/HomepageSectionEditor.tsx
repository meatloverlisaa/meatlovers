"use client";

import { useState } from "react";
import { API_BASE } from "./types";

interface HomepageSection {
  id: string;
  title: string;
  slug: string;
  content: string;
  is_published: boolean;
}

export function HomepageSectionEditor({
  sections,
  onRefresh,
}: {
  sections: HomepageSection[];
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newSection, setNewSection] = useState({ title: "", content: "" });

  const sectionIcons: Record<string, string> = {
    hero: "🏠",
    menu: "🍽️",
    catering: "🎉",
    about: "📖",
    contact: "📞",
    specials: "⭐",
    testimonials: "💬",
  };

  const startEdit = (s: HomepageSection) => {
    setEditing(s.id);
    setEditContent(s.content);
    setEditTitle(s.title);
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      await fetch(`${API_BASE}/cms/pages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      setEditing(null);
      onRefresh();
    } catch (e) {
      console.error("Failed to save section:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async () => {
    if (!newSection.title || !newSection.content) return;
    setSaving(true);
    try {
      const slug = `homepage-${newSection.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      await fetch(`${API_BASE}/cms/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newSection.title,
          slug,
          page_type: "HOMEPAGE",
          content: newSection.content,
          is_published: true,
        }),
      });
      setShowAdd(false);
      setNewSection({ title: "", content: "" });
      onRefresh();
    } catch (e) {
      console.error("Failed to add section:", e);
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (id: string) => {
    await fetch(`${API_BASE}/cms/pages/${id}/publish`, { method: "PATCH" });
    onRefresh();
  };

  const getIcon = (slug: string) => {
    const key = Object.keys(sectionIcons).find((k) => slug.includes(k));
    return key ? sectionIcons[key] : "📄";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-zinc-900">Homepage Sections</h3>
          <p className="text-sm text-zinc-500 mt-0.5">Manage your homepage content blocks</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800 transition shadow-sm"
        >
          {showAdd ? "Cancel" : "+ Add Section"}
        </button>
      </div>

      {showAdd && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50/50 p-5">
          <h4 className="font-semibold text-zinc-900 mb-3">New Homepage Section</h4>
          <div className="grid gap-3">
            <input
              type="text"
              placeholder="Section title (e.g. Specials Banner)"
              value={newSection.title}
              onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
            />
            <textarea
              placeholder="Section content (HTML supported)..."
              value={newSection.content}
              onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAddSection}
                disabled={saving || !newSection.title || !newSection.content}
                className="rounded-lg bg-red-700 px-5 py-2 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-50 transition"
              >
                {saving ? "Adding..." : "Add Section"}
              </button>
            </div>
          </div>
        </div>
      )}

      {sections.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-4xl mb-3">🏠</p>
          <p className="font-semibold">No homepage sections yet</p>
          <p className="text-sm mt-1">Create your first homepage section above</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sections.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-all group"
            >
              {editing === s.id ? (
                <div className="p-5 space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-sm font-semibold focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={5}
                    className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm font-mono focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditing(null)} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition">
                      Cancel
                    </button>
                    <button onClick={() => handleSave(s.id)} disabled={saving} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-50 transition">
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 flex items-start gap-4">
                  <span className="text-2xl mt-0.5">{getIcon(s.slug)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-zinc-900">{s.title}</h4>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${s.is_published ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-600"}`}>
                        {s.is_published ? "Live" : "Draft"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{s.content.substring(0, 120)}...</p>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(s)} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition">
                      Edit
                    </button>
                    <button onClick={() => togglePublish(s.id)} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition">
                      {s.is_published ? "Unpublish" : "Publish"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
