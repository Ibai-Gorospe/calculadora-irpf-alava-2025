"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Tooltip — icono "i" con panel informativo desplegable.
 *
 * Props:
 *   data: {
 *     title: string,           // requerido
 *     norm?: string,           // ej: "Art. 83 NF 33/2013"
 *     iconColor?: "cobalt" | "teal" | "gold",  // default "cobalt"
 *     text?: string,           // párrafo explicativo
 *     rows?: Array<{ label: string, value: string, highlight?: boolean }>,
 *     tag?: string,            // consejo en badge dorado
 *     footnote?: string,       // nota al pie
 *   }
 *
 *   text: string  (prop legacy — se convierte a data internamente)
 */
export function Tooltip({ data, text }) {
  const [open, setOpen] = useState(false);
  const panelRef   = useRef(null);
  const triggerRef = useRef(null);

  // Compatibilidad con prop "text" antigua
  const d = data ?? (text ? { title: "Información", text } : null);
  if (!d) return null;

  const iconColor = d.iconColor ?? "cobalt";
  const iconBg    = iconColor === "teal" ? "bg-teal-light" : iconColor === "gold" ? "bg-gold-light" : "bg-cobalt-light";
  const iconStroke= iconColor === "teal" ? "#2E7D6F"       : iconColor === "gold" ? "#C4841D"       : "#1B3A5C";

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        panelRef.current   && !panelRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <span className="relative inline-flex items-center">

      {/* ── TRIGGER ── */}
      <button
        ref={triggerRef}
        type="button"
        aria-label="Más información"
        onClick={() => setOpen(v => !v)}
        tabIndex={0}
        className={`
          ml-1 inline-flex items-center justify-center
          w-[18px] h-[18px] rounded-full
          text-[11px] font-bold leading-none
          border cursor-pointer
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-cobalt/20
          ${open
            ? "bg-cobalt text-white border-cobalt scale-110"
            : "bg-cobalt-light text-cobalt border-cobalt/20 hover:bg-cobalt hover:text-white hover:scale-110"
          }
        `}
      >
        i
      </button>

      {/* ── PANEL ── */}
      {open && (
        <span
          ref={panelRef}
          role="tooltip"
          className="
            absolute top-full left-0 mt-3
            z-50 w-[280px] max-w-[calc(100vw-2rem)]
            rounded-xl bg-surface border border-border
            overflow-hidden
            animate-[fadeIn_150ms_ease-out]
          "
          style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08), 0 16px 32px rgba(0,0,0,0.08)" }}
        >
          {/* Flecha */}
          <span className="absolute -top-[6px] left-3 w-3 h-3 rotate-45 bg-surface border-l border-t border-border" />

          {/* ── CABECERA ── */}
          <span className="flex items-center gap-2.5 px-4 pt-4 pb-3 border-b border-border/50 bg-surface-alt">
            {/* Icono coloreado */}
            <span className={`inline-flex w-7 h-7 items-center justify-center rounded-lg flex-shrink-0 ${iconBg}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </span>
            {/* Título + norma */}
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-semibold text-ink leading-tight truncate">
                {d.title}
              </span>
              {d.norm && (
                <span className="block text-[10px] text-ink-faint mt-0.5">{d.norm}</span>
              )}
            </span>
            {/* Botón cerrar */}
            <button
              onClick={() => setOpen(false)}
              className="ml-1 flex-shrink-0 w-5 h-5 flex items-center justify-center
                         text-ink-faint hover:text-ink text-base leading-none
                         rounded cursor-pointer transition-colors"
              aria-label="Cerrar"
            >
              ×
            </button>
          </span>

          {/* ── CUERPO ── */}
          <span className="block px-4 py-3 space-y-2.5">
            {/* Texto libre */}
            {d.text && (
              <p className="text-sm leading-relaxed text-ink-mid">{d.text}</p>
            )}

            {/* Tabla de tramos/valores */}
            {d.rows && d.rows.length > 0 && (
              <span className="block divide-y divide-border/50">
                {d.rows.map((row, i) => (
                  <span key={i} className="flex justify-between items-center py-2 gap-4">
                    <span className="text-xs text-ink-faint">{row.label}</span>
                    <span className={`text-xs font-mono font-semibold tabular-nums whitespace-nowrap ${row.highlight ? "text-positive" : "text-ink"}`}>
                      {row.value}
                    </span>
                  </span>
                ))}
              </span>
            )}

            {/* Tag / consejo */}
            {d.tag && (
              <span className="block text-[11px] font-medium bg-gold-light text-gold rounded-md px-2.5 py-1.5">
                {d.tag}
              </span>
            )}
          </span>

          {/* ── PIE ── */}
          {d.footnote && (
            <span className="block px-4 pb-3 pt-2 border-t border-border/50 text-[10px] text-ink-faint leading-relaxed">
              {d.footnote}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
