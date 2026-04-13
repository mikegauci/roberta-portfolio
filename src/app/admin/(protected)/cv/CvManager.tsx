"use client";

import { useState } from "react";
import type { CvSection, CvItem } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

interface Props {
  initialSections: CvSection[];
}

export default function CvManager({ initialSections }: Props) {
  const [sections, setSections] = useState<CvSection[]>(initialSections);
  const [message, setMessage] = useState("");

  async function saveSection(section: CvSection) {
    const { error } = await supabase
      .from("cv_sections")
      .update({ items: section.items, section_title: section.section_title })
      .eq("id", section.id);

    setMessage(error ? "Error saving section." : "Section saved.");
    setTimeout(() => setMessage(""), 3000);
  }

  function updateSection(sectionId: number, updated: CvSection) {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? updated : s)));
  }

  return (
    <div className="max-w-3xl space-y-10">
      {sections.map((section) => (
        <SectionEditor
          key={section.id}
          section={section}
          onChange={(updated) => updateSection(section.id, updated)}
          onSave={() => saveSection(section)}
        />
      ))}

      {message && (
        <p className={`text-sm ${message.includes("Error") ? "text-red-500" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

function SectionEditor({
  section,
  onChange,
  onSave,
}: {
  section: CvSection;
  onChange: (s: CvSection) => void;
  onSave: () => void;
}) {
  const items = section.items;
  const [saving, setSaving] = useState(false);

  function updateItem(index: number, field: keyof CvItem, value: string) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...section, items: updated });
  }

  function addItem() {
    onChange({
      ...section,
      items: [...items, { title: "", subtitle: "", date: "", description: "" }],
    });
  }

  function removeItem(index: number) {
    onChange({ ...section, items: items.filter((_, i) => i !== index) });
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const updated = [...items];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    onChange({ ...section, items: updated });
  }

  async function handleSave() {
    setSaving(true);
    await onSave();
    setSaving(false);
  }

  return (
    <div className="bg-white border border-gray-200 p-6">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">
        {section.section_title}
      </h2>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="border border-gray-100 p-4 relative flex gap-3">
            <div className="flex flex-col gap-0.5 pt-6">
              <button
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
                className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs leading-none"
              >
                ▲
              </button>
              <button
                onClick={() => moveItem(index, 1)}
                disabled={index === items.length - 1}
                className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs leading-none"
              >
                ▼
              </button>
            </div>
            <div className="flex-1 min-w-0">
            <button
              onClick={() => removeItem(index)}
              className="absolute top-3 right-3 text-xs text-red-400 hover:text-red-600"
            >
              Remove
            </button>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <InputField
                label="Title"
                value={item.title}
                onChange={(v) => updateItem(index, "title", v)}
              />
              {section.section_title !== "Skills" && (
                <InputField
                  label="Subtitle"
                  value={item.subtitle || ""}
                  onChange={(v) => updateItem(index, "subtitle", v)}
                />
              )}
            </div>

            {section.section_title !== "Skills" && (
              <div className="mb-3">
                <InputField
                  label="Date"
                  value={item.date || ""}
                  onChange={(v) => updateItem(index, "date", v)}
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                {section.section_title === "Skills" ? "Level" : "Description"}
              </label>
              {section.section_title === "Skills" ? (
                <DotPicker
                  value={parseInt(item.description || "0") || 0}
                  onChange={(v) => updateItem(index, "description", String(v))}
                />
              ) : (
                <textarea
                  value={item.description || ""}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  rows={2}
                  className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#1a2744] resize-none"
                />
              )}
            </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={addItem}
          className="text-sm text-[#1a2744] border border-dashed border-[#1a2744]/40 px-4 py-2 hover:border-[#1a2744] transition-colors"
        >
          + Add item
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1a2744] text-white px-6 py-2 text-sm hover:bg-[#243256] transition-colors disabled:opacity-50 ml-auto"
        >
          {saving ? "Saving…" : "Save section"}
        </button>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#1a2744]"
      />
    </div>
  );
}

function DotPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div className="flex items-center gap-1.5 py-2">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((dot) => (
        <button
          key={dot}
          type="button"
          onClick={() => onChange(dot)}
          onMouseEnter={() => setHovered(dot)}
          onMouseLeave={() => setHovered(null)}
          className={`w-4 h-4 rounded-full transition-colors ${
            dot <= display ? "bg-[#4db6ac]" : "bg-gray-200"
          }`}
          aria-label={`Level ${dot}`}
        />
      ))}
      <span className="text-xs text-gray-400 ml-2">{value}/10</span>
    </div>
  );
}
