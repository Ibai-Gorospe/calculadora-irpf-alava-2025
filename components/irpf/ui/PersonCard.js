"use client";

import { T } from "./tokens";

export function PersonCard({ letter, label, subtitle, accent, accentLight, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-md border border-border/40 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-8 md:p-10">
        {/* Header with avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-base font-bold font-mono shrink-0"
            style={{ background: accentLight, color: accent }}
          >
            {letter}
          </div>
          <div>
            <div className="text-base font-semibold" style={{ color: T.ink }}>{label}</div>
            {subtitle && (
              <div className="text-[13px] mt-1" style={{ color: T.inkFaint }}>
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
