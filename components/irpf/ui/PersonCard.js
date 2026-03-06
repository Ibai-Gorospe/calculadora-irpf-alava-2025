"use client";

import { T } from "./tokens";

export function PersonCard({ letter, label, subtitle, accent, accentLight, children }) {
  return (
    <div
      className="bg-white rounded-2xl border overflow-hidden transition-shadow duration-300"
      style={{
        borderColor: T.border,
        boxShadow: T.shadowCard,
      }}
    >
      <div className="p-6 md:p-8">
        {/* Header with avatar */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold font-mono shrink-0"
            style={{ background: accentLight, color: accent }}
          >
            {letter}
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: T.ink }}>{label}</div>
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
