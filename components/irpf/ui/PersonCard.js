"use client";

import { T } from "./tokens";

/**
 * PersonCard — shared card wrapper for Person A / Person B sections.
 *
 * Clean design with left accent border, generous padding,
 * and consistent layout across all wizard steps.
 */
export function PersonCard({ letter, label, subtitle, accent, accentLight, children }) {
  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden"
    >
      {/* Accent left border via inner wrapper */}
      <div className="border-l-4 p-7" style={{ borderLeftColor: accent }}>
        {/* Header with avatar */}
        <div className="flex items-center gap-3 mb-7">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-mono shrink-0"
            style={{ background: accentLight, color: accent }}
          >
            {letter}
          </div>
          <div>
            <div className="text-base font-semibold" style={{ color: T.ink }}>{label}</div>
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
