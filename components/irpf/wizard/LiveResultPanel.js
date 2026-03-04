"use client";

import { eur, pct, signedEur } from "../engine/helpers.js";
import { T } from "../ui/tokens.js";

export default function LiveResultPanel({ optimo, scenarios, ready }) {
  if (!ready) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-border/60 p-10 text-center">
        <div className="text-5xl mb-4 opacity-15">&harr;</div>
        <div className="text-base font-semibold mb-2 text-ink-mid">
          Introduce tu salario bruto para ver resultados
        </div>
        <div className="text-sm leading-relaxed text-ink-faint">
          Los escenarios se calculan en tiempo real.
        </div>
      </div>
    );
  }

  if (!optimo) return null;

  const resultColor = optimo.resultado >= 0 ? T.green : T.red;
  const resultBg    = optimo.resultado >= 0 ? T.greenL : T.redL;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-border/60 overflow-hidden">
      {/* Best scenario label */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${T.greenL}, ${T.surface})`, borderBottom: `1px solid ${T.greenAcc}22` }}
      >
        <div>
          <div className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: T.green }}>
            Mejor opci\u00F3n
          </div>
          <div className="text-sm font-bold text-ink">{optimo.label}</div>
        </div>
        <span
          className="text-[10px] font-bold tracking-[0.12em] uppercase px-3 py-1.5 rounded-lg"
          style={{ background: T.greenAcc, color: "#fff" }}
        >
          \u2605 \u00D3PTIMO
        </span>
      </div>

      {/* Result amount */}
      <div className="px-6 py-6">
        <div
          className="rounded-xl p-5 mb-5"
          style={{ background: resultBg, border: `1.5px solid ${resultColor}22` }}
        >
          <div className="text-xs mb-1.5 text-ink-faint">
            {optimo.resultado >= 0 ? "Hacienda te devuelve \u2191" : "A pagar a Hacienda \u2193"}
          </div>
          <div
            className="text-4xl font-bold font-mono tracking-tight"
            style={{ color: resultColor }}
          >
            {signedEur(optimo.resultado)}
          </div>
        </div>

        {/* Effective tax rate */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl p-4" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
            <div className="text-[10px] font-bold tracking-widest uppercase mb-1.5 text-ink-faint">
              Tipo efectivo
            </div>
            <div className="text-lg font-bold font-mono text-ink">
              {pct(optimo.brutoTotal > 0 ? optimo.cl / optimo.brutoTotal : 0)}
            </div>
          </div>
          <div className="rounded-xl p-4" style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}>
            <div className="text-[10px] font-bold tracking-widest uppercase mb-1.5 text-ink-faint">
              Cuota l\u00EDquida
            </div>
            <div className="text-lg font-bold font-mono text-ink">
              {eur(optimo.cl)}
            </div>
          </div>
        </div>

        {/* Compact comparison list */}
        {scenarios && scenarios.length > 1 && (
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase mb-3 text-ink-faint">
              Todos los escenarios
            </div>
            <div className="flex flex-col gap-2">
              {[...scenarios]
                .sort((a, b) => b.resultado - a.resultado)
                .map((sc, i) => {
                  const isOptimo = i === 0;
                  const scColor = sc.resultado >= 0 ? T.green : T.red;
                  return (
                    <div
                      key={sc.id}
                      className="flex items-center justify-between px-4 py-2.5 rounded-xl transition-colors duration-200"
                      style={{
                        background: isOptimo ? T.greenL : T.surface,
                        border: `1.5px solid ${isOptimo ? T.greenAcc + "33" : T.border}`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md"
                          style={{
                            color: sc.accentColor,
                            background: sc.accentColor + "15",
                          }}
                        >
                          {sc.modalidad}
                        </span>
                        <span className="text-xs font-medium truncate max-w-[130px] text-ink">
                          {sc.label}
                        </span>
                      </div>
                      <span
                        className="text-sm font-bold font-mono whitespace-nowrap"
                        style={{ color: scColor }}
                      >
                        {signedEur(sc.resultado)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
