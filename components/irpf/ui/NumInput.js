"use client";

import { useState, useId } from "react";
import { Tooltip } from "./Tooltip";
import { T } from "./tokens";

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
      <div className="flex items-center gap-1.5">
        <label
          htmlFor={id}
          className="text-[13px] font-medium transition-colors duration-200"
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
        placeholder="0,00 \u20AC"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-xl px-4 py-3
                   font-mono text-[15px] text-ink
                   outline-none transition-all duration-200
                   placeholder:text-ink-faint/40"
        style={{
          backgroundColor: focused ? accentLight : T.surface,
          border: `2px solid ${focused ? accent : T.border}`,
          boxShadow: focused ? `0 0 0 4px ${accent}12` : "none",
        }}
      />

      {/* Hint */}
      {hint && (
        <p className="text-xs leading-snug text-ink-faint">{hint}</p>
      )}
    </div>
  );
}
