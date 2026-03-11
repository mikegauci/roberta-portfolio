import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import { supabase } from "@/lib/supabase";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await supabase.from("about_content").select("favicon_url").single();
  return {
    title: "Roberta Attard | Creative Portfolio",
    description: "Graphic Designer specialising in branding, illustration, and print design.",
    icons: data?.favicon_url ? { icon: data.favicon_url } : undefined,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={playfair.variable}>{children}</body>
    </html>
  );
}
