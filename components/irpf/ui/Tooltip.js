"use client";

import { useState, useRef, useEffect } from "react";

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
      {/* Trigger */}
      {children ?? (
        <button
          ref={triggerRef}
          type="button"
          aria-label="Mas informacion"
          onClick={() => setOpen(!open)}
          className={`
            ml-1 inline-flex h-6 w-6 items-center justify-center
            rounded-full text-xs font-semibold
            leading-none cursor-pointer transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-cobalt/20
            ${open
              ? "bg-cobalt text-white shadow-sm"
              : "bg-surface-alt text-ink-faint hover:bg-cobalt/10 hover:text-cobalt"
            }
          `}
          tabIndex={0}
        >
          ?
        </button>
      )}

      {/* Info panel */}
      {open && (
        <span
          ref={panelRef}
          role="tooltip"
          className="absolute top-full left-0 mt-2
                     z-50 w-[340px] max-w-[calc(100vw-2rem)]
                     rounded-xl bg-white border border-border
                     shadow-xl
                     animate-[fadeIn_150ms_ease-out]"
        >
          {/* Arrow */}
          <span
            className="absolute -top-[6px] left-3
                       w-3 h-3 rotate-45
                       bg-white border-l border-t border-border"
          />

          {/* Content */}
          <span className="block relative p-5">
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2.5 right-2.5 w-6 h-6 rounded-lg
                         flex items-center justify-center
                         text-ink-faint hover:text-ink hover:bg-surface-alt
                         transition-colors cursor-pointer text-sm leading-none"
              aria-label="Cerrar"
            >
              &times;
            </button>

            {/* Icon + header */}
            <span className="flex items-center gap-2 mb-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-cobalt/10 text-cobalt text-[10px] font-bold shrink-0">
                i
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                Info
              </span>
            </span>

            {/* Text body */}
            <span className="block text-sm leading-[1.7] text-ink-mid pr-3">
              {text}
            </span>
          </span>
        </span>
      )}
    </span>
  );
}
