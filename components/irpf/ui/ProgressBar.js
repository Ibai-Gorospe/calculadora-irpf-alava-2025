"use client";

import { T } from "./tokens";

const STEPS = [
  { key: 0, label: "Lo básico",          optional: false },
  { key: 1, label: "Situación personal", optional: false },
  { key: 2, label: "Vivienda",           optional: true  },
  { key: 3, label: "Otras rentas",       optional: true  },
  { key: 4, label: "Deducciones",        optional: true  },
  { key: 5, label: "Resultado",          optional: false },
];

/**
 * ProgressBar — horizontal tab-style stepper.
 * Active tab has bold text + cobalt underline.
 * Completed tabs show a green checkmark.
 * Future tabs are grayed out.
 */
export function ProgressBar({ currentStep, onStepClick, maxVisited }) {
  return (
    <nav aria-label="Progreso del formulario">
      {/* ── Desktop (md+) ─────────────────────────────────────── */}
      <div className="hidden md:flex items-stretch gap-0 overflow-x-auto">
        {STEPS.map((step, i) => {
          const isCurrent   = i === currentStep;
          const isCompleted = i < currentStep;
          const isReachable = i <= maxVisited;

          return (
            <button
              key={step.key}
              type="button"
              disabled={!isReachable}
              onClick={() => isReachable && onStepClick(step.key)}
              className={`
                relative flex items-center gap-2 px-5 py-3.5
                text-[13px] font-medium whitespace-nowrap
                transition-colors duration-150
                border-b-[3px]
                outline-none focus-visible:ring-2 focus-visible:ring-cobalt/30
                ${isReachable ? "cursor-pointer" : "cursor-not-allowed"}
                ${isCurrent
                  ? "border-cobalt text-cobalt font-bold"
                  : isCompleted
                    ? "border-positive/60 text-positive"
                    : "border-transparent text-ink-faint"
                }
                ${isReachable && !isCurrent ? "hover:text-ink-mid hover:border-border" : ""}
              `}
              aria-current={isCurrent ? "step" : undefined}
            >
              {/* Check icon for completed */}
              {isCompleted && (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8.5l3.5 3.5 6.5-7" />
                </svg>
              )}
              <span>{step.label}</span>
              {step.optional && (
                <span className="text-[10px] text-ink-faint font-normal">(opc.)</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Mobile (<md) ──────────────────────────────────────── */}
      <div className="flex md:hidden items-center gap-1.5 w-full overflow-x-auto pb-1">
        {STEPS.map((step, i) => {
          const isCurrent   = i === currentStep;
          const isCompleted = i < currentStep;
          const isReachable = i <= maxVisited;

          return (
            <button
              key={step.key}
              type="button"
              disabled={!isReachable}
              onClick={() => isReachable && onStepClick(step.key)}
              className={`
                px-3 py-2 text-xs font-medium rounded-full whitespace-nowrap
                transition-colors duration-150
                outline-none focus-visible:ring-2 focus-visible:ring-cobalt/30
                ${isReachable ? "cursor-pointer" : "cursor-not-allowed"}
                ${isCurrent
                  ? "bg-cobalt text-white font-bold"
                  : isCompleted
                    ? "bg-positive-light text-positive"
                    : "bg-surface-alt text-ink-faint"
                }
              `}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={step.label}
            >
              {isCompleted ? "✓" : i + 1}
              {isCurrent && <span className="ml-1">{step.label}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
