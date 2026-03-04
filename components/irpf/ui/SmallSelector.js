"use client";

import { Tooltip } from "./Tooltip";
import { T } from "./tokens";

/**
 * SmallSelector — horizontal button group for picking one option.
 *
 * The selected button gets the dynamic accent background with white text;
 * unselected buttons get a neutral look.
 */
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
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold uppercase tracking-wide text-ink-mid">
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
                rounded-lg px-4 py-2.5 text-[13px] font-semibold
                transition-all duration-150 cursor-pointer
                outline-none focus-visible:ring-2 focus-visible:ring-offset-1
                ${
                  selected
                    ? "text-white shadow-sm"
                    : "bg-white text-ink-mid border border-border hover:border-ink-faint"
                }
              `}
              style={
                selected
                  ? { backgroundColor: accent, boxShadow: `0 1px 3px ${accent}40` }
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
