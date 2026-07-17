"use client";

import type { CSSProperties } from "react";
import StaticSvgImage from "./StaticSvgImage";

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
      <StaticSvgImage
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
