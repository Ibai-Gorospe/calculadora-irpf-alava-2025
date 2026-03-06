"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { eur, pct, signedEur } from "../engine/helpers.js";
import { T } from "../ui/tokens.js";

/* Hero Result */
function HeroResult({ optimo, diferencia }) {
  if (!optimo) return null;
  const isPositive = optimo.resultado >= 0;
  const resultColor = isPositive ? T.green : T.red;
  const teEfectivo = optimo.brutoTotal > 0 ? optimo.cl / optimo.brutoTotal : 0;

  return (
    <div
      className="rounded-2xl p-8 md:p-10 text-center"
      style={{
        background: `linear-gradient(135deg, ${T.cobaltL}, ${T.surface}, ${isPositive ? T.greenL : T.redL})`,
      }}
    >
      {/* Check/doc icon */}
      <div
        className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ backgroundColor: resultColor + "18" }}
      >
        {isPositive ? (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke={resultColor} strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke={resultColor} strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </div>

      <div className="text-xs uppercase tracking-widest font-medium mb-2" style={{ color: T.inkFaint }}>
        Resultado de tu declaracion
      </div>

      {/* Main amount */}
      <motion.div
        className="text-4xl md:text-5xl font-bold font-mono tabular-nums"
        style={{ color: resultColor }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", mass: 0.8, stiffness: 75, damping: 15 }}
      >
        {signedEur(optimo.resultado)}
      </motion.div>

      <div className="text-sm mt-2" style={{ color: T.inkMid }}>
        {isPositive ? "A devolver por Hacienda Foral de Alava" : "A ingresar a Hacienda Foral de Alava"}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
        <span className="inline-flex rounded-full px-3 py-1 text-xs font-medium"
          style={{ backgroundColor: T.surfaceAlt, color: T.inkMid }}>
          Tipo efectivo: {pct(teEfectivo)}
        </span>
        <span className="inline-flex rounded-full px-3 py-1 text-xs font-medium"
          style={{ backgroundColor: T.surfaceAlt, color: T.inkMid }}>
          {optimo.label}
        </span>
        {diferencia > 0 && (
          <span className="inline-flex rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: T.greenL, color: T.green }}>
            +{eur(diferencia)} vs peor
          </span>
        )}
      </div>
    </div>
  );
}

/* ScenarioCard */
function ScenarioCard({ sc, rank, totalOpciones, delay }) {
  const isOptimo = rank === 0;
  const isPeor   = rank === totalOpciones - 1;
  const resColor = sc.resultado >= 0 ? T.green : T.red;

  return (
    <motion.div
      className="relative rounded-xl p-5 transition-shadow duration-200 hover:shadow-md"
      style={{
        background: T.surface,
        border: `1px solid ${isOptimo ? T.green + "44" : T.border}`,
        boxShadow: T.shadowCard,
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.05, duration: 0.3 }}
    >
      {/* Badge row */}
      <div className="flex justify-between items-start mb-3">
        <span
          className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md"
          style={{ color: sc.accentColor, background: sc.accentColor + "12" }}
        >
          {sc.modalidad}
        </span>
        {isOptimo && (
          <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md"
            style={{ background: T.green, color: "#fff" }}>
            OPTIMO
          </span>
        )}
        {isPeor && totalOpciones > 2 && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md"
            style={{ color: T.red, background: T.redL }}>
            EVITAR
          </span>
        )}
      </div>

      <div className="text-sm font-semibold mb-0.5 text-ink">{sc.label}</div>
      <div className="text-[11px] mb-3 leading-relaxed text-ink-faint">{sc.sublabel}</div>

      {/* Result */}
      <div className="flex items-baseline justify-between py-3 border-t" style={{ borderColor: T.surfaceAlt }}>
        <span className="text-xs text-ink-faint">
          {sc.resultado >= 0 ? "A devolver" : "A pagar"}
        </span>
        <span className="text-2xl font-bold font-mono tabular-nums" style={{ color: resColor }}>
          {signedEur(sc.resultado)}
        </span>
      </div>

      {/* Warning */}
      {sc.warning && (
        <div className="mt-2 rounded-lg p-2 text-[11px] leading-relaxed font-medium"
          style={{ background: T.goldL, border: `1px solid ${T.gold}33`, color: "#92400E" }}>
          {sc.warning}
        </div>
      )}
    </motion.div>
  );
}

