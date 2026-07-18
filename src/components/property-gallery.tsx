"use client";

import Image from "next/image";
import { useState } from "react";
import type { PropertyImage } from "@/types/property";

export function PropertyGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = images[selectedIndex];

  if (!selected) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-lg bg-muted px-6 text-center text-muted-foreground">
        Fotos deste imóvel ainda não estão disponíveis.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted">
        <Image
          src={selected.url}
          alt={selected.alt || `${title} - foto ${selectedIndex + 1}`}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6" aria-label="Escolha uma foto do imóvel">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Ver foto ${index + 1} de ${images.length}`}
              aria-pressed={selectedIndex === index}
              className="relative aspect-[4/3] overflow-hidden rounded-md border bg-muted outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring aria-pressed:ring-2 aria-pressed:ring-primary"
            >
              <Image
                src={image.url}
                alt=""
                fill
                className="object-cover"
                sizes="160px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
