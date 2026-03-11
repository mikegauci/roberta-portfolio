"use client";

import { useState } from "react";
import type { AboutContent } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

interface Props {
  about: AboutContent | null;
}

export default function CvPersonalForm({ about }: Props) {
  const [form, setForm] = useState({
    name: about?.name ?? "",
    title: about?.title ?? "",
    phone: about?.phone ?? "",
    address: about?.address ?? "",
    birthday: about?.birthday ?? "",
    linkedin_url: about?.linkedin_url ?? "",
    bio_paragraph_1: about?.bio_paragraph_1 ?? "",
    cv_file_url: about?.cv_file_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleCvFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `cv/cv-file.${ext}`;
    const { error } = await supabase.storage.from("assets").upload(path, file, { upsert: true });

    if (!error) {
      const { data } = supabase.storage.from("assets").getPublicUrl(path);
      setForm((prev) => ({ ...prev, cv_file_url: data.publicUrl }));
    }
    setUploading(false);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("about_content")
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq("id", about?.id ?? 1);

    setMessage(error ? "Error saving changes." : "Changes saved successfully.");
    setSaving(false);
  }

  const cvFileName = form.cv_file_url ? form.cv_file_url.split("/").pop() : null;

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 space-y-6 mb-10">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Personal Details
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Name" name="name" value={form.name} onChange={handleChange} />
        <Field label="Title / Role" name="title" value={form.title} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          type="tel"
          placeholder="+356 7957 2224"
        />
        <Field
          label="Birthday"
          name="birthday"
          value={form.birthday}
          onChange={handleChange}
          placeholder="14-09-1992"
        />
      </div>

      <Field
        label="Address"
        name="address"
        value={form.address}
        onChange={handleChange}
        placeholder="53, The Pearl, Triq Ghajn Rasul, St Paul's Bay"
      />

      <Field
        label="LinkedIn URL"
        name="linkedin_url"
        value={form.linkedin_url}
        onChange={handleChange}
        type="url"
      />

      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
          About Me
        </label>
        <textarea
          name="bio_paragraph_1"
          value={form.bio_paragraph_1}
          onChange={handleChange}
          rows={4}
          className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#1a2744] resize-y"
        />
      </div>

      {/* CV file upload */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
          CV File (PDF or image)
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer border border-gray-200 px-4 py-2.5 text-sm hover:border-[#1a2744] transition-colors bg-white">
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
            <span>{uploading ? "Uploading…" : "Upload file"}</span>
            <input
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={handleCvFileUpload}
              disabled={uploading}
            />
          </label>
          {cvFileName && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg
                className="w-4 h-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <a
                href={form.cv_file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline truncate max-w-xs"
              >
                {cvFileName}
              </a>
            </div>
          )}
        </div>
      </div>

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
      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#1a2744]"
      />
    </div>
  );
}
