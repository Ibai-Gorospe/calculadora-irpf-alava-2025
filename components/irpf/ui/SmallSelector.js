"use client";

import { Tooltip } from "./Tooltip";
import { T } from "./tokens";

export function SmallSelector({
  lbl,
  value,
  onChange,
  options,
  tooltipText,
  accent = T.cobalt,
}) {
  return (
    <div className="flex flex-col gap-2 mb-5">
      {/* Label row */}
      {lbl && (
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-medium text-ink-mid">
            {lbl}
          </span>
          {tooltipText && <Tooltip text={tooltipText} />}
        </div>
      )}

      {/* Button group */}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`
                rounded-xl px-4 py-2.5 text-sm font-medium
                transition-all duration-200 cursor-pointer
                outline-none focus-visible:ring-2 focus-visible:ring-offset-1
                ${
                  selected
                    ? "text-white shadow-md"
                    : "bg-white text-ink-mid border border-border hover:border-ink-faint/60 hover:bg-surface-alt"
                }
              `}
              style={
                selected
                  ? { backgroundColor: accent, boxShadow: `0 4px 12px ${accent}30` }
                  : undefined
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
