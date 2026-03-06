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
  tooltipData,
  accent = T.cobalt,
  accentLight = T.cobaltL,
}) {
  const [focused, setFocused] = useState(false);
  const id = useId();

  return (
    <div className="space-y-1.5 mb-5">
      {/* Label row */}
      <div className="flex items-center gap-1.5">
        <label
          htmlFor={id}
          className="text-sm font-medium text-ink-mid"
        >
          {label}
        </label>
        {(tooltipData || tooltipText) && <Tooltip data={tooltipData} text={tooltipData ? undefined : tooltipText} />}
      </div>

      {/* Input with € prefix */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-sm select-none pointer-events-none">
          &euro;
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-lg pl-7 pr-3 py-2.5
                     font-mono text-base text-ink text-right tabular-nums
                     outline-none transition-all duration-150
                     placeholder:text-ink-faint/40"
          style={{
            backgroundColor: T.surface,
            border: `1px solid ${focused ? accent : T.border}`,
            boxShadow: focused ? `0 0 0 2px ${accent}26` : "none",
          }}
        />
      </div>

      {/* Hint */}
      {hint && (
        <p className="text-xs text-ink-faint leading-snug">{hint}</p>
      )}
    </div>
  );
}
