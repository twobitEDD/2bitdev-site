"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

const CARD_IMAGE_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px";

type CardImageProps = {
  src: string;
  alt: string;
  accent?: string;
  height?: number | string;
  priority?: boolean;
  sizes?: string;
};

export default function CardImage({
  src,
  alt,
  accent,
  height = "5.5rem",
  priority = false,
  sizes = CARD_IMAGE_SIZES,
}: CardImageProps) {
  return (
    <div
      className="card-image"
      style={
        accent
          ? ({ "--card-image-accent": accent } as CSSProperties)
          : undefined
      }
    >
      <Image
        src={src}
        alt={alt}
        width={320}
        height={180}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes={sizes}
        className="card-image__img"
        style={{ width: "100%", height: "auto" }}
      />
    </div>
  );
}
