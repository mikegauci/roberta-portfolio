import { supabase } from "@/lib/supabase";
import type { CvSection, AboutContent } from "@/lib/database.types";
import NavbarWrapper from "@/components/NavbarWrapper";

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

export default async function CvPage() {
  const [about, sections] = await Promise.all([getAboutContent(), getCvSections()]);

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
      <main className="pt-14 min-h-screen">
        <div className="max-w-3xl mx-auto px-8 py-20">
          {/* Header */}
          <div className="flex items-start justify-between mb-16">
            <div>
              <p className="text-xs tracking-widest text-gray-400 uppercase mb-2">Hello I&apos;m</p>
              <h1 className="text-4xl font-light text-[#1a2744] mb-1">{about.name}</h1>
              <p className="text-xs tracking-widest text-gray-500 uppercase">{about.title}</p>
            </div>
            {about.cv_file_url && (
              <a
                href={about.cv_file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#1a2744] border border-[#1a2744] px-6 py-2 hover:bg-[#1a2744] hover:text-white transition-colors tracking-wider shrink-0"
              >
                Download CV
              </a>
            )}
          </div>

          {/* Contact info */}
          {(about.phone ||
            about.linkedin_url ||
            about.address ||
            about.birthday ||
            about.bio_paragraph_1) && (
            <div className="grid grid-cols-2 gap-12 mb-16">
              <div className="space-y-3">
                {about.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 text-gray-400 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {about.phone}
                  </div>
                )}
                {about.linkedin_url && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 text-gray-400 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    <a
                      href={about.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#1a2744] transition-colors"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}
                {about.address && (
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 text-gray-400 shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{about.address}</span>
                  </div>
                )}
              </div>

              {(about.bio_paragraph_1 || about.birthday) && (
                <div>
                  {about.birthday && <p className="text-xs text-gray-400 mb-3">{about.birthday}</p>}
                  {about.bio_paragraph_1 && (
                    <p className="text-sm leading-7 text-gray-600">{about.bio_paragraph_1}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CV Sections */}
          <div className="space-y-16">
            {sections.map((section) => (
              <section key={section.id}>
                <h2 className="text-xs tracking-widest uppercase text-gray-400 mb-8 pb-3 border-b border-gray-200">
                  {section.section_title}
                </h2>
                {section.section_title === "Skills" ? (
                  <div className="space-y-3">
                    {section.items.map((item, i) => {
                      const level = parseInt(item.description || "0") || 0;
                      return (
                        <div key={i} className="flex items-center gap-6">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 10 }, (_, j) => (
                              <span
                                key={j}
                                className={`inline-block w-3.5 h-3.5 rounded-full ${
                                  j < level ? "bg-[#4db6ac]" : "bg-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-700">{item.title}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {section.items.map((item, i) => (
                      <div key={i} className="flex gap-8">
                        {item.date && (
                          <div className="w-28 shrink-0 text-xs text-gray-400 pt-1">
                            {item.date}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-[#1a2744]">{item.title}</p>
                          {item.subtitle && (
                            <p className="text-sm text-gray-500 mt-0.5">{item.subtitle}</p>
                          )}
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-2 leading-6">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
