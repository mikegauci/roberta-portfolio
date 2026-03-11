"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "About me" },
  { href: "/work", label: "Work" },
  { href: "/cv", label: "CV" },
];

interface Props {
  logoUrl?: string;
  logoHeight?: number;
}

export default function Navbar({ logoUrl, logoHeight = 32 }: Props) {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm tracking-wide transition-colors ${
                pathname === link.href
                  ? "text-[#1a2744] font-semibold"
                  : "text-gray-500 hover:text-[#1a2744]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {logoUrl && (
          <Link href="/" className="flex items-center">
            <Image
              src={logoUrl}
              alt="Logo"
              width={200}
              height={logoHeight}
              style={{ height: logoHeight, width: "auto" }}
              className="object-contain"
            />
          </Link>
        )}
      </div>
    </nav>
  );
}