/* Desglose Row — cleaner table-like rows */
function DesgloseRow({ label, value, type, note, isBold }) {
  const colors = {
    start:  T.cobalt,
    minus:  T.red,
    plus:   T.green,
    total:  T.ink,
    result: value >= 0 ? T.green : T.red,
  };
  const textColor = colors[type] || T.inkMid;
  const isHighlight = type === "total" || type === "result";

  return (
    <div
      className="flex justify-between items-center py-3"
      style={{
        borderBottom: type === "result" ? "none" : `1px solid ${T.surfaceAlt}`,
        backgroundColor: isHighlight ? T.surfaceAlt : "transparent",
        margin: isHighlight ? "0 -1rem" : 0,
        padding: isHighlight ? "0.75rem 1rem" : undefined,
        borderRadius: isHighlight ? 8 : 0,
      }}
    >
      <span className="text-sm" style={{ color: isHighlight ? T.ink : T.inkMid, fontWeight: isHighlight ? 600 : 400 }}>
        {label}
      </span>
      <span
        className="text-sm font-mono tabular-nums text-right font-semibold"
        style={{ color: textColor }}
      >
        {type === "minus" ? "\u2212" + eur(Math.abs(value)) : type === "plus" ? "+" + eur(Math.abs(value)) : eur(value)}
      </span>
    </div>
  );
}

