"use client";

import { useState, useId } from "react";
import { Tooltip } from "./Tooltip";
import { T } from "./tokens";

/**
 * NumInput — numeric field with label, optional hint & tooltip.
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
    <div className="flex flex-col gap-1.5 mb-6">
      {/* Label row */}
      <div className="flex items-center gap-1">
        <label
          htmlFor={id}
          className="text-[13px] font-semibold transition-colors"
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
        className="w-full rounded-xl border px-4 py-3.5
                   font-mono text-base text-ink
                   outline-none transition-all duration-150
                   placeholder:text-ink-faint/50"
        style={{
          backgroundColor: focused ? accentLight : T.surface,
          borderColor: focused ? accent : T.border,
          boxShadow: focused ? `0 0 0 3px ${accent}18` : "none",
        }}
      />

      {/* Hint */}
      {hint && (
        <p className="text-xs leading-snug text-ink-faint">{hint}</p>
      )}
    </div>
  );
}
