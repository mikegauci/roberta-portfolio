"use client";

import { useState } from "react";
import Image from "next/image";
import type { AboutContent } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

interface Props {
  about: AboutContent | null;
}

export default function AboutForm({ about }: Props) {
  const [form, setForm] = useState({
    name: about?.name ?? "",
    title: about?.title ?? "",
    bio_paragraph_1: about?.bio_paragraph_1 ?? "",
    bio_paragraph_2: about?.bio_paragraph_2 ?? "",
    graduation_text: about?.graduation_text ?? "",
    linkedin_url: about?.linkedin_url ?? "",
    profile_image_url: about?.profile_image_url ?? "",
    profile_image_width: about?.profile_image_width ?? 50,
    logo_url: about?.logo_url ?? "",
    logo_height: about?.logo_height ?? 32,
    favicon_url: about?.favicon_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleNumberChange(name: string, value: number) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageUrl(name: string, url: string) {
    setForm((prev) => ({ ...prev, [name]: url }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("about_content")
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq("id", about?.id ?? 1);

    if (error) {
      setMessage("Error saving changes. Please try again.");
    } else {
      setMessage("Changes saved successfully.");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Image uploads */}
      <div className="grid grid-cols-2 gap-6">
        <ImageUploadField
          label="Profile Photo"
          storagePath="profile/photo"
          currentUrl={form.profile_image_url}
          onUploaded={(url) => handleImageUrl("profile_image_url", url)}
        />
        <ImageUploadField
          label="Logo"
          storagePath="logo/logo"
          currentUrl={form.logo_url}
          onUploaded={(url) => handleImageUrl("logo_url", url)}
        />
      </div>

      {/* Favicon */}
      <div className="max-w-[calc(50%-12px)]">
        <ImageUploadField
          label="Favicon"
          storagePath="favicon/favicon"
          currentUrl={form.favicon_url}
          onUploaded={(url) => handleImageUrl("favicon_url", url)}
          hint="Recommended: square PNG or ICO, 32×32 or 64×64px"
        />
      </div>

      {/* Image sizes */}
      <div className="grid grid-cols-2 gap-6">
        <SliderField
          label="Profile photo width"
          unit="%"
          name="profile_image_width"
          value={form.profile_image_width}
          min={20}
          max={80}
          step={5}
          onChange={handleNumberChange}
        />
        <SliderField
          label="Logo height"
          unit="px"
          name="logo_height"
          value={form.logo_height}
          min={16}
          max={72}
          step={4}
          onChange={handleNumberChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Field label="Name" name="name" value={form.name} onChange={handleChange} />
        <Field label="Title" name="title" value={form.title} onChange={handleChange} />
      </div>

      <TextareaField
        label="Bio paragraph 1"
        name="bio_paragraph_1"
        value={form.bio_paragraph_1}
        onChange={handleChange}
        rows={5}
      />

      <TextareaField
        label="Bio paragraph 2"
        name="bio_paragraph_2"
        value={form.bio_paragraph_2}
        onChange={handleChange}
        rows={5}
      />

      <Field
        label="Graduation text"
        name="graduation_text"
        value={form.graduation_text}
        onChange={handleChange}
      />

      <Field
        label="LinkedIn URL"
        name="linkedin_url"
        value={form.linkedin_url}
        onChange={handleChange}
        type="url"
      />

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#1a2744] text-white px-8 py-3 text-sm tracking-wider hover:bg-[#243256] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {message && (
          <p className={`text-sm ${message.includes("Error") ? "text-red-500" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </div>
    </form>
  );
}

function ImageUploadField({
  label,
  storagePath,
  currentUrl,
  onUploaded,
  hint,
}: {
  label: string;
  storagePath: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const ext = file.name.split(".").pop();
    const path = `${storagePath}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("assets")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError("Upload failed. Make sure the 'assets' bucket exists and is public in Supabase.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("assets").getPublicUrl(path);
    onUploaded(data.publicUrl);
    setUploading(false);
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>

      {currentUrl ? (
        <div className="mb-2 relative w-full h-32 border border-gray-200 bg-gray-50 overflow-hidden">
          <Image src={currentUrl} alt={label} fill className="object-contain p-2" />
        </div>
      ) : (
        <div className="mb-2 w-full h-32 border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
          <span className="text-xs text-gray-400">No image yet</span>
        </div>
      )}

      <label className="flex items-center justify-center gap-2 cursor-pointer border border-gray-200 px-4 py-2.5 text-sm hover:border-[#1a2744] transition-colors bg-white w-full">
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

      {hint && <p className="text-gray-400 text-xs mt-1">{hint}</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a2744] bg-white"
      />
    </div>
  );
}

function SliderField({
  label,
  unit,
  name,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  unit: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (name: string, value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-xs font-semibold text-[#1a2744]">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        name={name}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(name, Number(e.target.value))}
        className="w-full accent-[#1a2744]"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

function TextareaField({
  label,
  name,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a2744] bg-white resize-y"
      />
    </div>
  );
}
