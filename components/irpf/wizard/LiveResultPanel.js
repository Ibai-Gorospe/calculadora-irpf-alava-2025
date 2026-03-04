"use client";

import { eur, pct } from "../engine/helpers.js";
import { T } from "../ui/tokens.js";

/* ─────────────────────────────────────────────────────────────────────────────
   signedEur — format a signed euro amount
   ───────────────────────────────────────────────────────────────────────────── */
const sign = (x) => x >= 0 ? "+" : "−";
const signedEur = (x) => sign(x) + eur(Math.abs(x));

/* ─────────────────────────────────────────────────────────────────────────────
   LiveResultPanel — Sticky panel showing live calculation results
   Props: { optimo, scenarios, ready }
   ───────────────────────────────────────────────────────────────────────────── */
export default function LiveResultPanel({ optimo, scenarios, ready }) {
  /* ── Placeholder when not enough data ────────────────────────────────── */
  if (!ready) {
    return (
      <div
        className="bg-white rounded-xl shadow-sm border p-8 text-center"
        style={{ borderColor: T.border }}
      >
        <div className="text-5xl mb-4 opacity-20">&#x27F7;</div>
        <div className="text-base font-semibold mb-2" style={{ color: T.inkMid }}>
          Introduce tu salario bruto para ver resultados
        </div>
        <div className="text-sm leading-relaxed" style={{ color: T.inkFaint }}>
          Los escenarios se calculan en tiempo real.
        </div>
      </div>
    );
  }

  if (!optimo) return null;

  const resultColor = optimo.resultado >= 0 ? T.green : T.red;
  const resultBg    = optimo.resultado >= 0 ? T.greenL : T.redL;

  return (
    <div
      className="bg-white rounded-xl shadow-md border overflow-hidden"
      style={{ borderColor: T.border }}
    >
      {/* ── Best scenario label ─────────────────────────────────────────── */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ background: `linear-gradient(135deg, ${T.greenL}, ${T.surface})`, borderBottom: `1px solid ${T.greenAcc}33` }}
      >
        <div>
          <div
            className="text-[9px] font-extrabold tracking-[0.15em] uppercase"
            style={{ color: T.green }}
          >
            Mejor opción
          </div>
          <div className="text-sm font-bold" style={{ color: T.ink }}>
            {optimo.label}
          </div>
        </div>
        <span
          className="text-[9px] font-extrabold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full"
          style={{ background: T.greenAcc, color: "#fff" }}
        >
          &#x2605; ÓPTIMO
        </span>
      </div>

      {/* ── Result amount (LARGE) ──────────────────────────────────────── */}
      <div className="px-5 py-5">
        <div
          className="rounded-xl p-4 mb-4"
          style={{ background: resultBg, border: `1px solid ${resultColor}33` }}
        >
          <div className="text-[11px] mb-1" style={{ color: T.inkFaint }}>
            {optimo.resultado >= 0 ? "Hacienda te devuelve ↑" : "A pagar a Hacienda ↓"}
          </div>
          <div
            className="text-[34px] font-black font-mono tracking-tight"
            style={{ color: resultColor }}
          >
            {signedEur(optimo.resultado)}
          </div>
        </div>

        {/* ── Effective tax rate ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className="rounded-lg p-3"
            style={{ background: T.surfaceAlt, border: `1px solid ${T.borderSoft}` }}
          >
            <div
              className="text-[9px] font-bold tracking-widest uppercase mb-1"
              style={{ color: T.inkFaint }}
            >
              Tipo efectivo
            </div>
            <div
              className="text-base font-bold font-mono"
              style={{ color: T.ink }}
            >
              {pct(optimo.brutoTotal > 0 ? optimo.cl / optimo.brutoTotal : 0)}
            </div>
          </div>
          <div
            className="rounded-lg p-3"
            style={{ background: T.surfaceAlt, border: `1px solid ${T.borderSoft}` }}
          >
            <div
              className="text-[9px] font-bold tracking-widest uppercase mb-1"
              style={{ color: T.inkFaint }}
            >
              Cuota líquida
            </div>
            <div
              className="text-base font-bold font-mono"
              style={{ color: T.ink }}
            >
              {eur(optimo.cl)}
            </div>
          </div>
        </div>

        {/* ── Compact comparison list (multiple scenarios) ────────────────── */}
        {scenarios && scenarios.length > 1 && (
          <div>
            <div
              className="text-[9px] font-bold tracking-widest uppercase mb-2"
              style={{ color: T.inkFaint }}
            >
              Todos los escenarios
            </div>
            <div className="flex flex-col gap-1.5">
              {[...scenarios]
                .sort((a, b) => b.resultado - a.resultado)
                .map((sc, i) => {
                  const isOptimo = i === 0;
                  const scColor = sc.resultado >= 0 ? T.green : T.red;
                  return (
                    <div
                      key={sc.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{
                        background: isOptimo ? T.greenL : T.surface,
                        border: `1px solid ${isOptimo ? T.greenAcc + "44" : T.borderSoft}`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[9px] font-extrabold tracking-wider uppercase px-1.5 py-0.5 rounded"
                          style={{
                            color: sc.accentColor,
                            background: sc.accentColor + "18",
                            border: `1px solid ${sc.accentColor}33`,
                          }}
                        >
                          {sc.modalidad}
                        </span>
                        <span
                          className="text-[11px] font-semibold truncate max-w-[120px]"
                          style={{ color: T.ink }}
                        >
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
