"use client";

import { T } from "./tokens";

/**
 * PersonCard — shared card wrapper for Person A / Person B sections.
 *
 * Used across all wizard steps to provide a consistent card layout
 * with colored top border, avatar circle, and generous padding.
 *
 * @param {string}    letter      - "A", "B", or "H" (for Hijos)
 * @param {string}    label       - Card title (e.g. "Persona A")
 * @param {string}    subtitle    - Smaller text below title
 * @param {string}    accent      - Dynamic accent color (hex)
 * @param {string}    accentLight - Lighter accent variant for avatar bg
 * @param {ReactNode} children    - Card content
 */
export function PersonCard({ letter, label, subtitle, accent, accentLight, children }) {
  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-border"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <div className="p-6">
        {/* Header with avatar */}
        <div className="flex items-center gap-3.5 mb-6">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-extrabold font-mono shrink-0"
            style={{ background: accentLight, border: `2px solid ${accent}30`, color: accent }}
          >
            {letter}
          </div>
          <div>
            <div className="text-base font-bold" style={{ color: T.ink }}>{label}</div>
            {subtitle && (
              <div className="text-xs mt-0.5" style={{ color: T.inkFaint }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
