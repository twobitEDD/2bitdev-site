"use client";

import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";

type SlideDirectionY = "from-top-to-bottom" | "from-bottom-to-top";

interface FadeInProps extends PropsWithChildren {
  direction: SlideDirectionY;
}

/**
 * Scroll-reveal animation that never hides content during SSR or hydration.
 * Opacity stays 1 so images remain visible even if hydration recovers (#423).
 */
export const FadeIn: FC<FadeInProps> = (props) => {
  const { children, direction } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const offset =
    direction === "from-top-to-bottom" ? "translateY(-24px)" : "translateY(24px)";

  return (
    <div ref={ref}>
      <div
        style={{
          opacity: 1,
          transform: !mounted || revealed ? "none" : offset,
          transition: mounted ? "transform 0.9s ease-in-out" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
};
