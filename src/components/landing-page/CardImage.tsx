"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

type CardImageProps = {
  src: string;
  alt: string;
  accent?: string;
  height?: number | string;
  priority?: boolean;
};

export default function CardImage({
  src,
  alt,
  accent,
  height = "5.5rem",
  priority = false,
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
        className="card-image__img"
        style={{ width: "100%", height: "auto" }}
      />
    </div>
  );
}
