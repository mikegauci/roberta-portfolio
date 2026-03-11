import { supabase } from "@/lib/supabase";
import Navbar from "./Navbar";

export default async function NavbarWrapper() {
  let logoUrl = "";
  let logoHeight = 32;

  try {
    const { data } = await supabase.from("about_content").select("logo_url, logo_height").single();
    if (data?.logo_url) logoUrl = data.logo_url;
    if (data?.logo_height) logoHeight = data.logo_height;
  } catch {}

  return <Navbar logoUrl={logoUrl} logoHeight={logoHeight} />;
}
