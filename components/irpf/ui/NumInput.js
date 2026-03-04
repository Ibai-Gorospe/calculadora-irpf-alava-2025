"use client";

import { useState, useId } from "react";
import { Tooltip } from "./Tooltip";
import { T } from "./tokens";

/**
 * NumInput — numeric field with label, optional hint & tooltip.
 *
 * Dynamic accent colors (person A = cobalt, person B = teal) are applied via
 * inline styles because Tailwind cannot resolve runtime color values.
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
    <div className="flex flex-col gap-1.5 mb-5">
      {/* Label row */}
      <div className="flex items-center gap-1">
        <label
          htmlFor={id}
          className="text-xs font-bold uppercase tracking-wide transition-colors"
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
        className="w-full rounded-lg border px-4 py-3
                   font-mono text-[15px] text-ink
                   outline-none transition-all duration-150
                   placeholder:text-ink-faint/60"
        style={{
          backgroundColor: focused ? accentLight : T.surface,
          borderColor: focused ? accent : T.border,
          boxShadow: focused ? `0 0 0 3px ${accent}20` : "none",
        }}
      />

      {/* Hint */}
      {hint && (
        <p className="text-xs leading-snug text-ink-faint">{hint}</p>
      )}
    </div>
  );
}
