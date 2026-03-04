"use client";

import { useMemo } from "react";
import { eur } from "../engine/helpers.js";
import { T } from "../ui/tokens.js";
import { Tooltip } from "../ui/Tooltip.js";
import {
  DEDUC_HIJOS, COMP_M6, COMP_6A15,
} from "../engine/constants.js";

function deducHijosTotal(num, hijosM6 = 0, hijos6a15 = 0) {
  const base = DEDUC_HIJOS.slice(0, Math.min(num, DEDUC_HIJOS.length)).reduce((a, b) => a + b, 0);
  return base + hijosM6 * COMP_M6 + hijos6a15 * COMP_6A15;
}

function AgeCounter({ label, val, onChange, max, tooltipText }) {
  return (
    <div className="mt-5">
      <div
        className="text-[13px] font-semibold mb-2.5 flex items-center gap-1"
        style={{ color: T.inkMid }}
      >
        {label}
        {tooltipText && <Tooltip text={tooltipText}><span /></Tooltip>}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: max + 1 }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className="flex-1 py-3 text-sm font-bold rounded-xl cursor-pointer font-mono transition-all duration-150"
            style={{
              background: val === i ? T.gold : T.surface,
              color: val === i ? "#fff" : T.inkMid,
              border: `1.5px solid ${val === i ? T.goldAcc : T.border}`,
            }}
          >
            {i === 0 ? "\u2014" : i}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function HijosSelector({
  value,
  onChange,
  hijosM6,
  onChangeM6,
  hijos6a15,
  onChangej6a15,
  soloMode = false,
}) {
  const dedBase  = useMemo(() => deducHijosTotal(value, 0, 0), [value]);
  const dedTotal = useMemo(() => deducHijosTotal(value, hijosM6, hijos6a15), [value, hijosM6, hijos6a15]);
  const compExtra = dedTotal - dedBase;

  return (
    <div>
      {/* Label */}
      <div
        className="text-[13px] font-semibold mb-3 flex items-center gap-1"
        style={{ color: T.inkMid }}
      >
        Hijos en común
        <Tooltip text="Descendientes convivientes con rentas \u2264 SMI (16.576 \u20AC/a\u00F1o) y edad < 30 a\u00F1os. Art. 79 NF 33/2013.">
          <span />
        </Tooltip>
      </div>

      {/* Count buttons 0-4 */}
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map(i => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className="flex-1 py-3.5 text-base font-bold rounded-xl cursor-pointer font-mono transition-all duration-150"
            style={{
              background: value === i ? T.gold : T.surface,
              color: value === i ? "#fff" : T.inkMid,
              border: `1.5px solid ${value === i ? T.goldAcc : T.border}`,
            }}
          >
            {i === 0 ? "\u2014" : i}
          </button>
        ))}
      </div>

      {/* Age sub-selectors when children > 0 */}
      {value > 0 && (
        <>
          <AgeCounter
            label="De ellos, menores de 6 años"
            val={hijosM6}
            onChange={v => onChangeM6(v)}
            max={value}
            tooltipText={`+${eur(COMP_M6)} por cada hijo menor de 6 años. Art. 79.2 NF 19/2024.`}
          />
          <AgeCounter
            label="De 6 a 15 años"
            val={hijos6a15}
            onChange={v => onChangej6a15(v)}
            max={value - hijosM6}
            tooltipText={`+${eur(COMP_6A15)} por cada hijo de 6 a 15 años. Art. 79.2 NF 19/2024.`}
          />

          {/* Info box */}
          <div
            className="mt-5 rounded-xl p-5 text-[13px] leading-relaxed"
            style={{
              background: T.goldL,
              border: `1px solid ${T.goldAcc}44`,
              color: T.gold,
            }}
          >
            <div className="font-bold">
              Deducción base: {eur(dedBase)}
              {compExtra > 0 ? ` + ${eur(compExtra)} (suplemento edad)` : ""}
            </div>
            <div className="font-bold mt-1">Total: {eur(dedTotal)}</div>
            {soloMode ? (
              <div className="mt-1">Individual (100%): {eur(dedTotal)}</div>
            ) : (
              <div className="mt-1">
                <div>Individual (50% c/u): {eur(dedTotal / 2)} por progenitor</div>
                <div>Conjunta (100%): {eur(dedTotal)} completa</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
