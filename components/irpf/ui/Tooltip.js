"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Tooltip — click-triggered info panel with wide, readable content.
 *
 * Replaces the old hover-based tiny dark bubble with a proper
 * information panel: white background, generous padding, close button,
 * and closes on click-outside or Escape.
 *
 * @param {string}    text     - Info content to display
 * @param {ReactNode} children - Optional custom trigger (defaults to "i" icon)
 */
export function Tooltip({ text, children }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  if (!text) return children ?? null;

  return (
    <span className="relative inline-flex items-center">
      {/* Trigger — defaults to an info icon button */}
      {children ?? (
        <button
          ref={triggerRef}
          type="button"
          aria-label="Más información"
          onClick={() => setOpen(!open)}
          className={`
            ml-1.5 inline-flex h-[22px] w-[22px] items-center justify-center
            rounded-full border text-[12px] font-semibold
            leading-none cursor-pointer transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-cobalt/30
            ${open
              ? "bg-cobalt text-white border-cobalt shadow-sm"
              : "border-ink-faint/40 text-ink-faint hover:bg-surface-alt hover:text-ink-mid hover:border-ink-mid/40"
            }
          `}
          tabIndex={0}
        >
          i
        </button>
      )}

      {/* Info panel */}
      {open && (
        <span
          ref={panelRef}
          role="tooltip"
          className="absolute top-full left-0 mt-2.5
                     z-50 w-[360px] max-w-[calc(100vw-2rem)]
                     rounded-xl bg-white border border-border
                     shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                     animate-[fadeIn_150ms_ease-out]"
        >
          {/* Arrow */}
          <span
            className="absolute -top-[7px] left-4
                       w-3.5 h-3.5 rotate-45
                       bg-white border-l border-t border-border"
          />

          {/* Content */}
          <span className="block relative p-5">
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full
                         flex items-center justify-center
                         text-ink-faint hover:text-ink hover:bg-surface-alt
                         transition-colors cursor-pointer text-lg leading-none"
              aria-label="Cerrar"
            >
              &times;
            </button>

            {/* Icon + header */}
            <span className="flex items-center gap-2 mb-2.5">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cobalt/10 text-cobalt text-xs font-bold shrink-0">
                i
              </span>
              <span className="text-xs font-bold uppercase tracking-wide text-ink-mid">
                Información
              </span>
            </span>

            {/* Text body */}
            <span className="block text-[13px] leading-[1.65] text-ink-mid pr-4">
              {text}
            </span>
          </span>
        </span>
      )}
    </span>
  );
}