/* Desglose Card */
function DesgloseCard({ data, label, accent }) {
  const [open, setOpen] = useState(false);
  if (!data) return null;
  const resultColor = data.resultado >= 0 ? T.green : T.red;

  return (
    <div className="rounded-xl overflow-hidden mb-2" style={{ border: `1px solid ${T.border}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full bg-white border-none cursor-pointer px-4 py-3 flex justify-between items-center gap-3 transition-colors duration-200 hover:bg-surface-alt/50"
      >
        <div className="text-left">
          <div className="text-xs font-semibold" style={{ color: accent }}>{label}</div>
          <div className="text-[11px] mt-0.5" style={{ color: T.inkFaint }}>
            Cuota: {eur(data.cl)} &middot; Tipo: {pct(data.teReal ?? 0)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold font-mono tabular-nums" style={{ color: resultColor }}>
            {signedEur(data.resultado)}
          </span>
          <span className="text-xs transition-transform duration-200"
            style={{ color: T.inkFaint, transform: open ? "rotate(180deg)" : "none", display: "inline-block" }}>
            &#x25BE;
          </span>
        </div>
      </button>

      {open && (
        <div className="px-4 py-4 border-t bg-white" style={{ borderColor: T.border }}>
          <DesgloseRow label="Retribucion bruta" value={data.bruto ?? ((data.brutoA ?? 0) + (data.brutoB ?? 0))} type="start" />
          {(data.otrosRdtosTrabajo ?? data.otrosRdtosTotal ?? 0) > 0 && (
            <DesgloseRow label="Otros rdtos. trabajo" value={data.otrosRdtosTrabajo ?? data.otrosRdtosTotal} type="plus" />
          )}
          <DesgloseRow label="Cotizaciones SS" value={data.ss ?? (data.ssA ?? 0) + (data.ssB ?? 0)} type="minus" />
          <DesgloseRow label="Bonificacion art. 23" value={data.bonif ?? (data.bonA ?? 0) + (data.bonB ?? 0)} type="minus" />
          <DesgloseRow label="Rendimiento neto trabajo" value={data.rnt ?? (data.rntA ?? 0) + (data.rntB ?? 0)} type="total" />
          {((data.rciNeto ?? ((data.rciNetoA ?? 0) + (data.rciNetoB ?? 0)))) > 0 && (
            <DesgloseRow label="Rdto. capital inmobiliario" value={data.rciNeto ?? ((data.rciNetoA ?? 0) + (data.rciNetoB ?? 0))} type="plus" />
          )}
          {(data.redExtra ?? ((data.redExtraA ?? 0) + (data.redExtraB ?? 0))) > 0 && (
            <DesgloseRow label="Reducciones de base" value={data.redExtra ?? ((data.redExtraA ?? 0) + (data.redExtraB ?? 0))} type="minus" />
          )}
          <DesgloseRow label="Base liquidable general" value={data.bl ?? 0} type="total" />
          <DesgloseRow label="Cuota integra" value={data.ci ?? 0} type="total" />
          <DesgloseRow label="Minoracion de cuota" value={data.minTotal ?? 0} type="minus" />
          {(data.dedH ?? 0) > 0 && <DesgloseRow label="Deduc. descendientes" value={data.dedH} type="minus" />}
          {(data.dedViud ?? 0) > 0 && <DesgloseRow label="Deduc. viudedad" value={data.dedViud} type="minus" />}
          {(data.dedEdad ?? 0) > 0 && <DesgloseRow label="Deduc. edad" value={data.dedEdad} type="minus" />}
          {(data.dedDiscap ?? 0) > 0 && <DesgloseRow label="Deduc. discapacidad" value={data.dedDiscap} type="minus" />}
          {(data.dedCuid ?? 0) > 0 && <DesgloseRow label="Deduc. cuidado" value={data.dedCuid} type="minus" />}
          {(data.dedAsc ?? 0) > 0 && <DesgloseRow label="Deduc. ascendientes" value={data.dedAsc} type="minus" />}
          {(data.dedOtras ?? 0) > 0 && <DesgloseRow label="Otras deducciones" value={data.dedOtras} type="minus" />}
          {(data.dedViv ?? 0) > 0 && <DesgloseRow label="Deduc. vivienda" value={data.dedViv} type="minus" />}
          {(data.dedAlq ?? 0) > 0 && <DesgloseRow label="Deduc. alquiler" value={data.dedAlq} type="minus" />}
          {(data.dedAlim ?? 0) > 0 && <DesgloseRow label="Deduc. alimentos hijos" value={data.dedAlim} type="minus" />}
          {(data.dedDiscapFam ?? 0) > 0 && <DesgloseRow label="Deduc. discap. familiar" value={data.dedDiscapFam} type="minus" />}
          {(data.dedAsistPers ?? 0) > 0 && <DesgloseRow label="Deduc. asist. personal" value={data.dedAsistPers} type="minus" />}
          {(data.dedDon ?? 0) > 0 && <DesgloseRow label="Deduc. donaciones" value={data.dedDon} type="minus" />}
          {(data.dedInv ?? 0) > 0 && <DesgloseRow label="Deduc. inversion" value={data.dedInv} type="minus" />}
          <DesgloseRow label="CUOTA LIQUIDA" value={data.cl ?? 0} type="total" />
          <div className="h-2" />
          <DesgloseRow label="Retenciones practicadas" value={data.ret ?? data.retTotal ?? 0} type="start" />
          <DesgloseRow label="Cuota liquida" value={data.cl ?? 0} type="minus" />
          <DesgloseRow
            label={data.resultado >= 0 ? "RESULTADO: A devolver" : "RESULTADO: A ingresar"}
            value={data.resultado}
            type="result"
          />
        </div>
      )}
    </div>
  );
}

/* TablaComparativa */
function TablaComparativa({ scenarios }) {
  if (!scenarios?.length) return null;
  const sorted = [...scenarios].sort((a, b) => b.resultado - a.resultado);
  const best = sorted[0].resultado;

  const rows = [
    { label: "Bruto total",        key: "brutoTotal",    fmt: eur },
    { label: "Cotiz. SS",          key: "ssTotal",       fmt: v => "\u2212" + eur(v) },
    { label: "Bonif. art. 23",     key: "bonifTotal",    fmt: v => "\u2212" + eur(v) },
    { label: "Rdto. neto",         key: "rntTotal",      fmt: eur, bold: true },
    { label: "Base liquidable",    key: "bl",            fmt: eur, bold: true },
    { label: "Cuota integra",      key: "ci",            fmt: eur, bold: true },
    { label: "Minoracion",         key: "minoracion",    fmt: v => "\u2212" + eur(v) },
    { label: "Deduc. hijos",       key: "dedH",          fmt: v => v > 0 ? "\u2212" + eur(v) : "\u2014" },
    { label: "CUOTA LIQUIDA",      key: "cl",            fmt: eur, bold: true, highlight: true },
    { label: "Retenciones",        key: "retTotal",      fmt: eur },
    { label: "RESULTADO",          key: "resultado",     fmt: signedEur, bold: true, resultRow: true },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs font-mono">
        <thead>
          <tr style={{ background: T.surfaceAlt }}>
            <th className="text-left px-3 py-2.5 text-[11px] font-semibold tracking-wider uppercase min-w-[130px]"
              style={{ borderBottom: `1px solid ${T.border}`, color: T.inkFaint }}>
              Concepto
            </th>
            {sorted.map((sc, i) => (
              <th key={sc.id} className="text-right px-3 py-2.5 min-w-[120px]"
                style={{ borderBottom: `1px solid ${T.border}`, background: i === 0 ? T.greenL : "transparent" }}>
                <div className="text-[10px] font-bold tracking-wider uppercase" style={{ color: sc.accentColor }}>{sc.modalidad}</div>
                <div className="text-[10px] font-semibold" style={{ color: T.ink }}>{sc.label}</div>
                {i === 0 && <div className="text-[9px] font-bold mt-0.5" style={{ color: T.green }}>OPTIMO</div>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.key + row.label} style={{ borderBottom: `1px solid ${T.borderSoft}`, background: row.highlight ? T.surfaceAlt : "transparent" }}>
              <td className="px-3 py-2 text-[11px]" style={{ color: row.bold ? T.ink : T.inkMid, fontWeight: row.bold ? 600 : 400, fontFamily: T.fontSans }}>
                {row.label}
              </td>
              {sorted.map((sc, i) => {
                const val = sc[row.key];
                const isResult = row.resultRow;
                const colr = isResult ? (val >= 0 ? T.green : T.red) : (row.bold ? T.ink : T.inkMid);
                const diff = isResult && i > 0 ? val - best : null;
                return (
                  <td key={sc.id} className="text-right px-3 py-2 tabular-nums"
                    style={{
                      fontWeight: row.bold ? 600 : 400,
                      color: colr,
                      background: i === 0 ? T.greenL + "80" : isResult ? (val >= 0 ? T.greenL : T.redL) : "transparent",
                      borderLeft: `1px solid ${T.borderSoft}`,
                    }}>
                    {row.fmt(val)}
                    {diff !== null && (
                      <div className="text-[9px] mt-0.5" style={{ color: T.red }}>
                        \u2212{eur(Math.abs(diff))} vs optimo
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* StepResultado */
export default function StepResultado({
  calc,
  scenarios,
  optimo,
  diferencia,
  hijos,
  hijosM6,
  hijos6a15,
  onEditData,
  state,
  showPersonB,
}) {
  const [showTabla, setShowTabla] = useState(false);

  if (!optimo || !scenarios?.length) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center" style={{ border: `1px solid ${T.border}`, boxShadow: T.shadowCard }}>
        <div className="text-base font-semibold mb-2 text-ink-mid">
          No hay datos suficientes para calcular
        </div>
        <div className="text-sm leading-relaxed text-ink-faint">
          Vuelve a los pasos anteriores e introduce al menos el salario bruto.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Actions top */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onEditData}
          className="px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-150"
          style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.inkMid }}
        >
          &larr; Modificar datos
        </button>
        <button
          onClick={onEditData}
          className="px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-150"
          style={{ color: T.inkFaint }}
        >
          Nueva simulacion
        </button>
      </div>

      {/* 1. Hero Result */}
      <HeroResult optimo={optimo} diferencia={diferencia} />

      {/* 2. Desglose del calculo */}
      <div className="bg-white rounded-xl p-6" style={{ border: `1px solid ${T.border}`, boxShadow: T.shadowCard }}>
        <h3 className="text-lg font-semibold mb-4 text-ink">Desglose del calculo</h3>

        {calc && (
          <>
            {calc.a_sh && <DesgloseCard data={calc.a_sh} label="Persona A \u2014 Individual sin hijos" accent={T.cobalt} />}
            {calc.a_ch && hijos > 0 && (
              <DesgloseCard data={calc.a_ch} label={`Persona A \u2014 Individual con hijos (${calc.solo ? "100%" : "50%"} = ${eur(calc.a_ch.dedH)})`} accent={T.cobalt} />
            )}

            {!calc.solo && (
              <>
                {calc.b_sh && <DesgloseCard data={calc.b_sh} label="Persona B \u2014 Individual sin hijos" accent={T.teal} />}
                {calc.b_ch && hijos > 0 && (
                  <DesgloseCard data={calc.b_ch} label={`Persona B \u2014 Individual con hijos (50% = ${eur(calc.b_ch.dedH)})`} accent={T.teal} />
                )}
                {calc.c_sh && <DesgloseCard data={calc.c_sh} label="Conjunta sin hijos" accent={T.gold} />}
                {calc.c_ch && hijos > 0 && (
                  <DesgloseCard data={calc.c_ch} label={`Conjunta con hijos (100% = ${eur(calc.c_ch.dedH)})`} accent={T.gold} />
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* 3. Scenario Cards Grid */}
      <div>
        <h3 className="text-sm font-semibold tracking-wide uppercase mb-4 text-ink-faint">
          Comparativa de escenarios
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((sc, i) => (
            <ScenarioCard key={sc.id} sc={sc} rank={i} totalOpciones={scenarios.length} delay={i} />
          ))}
        </div>
      </div>

      {/* 4. Collapsible comparison table */}
      <div>
        <button
          onClick={() => setShowTabla(t => !t)}
          className="w-full px-4 py-3 bg-white cursor-pointer text-sm font-semibold
                     flex justify-between items-center transition-colors duration-150 hover:bg-surface-alt/50"
          style={{
            border: `1px solid ${T.border}`,
            borderRadius: showTabla ? "12px 12px 0 0" : 12,
            color: T.ink,
          }}
        >
          <span>Tabla comparativa</span>
          <span className="text-[11px] text-ink-faint">
            {showTabla ? "Ocultar" : "Mostrar"}
          </span>
        </button>
        {showTabla && (
          <div className="bg-white overflow-hidden"
            style={{ border: `1px solid ${T.border}`, borderTop: "none", borderRadius: "0 0 12px 12px" }}>
            <TablaComparativa scenarios={scenarios} />
          </div>
        )}
      </div>

      {/* 5. Disclaimer */}
      <div className="rounded-xl p-4 text-xs leading-relaxed italic"
        style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.inkMid }}>
        Los resultados son orientativos y no vinculantes. Basado en la normativa foral de Alava vigente para el ejercicio 2025.
        Consulte con su asesor fiscal para una estimacion definitiva.
      </div>
    </div>
  );
}
