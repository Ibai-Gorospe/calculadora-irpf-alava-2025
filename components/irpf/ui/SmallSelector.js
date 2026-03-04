"use client";

import { Tooltip } from "./Tooltip";
import { T } from "./tokens";

/**
 * SmallSelector — horizontal button group for picking one option.
 *
 * The selected button gets the dynamic accent background with white text;
 * unselected buttons get a neutral look. Accent is applied via inline styles
 * because the color depends on which person (A/B) owns this selector.
 *
 * @param {string}   lbl          - Label text
 * @param {*}        value        - Currently selected value
 * @param {function} onChange     - Called with the new value on click
 * @param {Array}    options      - Array of { value, label }
 * @param {string}   [tooltipText]- Optional tooltip next to label
 * @param {string}   [accent]     - Dynamic accent color (hex)
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
    <div className="flex flex-col gap-1.5 mb-3.5">
      {/* Label row */}
      {lbl && (
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-ink-mid">
            {lbl}
          </span>
          {tooltipText && <Tooltip text={tooltipText} />}
        </div>
      )}

      {/* Button group */}
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`
                rounded-lg px-3 py-1.5 text-xs font-semibold
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
