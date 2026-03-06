"use client";

import { Tooltip } from "./Tooltip";
import { T } from "./tokens";

export function SmallSelector({
  lbl,
  value,
  onChange,
  options,
  tooltipText,
  tooltipData,
  accent = T.cobalt,
}) {
  return (
    <div className="space-y-1.5 mb-5">
      {/* Label row */}
      {lbl && (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-ink-mid">
            {lbl}
          </span>
          {(tooltipData || tooltipText) && <Tooltip data={tooltipData} text={tooltipData ? undefined : tooltipText} />}
        </div>
      )}

      {/* Segmented control */}
      <div className="inline-flex bg-surface-alt rounded-lg p-1 gap-1 flex-wrap">
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium
                transition-all duration-200 cursor-pointer
                outline-none focus-visible:ring-2 focus-visible:ring-cobalt/30
                ${
                  selected
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink-mid hover:text-ink"
                }
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
