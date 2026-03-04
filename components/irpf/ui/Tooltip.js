"use client";

import { useState } from "react";

/**
 * Tooltip — shows informational text on hover/focus of an info icon.
 *
 * @param {string}    text     - Tooltip content to display
 * @param {ReactNode} children - Optional children to wrap (defaults to info icon)
 */
export function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);

  if (!text) return children ?? null;

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {/* Trigger — defaults to an info icon when no children provided */}
      {children ?? (
        <button
          type="button"
          aria-label="Mas informacion"
          className="ml-1 inline-flex h-[18px] w-[18px] items-center justify-center
                     rounded-full border border-border text-ink-faint text-[11px]
                     leading-none cursor-help transition-colors
                     hover:bg-surface-alt hover:text-ink-mid
                     focus:outline-none focus:ring-2 focus:ring-cobalt/30"
          tabIndex={0}
        >
          i
        </button>
      )}

      {/* Tooltip bubble */}
      {visible && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                     z-50 w-max max-w-[260px] px-3 py-2
                     rounded-lg bg-ink text-white text-xs leading-snug
                     shadow-lg pointer-events-none
                     animate-[fadeIn_120ms_ease-out]"
        >
          {text}
          {/* Arrow */}
          <span
            className="absolute top-full left-1/2 -translate-x-1/2
                       border-[5px] border-transparent border-t-ink"
          />
        </span>
      )}
    </span>
  );
}
