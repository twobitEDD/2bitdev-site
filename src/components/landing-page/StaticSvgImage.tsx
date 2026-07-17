"use client";

import type { CSSProperties } from "react";

type StaticSvgImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  style?: CSSProperties;
};

/** Local SVGs are served as static files — native img avoids next/image optimizer issues. */
export default function StaticSvgImage({
  src,
  alt,
  className,
  width = 320,
  height = 180,
  priority = false,
  style,
}: StaticSvgImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={className}
      style={style}
    />
  );
}
