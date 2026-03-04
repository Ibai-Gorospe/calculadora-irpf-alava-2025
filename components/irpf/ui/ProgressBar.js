"use client";

const STEPS = [
  { key: 0, label: "Lo basico",          optional: false },
  { key: 1, label: "Situacion personal", optional: false },
  { key: 2, label: "Vivienda",           optional: true  },
  { key: 3, label: "Otras rentas",       optional: true  },
  { key: 4, label: "Deducciones",        optional: true  },
  { key: 5, label: "Resultado",          optional: false },
];

export function ProgressBar({ currentStep, onStepClick, maxVisited }) {
  return (
    <nav aria-label="Progreso del formulario">
      {/* Desktop (md+): numbered badge tabs */}
      <div className="hidden md:flex items-center gap-1">
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
                flex items-center gap-2.5 px-4 py-3.5 rounded-xl
                text-[13px] font-medium whitespace-nowrap
                transition-all duration-200
                outline-none focus-visible:ring-2 focus-visible:ring-cobalt/30
                ${isReachable ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
                ${isCurrent
                  ? "bg-cobalt/10 text-cobalt font-semibold"
                  : isCompleted
                    ? "text-positive hover:bg-positive/5"
                    : "text-ink-faint hover:bg-surface-alt"
                }
              `}
              aria-current={isCurrent ? "step" : undefined}
            >
              {/* Numbered badge */}
              <span
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center
                  text-xs font-bold shrink-0 transition-all duration-200
                  ${isCurrent
                    ? "bg-cobalt text-white shadow-sm"
                    : isCompleted
                      ? "bg-positive text-white"
                      : "bg-surface-alt text-ink-faint border border-border"
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8.5l3.5 3.5 6.5-7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span>{step.label}</span>
              {step.optional && (
                <span className="text-[10px] text-ink-faint font-normal">(opc.)</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile (<md): compact pills */}
      <div className="flex md:hidden items-center gap-1.5 w-full overflow-x-auto pb-1 px-1">
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
                flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold
                rounded-xl whitespace-nowrap transition-all duration-200
                outline-none focus-visible:ring-2 focus-visible:ring-cobalt/30
                ${isReachable ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
                ${isCurrent
                  ? "bg-cobalt text-white shadow-sm"
                  : isCompleted
                    ? "bg-positive-light text-positive"
                    : "bg-surface-alt text-ink-faint"
                }
              `}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={step.label}
            >
              <span className={`
                w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                ${isCurrent
                  ? "bg-white/20"
                  : isCompleted
                    ? "bg-positive/10"
                    : ""
                }
              `}>
                {isCompleted ? "\u2713" : i + 1}
              </span>
              {isCurrent && <span>{step.label}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
