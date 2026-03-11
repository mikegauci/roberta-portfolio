"use client";

import { useState } from "react";
import Image from "next/image";
import type { Project, DetailImageRow } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const CATEGORIES = ["Branding", "Web Design", "Print", "Illustration", "Photography", "Other"];

interface Props {
  initialProjects: Project[];
  initialColumns: number;
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Handles old string[] format from DB by converting to DetailImageRow[]
function normalizeDetailImages(raw: unknown): DetailImageRow[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  if (typeof raw[0] === "string") {
    return (raw as string[]).map((url) => ({ columns: 1, images: [url] }));
  }
  return raw as DetailImageRow[];
}

const emptyProject = {
  title: "",
  slug: "",
  image_url: "",
  category: "Branding",
  description: "",
  detail_images: [] as DetailImageRow[],
  order_index: 0,
};

export default function ProjectsManager({ initialProjects, initialColumns }: Props) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [columns, setColumns] = useState(initialColumns);
  const [savingColumns, setSavingColumns] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  const [adding, setAdding] = useState(false);
  const [newProject, setNewProject] = useState(emptyProject);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleColumnsChange(value: number) {
    setColumns(value);
    setSavingColumns(true);
    await supabase.from("about_content").update({ projects_columns: value }).eq("id", 1);
    setSavingColumns(false);
  }

