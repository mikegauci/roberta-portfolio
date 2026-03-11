import { supabase } from "@/lib/supabase";
import type { CvSection, AboutContent } from "@/lib/database.types";
import CvManager from "./CvManager";
import CvPersonalForm from "./CvPersonalForm";

async function getAboutContent(): Promise<AboutContent | null> {
  try {
    const { data, error } = await supabase.from("about_content").select("*").single();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

async function getCvSections(): Promise<CvSection[]> {
  try {
    const { data, error } = await supabase
      .from("cv_sections")
      .select("*")
      .order("order_index", { ascending: true });
    if (error || !data?.length) return [];
    return data;
  } catch {
    return [];
  }
}

export default async function AdminCvPage() {
  const [about, sections] = await Promise.all([getAboutContent(), getCvSections()]);

  return (
    <div>
      <h1 className="text-2xl font-light text-[#1a2744] mb-2">Edit CV</h1>
      <p className="text-sm text-gray-500 mb-10">
        Manage your personal details, CV file, and sections.
      </p>

      <CvPersonalForm about={about} />
      <CvManager initialSections={sections} />
    </div>
  );
}
