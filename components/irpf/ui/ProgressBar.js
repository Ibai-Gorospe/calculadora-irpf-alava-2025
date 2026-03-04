"use client";

import { T } from "./tokens";

const STEPS = [
  { key: 0, label: "Lo básico",            optional: false },
  { key: 1, label: "Situación personal",   optional: false },
  { key: 2, label: "Vivienda",             optional: true  },
  { key: 3, label: "Otras rentas",         optional: true  },
  { key: 4, label: "Deducciones",          optional: true  },
  { key: 5, label: "Resultado",            optional: false },
];

/**
 * ProgressBar — horizontal wizard stepper with numbered circles and
 * connecting lines. Responsive: compact on mobile, full labels on desktop.
 */
export function ProgressBar({ currentStep, onStepClick, maxVisited }) {
  return (
    <nav aria-label="Progreso del formulario" className="w-full">
      {/* ── Desktop / tablet (lg and up) ────────────────────────── */}
      <ol className="hidden lg:flex items-start justify-between w-full">
        {STEPS.map((step, i) => {
          const isCurrent   = i === currentStep;
          const isCompleted = i < currentStep;
          const isReachable = i <= maxVisited;
          const isLast      = i === STEPS.length - 1;

          return (
            <li key={step.key} className="flex items-start flex-1 last:flex-none">
              {/* Step circle + label column */}
              <button
                type="button"
                disabled={!isReachable}
                onClick={() => isReachable && onStepClick(step.key)}
                className={`
                  flex flex-col items-center gap-2 group
                  outline-none focus-visible:ring-2 focus-visible:ring-cobalt/40
                  focus-visible:rounded-lg
                  ${isReachable ? "cursor-pointer" : "cursor-not-allowed"}
                `}
                aria-current={isCurrent ? "step" : undefined}
              >
                {/* Circle */}
                <span
                  className={`
                    flex items-center justify-center
                    w-11 h-11 rounded-full text-base font-bold
                    transition-all duration-200 shrink-0
                    ${isCurrent
                      ? "bg-cobalt text-white shadow-md"
                      : isCompleted
                        ? "bg-positive text-white"
                        : "bg-surface-alt text-ink-faint"
                    }
                    ${isReachable && !isCurrent ? "group-hover:scale-110" : ""}
                  `}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8.5l3.5 3.5 6.5-7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>

                {/* Label */}
                <span
                  className={`
                    text-xs leading-tight text-center max-w-[100px]
                    ${isCurrent
                      ? "font-bold text-cobalt"
                      : isCompleted
                        ? "font-semibold text-positive"
                        : "font-medium text-ink-faint"
                    }
                  `}
                >
                  {step.label}
                </span>

                {/* Optional hint */}
                {step.optional && (
                  <span className="text-[10px] text-ink-faint -mt-0.5">
                    (opcional)
                  </span>
                )}
              </button>

              {/* Connecting line between circles */}
              {!isLast && (
                <div
                  className="flex-1 mt-[22px] mx-3 h-[2px] rounded-full"
                  style={{
                    backgroundColor: isCompleted ? T.green : T.border,
                  }}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* ── Mobile / compact (below lg) ─────────────────────────── */}
      <div className="flex lg:hidden items-center gap-1.5 w-full px-1">
        {STEPS.map((step, i) => {
          const isCurrent   = i === currentStep;
          const isCompleted = i < currentStep;
          const isReachable = i <= maxVisited;
          const isLast      = i === STEPS.length - 1;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                disabled={!isReachable}
                onClick={() => isReachable && onStepClick(step.key)}
                className={`
                  flex items-center justify-center shrink-0
                  w-9 h-9 rounded-full text-sm font-bold
                  transition-all duration-200
                  outline-none focus-visible:ring-2 focus-visible:ring-cobalt/40
                  ${isCurrent
                    ? "bg-cobalt text-white shadow-md"
                    : isCompleted
                      ? "bg-positive text-white"
                      : "bg-surface-alt text-ink-faint"
                  }
                  ${isReachable ? "cursor-pointer" : "cursor-not-allowed"}
                `}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={step.label}
              >
                {isCompleted ? (
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 8.5l3.5 3.5 6.5-7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </button>

              {/* Current step label shown inline on mobile */}
              {isCurrent && (
                <span className="ml-2 text-sm font-bold text-cobalt truncate">
                  {step.label}
                </span>
              )}

              {/* Connector line */}
              {!isLast && (
                <div
                  className="flex-1 mx-1.5 h-[2px] rounded-full min-w-[8px]"
                  style={{
                    backgroundColor: isCompleted ? T.green : T.border,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
