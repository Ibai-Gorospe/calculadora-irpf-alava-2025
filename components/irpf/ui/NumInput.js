"use client";

import { useState, useId } from "react";
import { Tooltip } from "./Tooltip";
import { T } from "./tokens";

/**
 * NumInput — numeric field with label, optional hint & tooltip.
 *
 * Dynamic accent colors (person A = cobalt, person B = teal) are applied via
 * inline styles because Tailwind cannot resolve runtime color values.
 *
 * @param {string}   label        - Uppercase label above the input
 * @param {string}   value        - Controlled value (string form)
 * @param {function} onChange     - Called with the raw string value
 * @param {string}   [hint]       - Small gray help text below input
 * @param {string}   [tooltipText]- Tooltip text shown next to label
 * @param {string}   [accent]     - Dynamic accent color (hex), e.g. T.cobalt
 * @param {string}   [accentLight]- Lighter variant for focus bg, e.g. T.cobaltL
 */
export function NumInput({
  label,
  value,
  onChange,
  hint,
  tooltipText,
  accent = T.cobalt,
  accentLight = T.cobaltL,
}) {
  const [focused, setFocused] = useState(false);
  const id = useId();

  return (
    <div className="flex flex-col gap-1 mb-3.5">
      {/* Label row */}
      <div className="flex items-center gap-1">
        <label
          htmlFor={id}
          className="text-[11px] font-bold uppercase tracking-wide transition-colors"
          style={{ color: focused ? accent : T.inkMid }}
        >
          {label}
        </label>
        {tooltipText && <Tooltip text={tooltipText} />}
      </div>

      {/* Input */}
      <input
        id={id}
        type="text"
        inputMode="decimal"
        placeholder="0,00 €"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-lg border px-3 py-2
                   font-mono text-sm text-ink
                   outline-none transition-all duration-150
                   placeholder:text-ink-faint"
        style={{
          backgroundColor: focused ? accentLight : T.surface,
          borderColor: focused ? accent : T.border,
          boxShadow: focused ? `0 0 0 3px ${accent}20` : "none",
        }}
      />

      {/* Hint */}
      {hint && (
        <p className="text-[11px] leading-snug text-ink-faint">{hint}</p>
      )}
    </div>
  );
}
