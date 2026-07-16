"use client";

import type { CSSProperties, ReactElement } from "react";

export type ServiceAccent = "cyan" | "magenta" | "amber" | "emerald";

export const SERVICE_ACCENTS: Record<
  ServiceAccent,
  { color: string; glow: string; gradient: string }
> = {
  cyan: {
    color: "#22d3ee",
    glow: "rgba(34, 211, 238, 0.45)",
    gradient: "linear-gradient(135deg, rgba(34,211,238,0.22) 0%, rgba(59,130,246,0.08) 100%)",
  },
  magenta: {
    color: "#e879f9",
    glow: "rgba(232, 121, 249, 0.45)",
    gradient: "linear-gradient(135deg, rgba(232,121,249,0.22) 0%, rgba(168,85,247,0.08) 100%)",
  },
  amber: {
    color: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.45)",
    gradient: "linear-gradient(135deg, rgba(251,191,36,0.22) 0%, rgba(249,115,22,0.08) 100%)",
  },
  emerald: {
    color: "#34d399",
    glow: "rgba(52, 211, 153, 0.45)",
    gradient: "linear-gradient(135deg, rgba(52,211,153,0.22) 0%, rgba(16,185,129,0.08) 100%)",
  },
};

type ServiceVisualProps = {
  accent: ServiceAccent;
};

export function ServiceVisual({ accent }: ServiceVisualProps) {
  const visuals: Record<ServiceAccent, ReactElement> = {
    cyan: (
      <svg viewBox="0 0 120 80" fill="none" aria-hidden="true" className="service-visual__svg">
        <rect x="8" y="12" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.7" />
        <rect x="44" y="12" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.5" />
        <rect x="80" y="12" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.35" />
        <path d="M22 52 H98" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <circle cx="22" cy="52" r="5" fill="currentColor" opacity="0.8" />
        <circle cx="60" cy="52" r="5" fill="currentColor" opacity="0.55" />
        <circle cx="98" cy="52" r="5" fill="currentColor" opacity="0.35" />
        <path d="M22 66 H78" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
      </svg>
    ),
    magenta: (
      <svg viewBox="0 0 120 80" fill="none" aria-hidden="true" className="service-visual__svg">
        <circle cx="60" cy="36" r="22" stroke="currentColor" strokeWidth="2" opacity="0.55" />
        <circle cx="60" cy="36" r="12" stroke="currentColor" strokeWidth="2" opacity="0.75" />
        <circle cx="60" cy="36" r="4" fill="currentColor" opacity="0.9" />
        <path d="M24 64 Q60 48 96 64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <path d="M36 20 L44 32 M84 20 L76 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
      </svg>
    ),
    amber: (
      <svg viewBox="0 0 120 80" fill="none" aria-hidden="true" className="service-visual__svg">
        <rect x="16" y="18" width="88" height="44" rx="6" stroke="currentColor" strokeWidth="2" opacity="0.55" />
        <path d="M16 34 H104" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        <circle cx="32" cy="26" r="3" fill="currentColor" opacity="0.7" />
        <circle cx="44" cy="26" r="3" fill="currentColor" opacity="0.45" />
        <circle cx="56" cy="26" r="3" fill="currentColor" opacity="0.3" />
        <path d="M32 48 L52 58 L88 42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
      </svg>
    ),
    emerald: (
      <svg viewBox="0 0 120 80" fill="none" aria-hidden="true" className="service-visual__svg">
        <rect x="20" y="22" width="24" height="36" rx="3" stroke="currentColor" strokeWidth="2" opacity="0.5" />
        <rect x="48" y="14" width="24" height="44" rx="3" stroke="currentColor" strokeWidth="2" opacity="0.65" />
        <rect x="76" y="28" width="24" height="30" rx="3" stroke="currentColor" strokeWidth="2" opacity="0.8" />
        <path d="M32 66 H88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
        <path d="M44 66 L60 54 L76 66" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity="0.55" />
      </svg>
    ),
  };

  return (
    <div
      className="service-visual"
      style={
        {
          "--service-accent": SERVICE_ACCENTS[accent].color,
          "--service-glow": SERVICE_ACCENTS[accent].glow,
          "--service-gradient": SERVICE_ACCENTS[accent].gradient,
        } as CSSProperties
      }
    >
      {visuals[accent]}
    </div>
  );
}
