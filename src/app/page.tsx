import { supabase } from "@/lib/supabase";
import type { AboutContent } from "@/lib/database.types";
import NavbarWrapper from "@/components/NavbarWrapper";
import Link from "next/link";
import Image from "next/image";

async function getAboutContent(): Promise<AboutContent | null> {
  try {
    const { data, error } = await supabase.from("about_content").select("*").single();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export default async function AboutPage() {
  const about = await getAboutContent();

  if (!about) {
    return (
      <>
        <NavbarWrapper />
        <main className="pt-14 min-h-screen flex items-center justify-center">
          <p className="text-sm text-gray-400">Content coming soon.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <NavbarWrapper />
      <style>{`@media (min-width: 1024px) { .photo-panel { width: ${about.profile_image_width}% !important; } }`}</style>
      <main className="pt-14 flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
        {/* Top on mobile / Left on desktop — profile photo */}
        <div className="photo-panel w-full h-72 shrink-0 relative bg-gray-900 lg:h-full">
          {about.profile_image_url ? (
            <Image
              src={about.profile_image_url}
              alt={about.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center">
              <span className="text-gray-600 text-sm">Profile photo</span>
            </div>
          )}
        </div>

        {/* Bottom on mobile / Right on desktop — content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 lg:px-16 py-10 overflow-y-auto">
          <div className="max-w-md w-full text-center">
            <h1 className="text-4xl font-light text-[#1a2744] mb-2">
              Hi, I&apos;m {about.name.split(" ")[0]}.
            </h1>
            <p className="text-sm tracking-widest text-gray-500 uppercase mb-8">{about.title}</p>

            <p className="text-sm leading-7 text-gray-700 mb-5">{about.bio_paragraph_1}</p>
            <p className="text-sm leading-7 text-gray-700 mb-5">{about.bio_paragraph_2}</p>
            <p className="text-sm leading-7 text-gray-700 mb-8">{about.graduation_text}</p>

            {/* LinkedIn */}
            <div className="mb-6">
              <a
                href={about.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#1a2744] text-[#1a2744] hover:bg-[#1a2744] hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>

            <Link
              href="/work"
              className="inline-block bg-[#1a2744] text-white px-10 py-3 text-sm tracking-wider hover:bg-[#243256] transition-colors"
            >
              Portfolio
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
