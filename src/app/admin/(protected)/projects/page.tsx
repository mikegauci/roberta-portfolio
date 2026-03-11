import { supabase } from "@/lib/supabase";
import type { Project } from "@/lib/database.types";
import ProjectsManager from "./ProjectsManager";

async function getProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("order_index", { ascending: true });
    if (error || !data?.length) return [];
    return data;
  } catch {
    return [];
  }
}

async function getProjectsColumns(): Promise<number> {
  try {
    const { data } = await supabase.from("about_content").select("projects_columns").single();
    return data?.projects_columns ?? 2;
  } catch {
    return 2;
  }
}

export default async function AdminProjectsPage() {
  const [projects, columns] = await Promise.all([getProjects(), getProjectsColumns()]);
  return (
    <div>
      <h1 className="text-2xl font-light text-[#1a2744] mb-2">Projects</h1>
      <p className="text-sm text-gray-500 mb-10">Manage your portfolio projects.</p>
      <ProjectsManager initialProjects={projects} initialColumns={columns} />
    </div>
  );
}
