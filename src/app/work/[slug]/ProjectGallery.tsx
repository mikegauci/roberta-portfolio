"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { DetailImageRow } from "@/lib/database.types";

interface Props {
  rows: DetailImageRow[];
  title: string;
  fallbackImageUrl?: string;
}

export default function ProjectGallery({ rows, title, fallbackImageUrl }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Flatten all images from all rows into a single ordered array
  const allImages: string[] = rows.flatMap((row) =>
    row.images.slice(0, row.columns).filter(Boolean)
  );

  if (allImages.length === 0 && fallbackImageUrl) {
    allImages.push(fallbackImageUrl);
  }

  const total = allImages.length;
  const isOpen = lightboxIndex !== null;

  const close = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i - 1 + total) % total : 0)),
    [total]
  );
  const next = useCallback(
    () => setLightboxIndex((i) => (i !== null ? (i + 1) % total : 0)),
    [total]
  );

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close, prev, next]);

  if (rows.length === 0) {
    if (!fallbackImageUrl) {
      return (
        <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
          <span className="text-sm text-gray-400">No images yet</span>
        </div>
      );
    }
    return (
      <button onClick={() => setLightboxIndex(0)} className="block w-full">
        <Image
          src={fallbackImageUrl}
          alt={title}
          width={1920}
          height={1080}
          quality={90}
          sizes="100vw"
          className="w-full h-auto block cursor-pointer"
        />
        {isOpen && (
          <Lightbox
            images={allImages}
            index={lightboxIndex!}
            onClose={close}
            onPrev={prev}
            onNext={next}
          />
        )}
      </button>
    );
  }

  const colClasses: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-5",
    6: "grid-cols-1 md:grid-cols-6",
  };

  return (
    <>
      <div className="flex flex-col gap-[6px]">
        {rows.map((row, rowIdx) => {
          const rowImages = row.images.slice(0, row.columns);
          const rowStartIndex = rows
            .slice(0, rowIdx)
            .reduce(
              (count, prevRow) =>
                count + prevRow.images.slice(0, prevRow.columns).filter(Boolean).length,
              0
            );
          const gridClass = colClasses[row.columns] ?? "grid-cols-1";
          const gapClass = row.columns > 1 ? "gap-[6px]" : "";

          return (
            <div key={rowIdx} className={`grid ${gridClass} ${gapClass}`}>
              {rowImages.map((url, colIdx) => {
                const flatIndex = rowStartIndex + rowImages.slice(0, colIdx).filter(Boolean).length;
                return url ? (
                  <button
                    key={colIdx}
                    onClick={() => setLightboxIndex(flatIndex)}
                    className="block w-full cursor-zoom-in"
                  >
                    <Image
                      src={url}
                      alt={`${title} — ${rowIdx + 1}.${colIdx + 1}`}
                      width={1920}
                      height={1080}
                      quality={90}
                      sizes={`(max-width: 768px) 100vw, ${Math.round(100 / row.columns)}vw`}
                      className="w-full h-auto block"
                    />
                  </button>
                ) : (
                  <div key={colIdx} className="aspect-video bg-gray-100" />
                );
              })}
            </div>
          );
        })}
      </div>

      {isOpen && (
        <Lightbox
          images={allImages}
          index={lightboxIndex!}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </>
  );
}

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const total = images.length;
  const showNav = total > 1;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-6 text-white/70 hover:text-white text-3xl leading-none z-10"
        aria-label="Close"
      >
        ×
      </button>

      {/* Counter */}
      {showNav && (
        <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-widest">
          {index + 1} / {total}
        </p>
      )}

      {/* Prev */}
      {showNav && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-3 z-10"
          aria-label="Previous"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Image */}
      <div className="relative w-[90vw] h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <Image
          src={images[index]}
          alt={`Image ${index + 1}`}
          fill
          quality={90}
          sizes="90vw"
          className="object-contain"
          priority
        />
      </div>

      {/* Next */}
      {showNav && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-3 z-10"
          aria-label="Next"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
