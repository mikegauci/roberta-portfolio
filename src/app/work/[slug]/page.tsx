import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Project, DetailImageRow } from "@/lib/database.types";
import NavbarWrapper from "@/components/NavbarWrapper";
import ProjectGallery from "./ProjectGallery";

function normalizeDetailImages(raw: unknown): DetailImageRow[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  if (typeof raw[0] === "string") {
    return (raw as string[]).map((url) => ({ columns: 1 as const, images: [url] }));
  }
  return raw as DetailImageRow[];
}

async function getProject(slug: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).single();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

async function getRelatedProjects(excludeId: number): Promise<Project[]> {
  try {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .neq("id", excludeId)
      .neq("slug", "");
    if (!data?.length) return [];
    // Shuffle and pick 3
    return data.sort(() => Math.random() - 0.5).slice(0, 3);
  } catch {
    return [];
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  const related = await getRelatedProjects(project.id);

  return (
    <>
      <NavbarWrapper />
      <main className="pt-14 min-h-screen">
        {/* Top bar — back link + category inline */}
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-[#1a2744] tracking-wider uppercase transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to work
          </Link>
          <p className="text-xs tracking-widest text-gray-400 uppercase">{project.category}</p>
        </div>

        {/* Title + description — centered */}
        <div className="text-center px-8 pb-12">
          <h1 className="text-4xl font-light text-[#1a2744]">{project.title}</h1>
          {project.description && (
            <p className="mt-4 text-sm leading-7 text-gray-600 max-w-2xl mx-auto">
              {project.description}
            </p>
          )}
        </div>

        {/* Images */}
        <ProjectGallery
          rows={normalizeDetailImages(project.detail_images)}
          title={project.title}
          fallbackImageUrl={project.image_url || undefined}
        />

        {/* You may also like */}
        {related.length > 0 && (
          <div className="px-8 py-20">
            <p className="text-xs tracking-widest text-gray-400 uppercase text-center mb-10">
              You may also like
            </p>
            <div className="grid grid-cols-3 gap-px bg-gray-200">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/work/${p.slug}`}
                  className="group relative aspect-square bg-gray-100 overflow-hidden block"
                >
                  {p.image_url ? (
                    <Image
                      src={p.image_url}
                      alt={p.title}
                      fill
                      sizes="33vw"
                      quality={90}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                      <span className="text-xs text-gray-400 tracking-widest uppercase">
                        {p.category}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[#1a2744]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                    <p className="text-white text-lg font-light tracking-wide">{p.title}</p>
                    <p className="text-white/60 text-xs tracking-widest uppercase mt-2">
                      {p.category}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
