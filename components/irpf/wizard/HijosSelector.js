"use client";

import { useMemo } from "react";
import { eur } from "../engine/helpers.js";
import { T } from "../ui/tokens.js";
import { Tooltip } from "../ui/Tooltip.js";
import { DEDUC_HIJOS, COMP_M6, COMP_6A15 } from "../engine/constants.js";

function deducHijosTotal(num, hijosM6 = 0, hijos6a15 = 0) {
  const base = DEDUC_HIJOS.slice(0, Math.min(num, DEDUC_HIJOS.length)).reduce((a, b) => a + b, 0);
  return base + hijosM6 * COMP_M6 + hijos6a15 * COMP_6A15;
}

function AgeCounter({ label, val, onChange, max, tooltipText }) {
  return (
    <div className="mt-6">
      <div className="text-[15px] font-medium mb-3 flex items-center gap-1.5" style={{ color: T.inkMid }}>
        {label}
        {tooltipText && <Tooltip text={tooltipText} />}
      </div>
      <div className="flex gap-3">
        {Array.from({ length: max + 1 }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className="flex-1 py-3.5 text-base font-bold rounded-2xl cursor-pointer font-mono transition-all duration-200"
            style={{
              background: val === i ? T.gold : T.surface,
              color: val === i ? "#fff" : T.inkMid,
              border: `2px solid ${val === i ? T.goldAcc : T.border}`,
              boxShadow: val === i ? `0 4px 12px ${T.gold}30` : "none",
            }}
          >
            {i === 0 ? "—" : i}
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
      <div className="text-[15px] font-medium mb-4 flex items-center gap-1.5" style={{ color: T.inkMid }}>
        Hijos en común
        <Tooltip text="Descendientes convivientes con rentas ≤ SMI (16.576 €/año) y edad < 30 años. Art. 79 NF 33/2013." />
      </div>

      <div className="flex gap-3">
        {[0, 1, 2, 3, 4].map(i => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className="flex-1 py-4 text-lg font-bold rounded-2xl min-h-[52px] cursor-pointer font-mono transition-all duration-200"
            style={{
              background: value === i ? T.gold : T.surface,
              color: value === i ? "#fff" : T.inkMid,
              border: `2px solid ${value === i ? T.goldAcc : T.border}`,
              boxShadow: value === i ? `0 4px 12px ${T.gold}30` : "none",
            }}
          >
            {i === 0 ? "—" : i}
          </button>
        ))}
      </div>

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

          <div
            className="mt-6 rounded-2xl p-6 text-sm leading-relaxed"
            style={{
              background: T.goldL,
              border: `1.5px solid ${T.goldAcc}33`,
              color: T.gold,
            }}
          >
            <div className="font-semibold">
              Deducción base: {eur(dedBase)}
              {compExtra > 0 ? ` + ${eur(compExtra)} (suplemento edad)` : ""}
            </div>
            <div className="font-bold mt-1 text-base">Total: {eur(dedTotal)}</div>
            {soloMode ? (
              <div className="mt-1 font-medium">Individual (100%): {eur(dedTotal)}</div>
            ) : (
              <div className="mt-1 font-medium">
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
