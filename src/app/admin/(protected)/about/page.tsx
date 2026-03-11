import { supabase } from "@/lib/supabase";
import type { AboutContent } from "@/lib/database.types";
import AboutForm from "./AboutForm";

async function getAboutContent(): Promise<AboutContent | null> {
  try {
    const { data, error } = await supabase.from("about_content").select("*").single();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export default async function AdminAboutPage() {
  const about = await getAboutContent();
  return (
    <div>
      <h1 className="text-2xl font-light text-[#1a2744] mb-2">Edit About</h1>
      <p className="text-sm text-gray-500 mb-10">Update your personal information and bio.</p>
      <AboutForm about={about} />
    </div>
  );
}
