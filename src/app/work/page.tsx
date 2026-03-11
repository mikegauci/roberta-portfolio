import { supabase } from "@/lib/supabase";
import type { Project } from "@/lib/database.types";
import NavbarWrapper from "@/components/NavbarWrapper";
import Image from "next/image";
import Link from "next/link";

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

async function getColumns(): Promise<number> {
  try {
    const { data } = await supabase.from("about_content").select("projects_columns").single();
    return data?.projects_columns ?? 2;
  } catch {
    return 2;
  }
}

export default async function WorkPage() {
  const [projects, columns] = await Promise.all([getProjects(), getColumns()]);

  const colClasses: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-4",
  };
  const gridClass = colClasses[columns] ?? "grid-cols-1 md:grid-cols-2";

  return (
    <>
      <NavbarWrapper />
      <main className="pt-14">
        <div className={`grid ${gridClass}`}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </main>
    </>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const href = project.slug ? `/work/${project.slug}` : "#";
  return (
    <Link href={href} className="group relative aspect-square bg-gray-100 overflow-hidden block">
      {project.image_url ? (
        <Image
          src={project.image_url}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={100}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 border border-gray-200">
          <div className="w-16 h-16 rounded-full bg-gray-200 mb-4 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-xs text-gray-400 tracking-widest uppercase">{project.category}</p>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-[#1a2744]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
        <p className="text-white text-lg font-light tracking-wide">{project.title}</p>
        <p className="text-white/60 text-xs tracking-widest uppercase mt-2">{project.category}</p>
      </div>
    </Link>
  );
}
