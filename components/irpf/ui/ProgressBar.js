"use client";

const STEPS = [
  { key: 0, label: "Lo basico",          optional: false },
  { key: 1, label: "Situacion personal", optional: false },
  { key: 2, label: "Vivienda",           optional: true  },
  { key: 3, label: "Otras rentas",       optional: true  },
  { key: 4, label: "Deducciones",        optional: true  },
  { key: 5, label: "Resultado",          optional: false },
];

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5l3.5 3.5 6.5-7" />
    </svg>
  );
}

export function ProgressBar({ currentStep, onStepClick, maxVisited }) {
  return (
    <nav aria-label="Progreso del formulario">
      {/* Desktop (md+): circles + connectors */}
      <div className="hidden md:flex items-center py-5">
        {STEPS.map((step, i) => {
          const isCurrent   = i === currentStep;
          const isCompleted = i < currentStep;
          const isReachable = i <= maxVisited;
          const isLast      = i === STEPS.length - 1;

          return (
            <div key={step.key} className="flex items-center" style={{ flex: isLast ? "0 0 auto" : 1 }}>
              {/* Step circle + label */}
              <button
                type="button"
                disabled={!isReachable}
                onClick={() => isReachable && onStepClick(step.key)}
                className={`
                  flex flex-col items-center gap-1.5 group
                  outline-none focus-visible:ring-2 focus-visible:ring-cobalt/30 rounded-lg
                  ${isReachable ? "cursor-pointer" : "cursor-not-allowed"}
                `}
                aria-current={isCurrent ? "step" : undefined}
              >
                {/* Circle */}
                <span
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    text-xs font-bold shrink-0 transition-all duration-300
                    ${isCurrent
                      ? "bg-cobalt text-white ring-[3px] ring-cobalt/20"
                      : isCompleted
                        ? "bg-positive text-white"
                        : "bg-surface-alt text-ink-faint border border-border"
                    }
                  `}
                >
                  {isCompleted ? <CheckIcon /> : i + 1}
                </span>
                {/* Label */}
                <span
                  className={`
                    text-[11px] font-medium whitespace-nowrap transition-colors duration-200
                    ${isCurrent
                      ? "text-ink font-semibold"
                      : isCompleted
                        ? "text-positive"
                        : "text-ink-faint"
                    }
                  `}
                >
                  {step.label}
                </span>
              </button>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-2 h-0.5 rounded-full transition-colors duration-500"
                  style={{ backgroundColor: isCompleted ? "#2E7D6F" : "#E2DFD9" }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile (<md): progress bar with text */}
      <div className="flex md:hidden items-center gap-3 py-3 px-1">
        <div className="flex-1 h-1.5 rounded-full bg-surface-alt overflow-hidden">
          <div
            className="h-full rounded-full bg-cobalt transition-all duration-500"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-ink-mid whitespace-nowrap">
          {currentStep + 1} de {STEPS.length} &mdash; {STEPS[currentStep].label}
        </span>
      </div>
    </nav>
  );
}