  function startEdit(project: Project) {
    setEditingId(project.id);
    setEditForm({
      title: project.title,
      slug: project.slug,
      category: project.category,
      image_url: project.image_url,
      description: project.description,
      detail_images: normalizeDetailImages(project.detail_images),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function handleSaveEdit(id: number) {
    setSaving(true);
    const { error } = await supabase.from("projects").update(editForm).eq("id", id);
    if (error) {
      setMessage("Error saving project.");
    } else {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...editForm } : p)));
      setEditingId(null);
      setMessage("Project saved.");
    }
    setSaving(false);
  }

  async function handleAdd() {
    setSaving(true);
    setMessage("");
    const order = projects.length + 1;
    const { data, error } = await supabase
      .from("projects")
      .insert({ ...newProject, order_index: order })
      .select()
      .single();

    if (error || !data) {
      setMessage("Error adding project.");
    } else {
      setProjects((prev) => [...prev, data]);
      setNewProject(emptyProject);
      setAdding(false);
      setMessage("Project added.");
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this project?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (!error) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setMessage("Project deleted.");
    }
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const updated = [...projects];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    updated.forEach((p, i) => (p.order_index = i + 1));
    setProjects(updated);
    await Promise.all(
      updated.map((p) =>
        supabase.from("projects").update({ order_index: p.order_index }).eq("id", p.id)
      )
    );
  }

  async function handleMoveDown(index: number) {
    if (index === projects.length - 1) return;
    const updated = [...projects];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updated.forEach((p, i) => (p.order_index = i + 1));
    setProjects(updated);
    await Promise.all(
      updated.map((p) =>
        supabase.from("projects").update({ order_index: p.order_index }).eq("id", p.id)
      )
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Column count */}
      <div className="bg-white border border-gray-200 px-5 py-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Grid columns
          </label>
          <span className="text-xs font-semibold text-[#1a2744]">
            {columns} {savingColumns && <span className="text-gray-400 font-normal">saving…</span>}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={6}
          step={1}
          value={columns}
          onChange={(e) => handleColumnsChange(Number(e.target.value))}
          className="w-full accent-[#1a2744]"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 divide-y divide-gray-100 mb-6">
        {projects.map((project, index) => (
          <div key={project.id}>
            {/* Row */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs leading-none"
                >
                  ▲
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === projects.length - 1}
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs leading-none"
                >
                  ▼
                </button>
              </div>

              <div className="w-10 h-10 bg-gray-100 flex-shrink-0 overflow-hidden">
                {project.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1a2744] truncate">{project.title}</p>
                <p className="text-xs text-gray-400">{project.category}</p>
              </div>

              <button
                onClick={() => (editingId === project.id ? cancelEdit() : startEdit(project))}
                className="text-xs text-[#1a2744] hover:underline ml-2"
              >
                {editingId === project.id ? "Cancel" : "Edit"}
              </button>
              <button
                onClick={() => handleDelete(project.id)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Delete
              </button>
            </div>

            {/* Inline edit form */}
            {editingId === project.id && (
              <div className="bg-gray-50 border-t border-gray-100 px-5 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Title</label>
                    <input
                      type="text"
                      value={editForm.title ?? ""}
                      onChange={(e) => {
                        const title = e.target.value;
                        setEditForm((f) => ({ ...f, title, slug: slugify(title) }));
                      }}
                      className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#1a2744] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Category</label>
                    <select
                      value={editForm.category ?? "Branding"}
                      onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#1a2744] bg-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">URL slug</label>
                  <input
                    type="text"
                    value={editForm.slug ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
                    className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#1a2744] bg-white font-mono"
                    placeholder="e.g. casino-sherlock"
                  />
                  <p className="text-xs text-gray-400 mt-1">URL: /work/{editForm.slug || "…"}</p>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <textarea
                    value={editForm.description ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#1a2744] bg-white resize-y"
                    placeholder="Describe the project…"
                  />
                </div>

                <ImageUploadField
                  label="Thumbnail image"
                  storagePath={`projects/project-${project.id}-thumb`}
                  currentUrl={editForm.image_url ?? ""}
                  onUploaded={(url) => setEditForm((f) => ({ ...f, image_url: url }))}
                />

                <ImageRowsEditor
                  label="Detail page images"
                  projectId={project.id}
                  rows={(editForm.detail_images as DetailImageRow[]) ?? []}
                  onChange={(rows) => setEditForm((f) => ({ ...f, detail_images: rows }))}
                />

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => handleSaveEdit(project.id)}
                    disabled={saving}
                    className="bg-[#1a2744] text-white px-6 py-2 text-sm hover:bg-[#243256] transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {projects.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-gray-400">No projects yet.</div>
        )}
      </div>

      {/* Add new */}
      {adding ? (
        <div className="bg-white border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#1a2744]">New project</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Title</label>
              <input
                type="text"
                value={newProject.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setNewProject((p) => ({ ...p, title, slug: slugify(title) }));
                }}
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#1a2744]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Category</label>
              <select
                value={newProject.category}
                onChange={(e) => setNewProject((p) => ({ ...p, category: e.target.value }))}
                className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#1a2744] bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">URL slug</label>
            <input
              type="text"
              value={newProject.slug}
              onChange={(e) => setNewProject((p) => ({ ...p, slug: e.target.value }))}
              className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#1a2744] font-mono"
              placeholder="e.g. casino-sherlock"
            />
          </div>
          <ImageUploadField
            label="Thumbnail image"
            storagePath="projects/new-thumbnail"
            currentUrl={newProject.image_url}
            onUploaded={(url) => setNewProject((p) => ({ ...p, image_url: url }))}
          />
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAdd}
              disabled={saving || !newProject.title}
              className="bg-[#1a2744] text-white px-6 py-2 text-sm hover:bg-[#243256] transition-colors disabled:opacity-50"
            >
              {saving ? "Adding…" : "Add project"}
            </button>
            <button
              onClick={() => setAdding(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-[#1a2744] border border-dashed border-[#1a2744]/40 px-6 py-3 hover:border-[#1a2744] transition-colors"
        >
          + Add project
        </button>
      )}

      {message && (
        <p
          className={`text-sm mt-4 ${message.includes("Error") ? "text-red-500" : "text-green-600"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

function ImageUploadField({
  label,
  storagePath,
  currentUrl,
  onUploaded,
}: {
  label: string;
  storagePath: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const ext = file.name.split(".").pop();
    const path = `${storagePath}-${file.lastModified}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("assets")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError("Upload failed. Make sure the 'assets' bucket exists and is public.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("assets").getPublicUrl(path);
    onUploaded(data.publicUrl);
    setUploading(false);
  }

  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="flex items-center gap-4">
        {currentUrl ? (
          <div className="relative w-16 h-16 border border-gray-200 bg-gray-50 overflow-hidden flex-shrink-0">
            <Image src={currentUrl} alt={label} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-16 h-16 border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
            <span className="text-xs text-gray-400">None</span>
          </div>
        )}
        <label className="flex items-center gap-2 cursor-pointer border border-gray-200 px-4 py-2 text-sm hover:border-[#1a2744] transition-colors bg-white">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <span>{uploading ? "Uploading…" : "Upload image"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function ImageRowsEditor({
  label,
  projectId,
  rows,
  onChange,
}: {
  label: string;
  projectId: number;
  rows: DetailImageRow[];
  onChange: (rows: DetailImageRow[]) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor));
  const rowIds = rows.map((_, i) => i);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onChange(arrayMove(rows, active.id as number, over.id as number));
    }
  }

  function addRow() {
    onChange([...rows, { columns: 1, images: [] }]);
  }

  function removeRow(i: number) {
    onChange(rows.filter((_, idx) => idx !== i));
  }

  function setColumns(i: number, columns: 1 | 2 | 3 | 4 | 5) {
    const updated = [...rows];
    updated[i] = { ...updated[i], columns };
    onChange(updated);
  }

  function setImage(rowIdx: number, colIdx: number, url: string) {
    const updated = [...rows];
    const images = [...(updated[rowIdx].images ?? [])];
    images[colIdx] = url;
    updated[rowIdx] = { ...updated[rowIdx], images };
    onChange(updated);
  }

  function removeImage(rowIdx: number, colIdx: number) {
    const updated = [...rows];
    const images = [...(updated[rowIdx].images ?? [])];
    images[colIdx] = "";
    updated[rowIdx] = { ...updated[rowIdx], images };
    onChange(updated);
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {label}
      </label>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {rows.map((row, i) => (
              <SortableRow
                key={i}
                id={i}
                row={row}
                rowIndex={i}
                projectId={projectId}
                onSetColumns={(cols) => setColumns(i, cols)}
                onRemoveRow={() => removeRow(i)}
                onSetImage={(colIdx, url) => setImage(i, colIdx, url)}
                onRemoveImage={(colIdx) => removeImage(i, colIdx)}
                onReorderImages={(newImages) => {
                  const updated = [...rows];
                  updated[i] = { ...updated[i], images: newImages };
                  onChange(updated);
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={addRow}
        className="mt-2 flex items-center gap-2 text-sm text-[#1a2744] border border-dashed border-[#1a2744]/40 px-4 py-2 hover:border-[#1a2744] transition-colors"
      >
        + Add row
      </button>
    </div>
  );
}

function SortableRow({
  id,
  row,
  rowIndex,
  projectId,
  onSetColumns,
  onRemoveRow,
  onSetImage,
  onRemoveImage,
  onReorderImages,
}: {
  id: number;
  row: DetailImageRow;
  rowIndex: number;
  projectId: number;
  onSetColumns: (cols: 1 | 2 | 3 | 4 | 5) => void;
  onRemoveRow: () => void;
  onSetImage: (colIdx: number, url: string) => void;
  onRemoveImage: (colIdx: number) => void;
  onReorderImages: (images: string[]) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  // Separate sensors for image DnD with distance constraint to avoid conflicts with clicks
  const imageSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const imageIds = Array.from({ length: row.columns }, (_, j) => `r${rowIndex}-c${j}`);

  function handleImageDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = imageIds.indexOf(active.id as string);
      const newIdx = imageIds.indexOf(over.id as string);
      if (oldIdx !== -1 && newIdx !== -1) {
        const padded = Array.from({ length: row.columns }, (_, i) => row.images[i] ?? "");
        onReorderImages(arrayMove(padded, oldIdx, newIdx));
      }
    }
  }

  const rowStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={rowStyle} className="border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Row drag handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 mr-1 touch-none"
            aria-label="Drag row to reorder"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 6a2 2 0 110-4 2 2 0 010 4zm8 0a2 2 0 110-4 2 2 0 010 4zM8 14a2 2 0 110-4 2 2 0 010 4zm8 0a2 2 0 110-4 2 2 0 010 4zM8 22a2 2 0 110-4 2 2 0 010 4zm8 0a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          <span className="text-xs text-gray-400">Columns:</span>
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onSetColumns(n)}
              className={`w-7 h-7 text-xs border transition-colors ${
                row.columns === n
                  ? "bg-[#1a2744] text-white border-[#1a2744]"
                  : "border-gray-200 text-gray-500 hover:border-[#1a2744]"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onRemoveRow}
          className="text-xs text-red-400 hover:text-red-600"
        >
          Remove
        </button>
      </div>

      {/* Image slots with their own DnD context */}
      <DndContext
        sensors={imageSensors}
        collisionDetection={closestCenter}
        onDragEnd={handleImageDragEnd}
      >
        <SortableContext items={imageIds} strategy={rectSortingStrategy}>
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${row.columns}, minmax(0, 1fr))` }}
          >
            {imageIds.map((imgId, j) => (
              <SortableSlotUpload
                key={imgId}
                id={imgId}
                url={row.images[j] ?? ""}
                storagePath={`projects/project-${projectId}-r${rowIndex}-c${j}`}
                onUploaded={(url) => onSetImage(j, url)}
                onRemove={() => onRemoveImage(j)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableSlotUpload({
  id,
  url,
  storagePath,
  onUploaded,
  onRemove,
}: {
  id: string;
  url: string;
  storagePath: string;
  onUploaded: (url: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    cursor: url ? "grab" : "default",
  };

  return (
    <div ref={setNodeRef} style={style} {...(url ? { ...attributes, ...listeners } : {})}>
      <SlotUpload url={url} storagePath={storagePath} onUploaded={onUploaded} onRemove={onRemove} />
    </div>
  );
}

function SlotUpload({
  url,
  storagePath,
  onUploaded,
  onRemove,
}: {
  url: string;
  storagePath: string;
  onUploaded: (url: string) => void;
  onRemove: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${storagePath}-${file.lastModified}.${ext}`;
    const { error } = await supabase.storage.from("assets").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("assets").getPublicUrl(path);
      onUploaded(data.publicUrl);
    }
    setUploading(false);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    e.target.value = "";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative aspect-video border-2 border-dashed bg-gray-50 overflow-hidden transition-colors ${
        dragOver ? "border-[#1a2744] bg-[#1a2744]/5" : "border-gray-200"
      }`}
    >
      {uploading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <span className="text-xs text-gray-500">Uploading…</span>
        </div>
      )}

      {url ? (
        <>
          <Image src={url} alt="Slot" fill className="object-cover" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 bg-white/90 text-red-500 text-xs px-1.5 py-0.5 hover:bg-white leading-none z-10"
          >
            ✕
          </button>
          {dragOver && (
            <div className="absolute inset-0 bg-[#1a2744]/60 flex items-center justify-center z-10">
              <span className="text-white text-xs">Drop to replace</span>
            </div>
          )}
        </>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-gray-400 hover:text-[#1a2744] transition-colors gap-1">
          {dragOver ? (
            <>
              <svg
                className="w-5 h-5 text-[#1a2744]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span className="text-xs text-[#1a2744]">Drop to upload</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-xs">Add image</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}
