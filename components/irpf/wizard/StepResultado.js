"use client";

import { useState } from "react";
import { eur, pct, signedEur } from "../engine/helpers.js";
import { T } from "../ui/tokens.js";

/* RecommendationBanner */
function RecommendationBanner({ optimo, diferencia }) {
  if (!optimo) return null;

  return (
    <div
      className="rounded-2xl p-6 md:p-7"
      style={{
        background: `linear-gradient(135deg, ${T.greenL}, ${T.surface}, ${T.greenL})`,
        border: `2px solid ${T.greenAcc}33`,
      }}
    >
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: T.green }}>
            Recomendaci\u00F3n
          </div>
          <div className="text-xl font-bold leading-tight text-ink">
            {optimo.resultado >= 0
              ? `Hacienda te devuelve ${eur(Math.abs(optimo.resultado))}`
              : `Tendr\u00E1s que pagar ${eur(Math.abs(optimo.resultado))}`
            }
          </div>
          <div className="text-[13px] mt-2 leading-relaxed text-ink-mid">
            Tu mejor opci\u00F3n es{" "}
            <strong className="text-ink">{optimo.label.toLowerCase()}</strong>.
            {diferencia > 0 && ` Ahorras ${eur(diferencia)} frente a la peor opci\u00F3n.`}
          </div>
        </div>
        <div className="text-center">
          <div
            className="text-[34px] font-bold font-mono tracking-tight"
            style={{ color: optimo.resultado >= 0 ? T.green : T.red }}
          >
            {signedEur(optimo.resultado)}
          </div>
          {diferencia > 0 && (
            <div className="text-[11px] mt-1 font-semibold" style={{ color: T.green }}>
              +{eur(diferencia)} vs peor
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ScenarioCard */
function ScenarioCard({ sc, rank, totalOpciones }) {
  const isOptimo = rank === 0;
  const isPeor   = rank === totalOpciones - 1;
  const resColor = sc.resultado >= 0 ? T.green : T.red;
  const resBg    = sc.resultado >= 0 ? T.greenL : T.redL;

  return (
    <div
      className="relative rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        background: isOptimo ? `linear-gradient(135deg, ${T.greenL}, ${T.surface})` : T.surface,
        border: `2px solid ${isOptimo ? T.greenAcc + "44" : isPeor && totalOpciones > 2 ? T.redAcc + "33" : T.border}`,
        boxShadow: isOptimo ? `0 8px 24px ${T.greenAcc}15` : "0 1px 4px rgba(0,0,0,.04)",
      }}
    >
      {/* Badge */}
      <div className="flex justify-between items-start mb-3">
        <span
          className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg"
          style={{
            color: sc.accentColor,
            background: sc.accentColor + "12",
          }}
        >
          {sc.modalidad}
        </span>
        {isOptimo && (
          <span
            className="text-[9px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-lg"
            style={{ background: T.greenAcc, color: "#fff" }}
          >
            \u2605 \u00D3PTIMO
          </span>
        )}
        {isPeor && totalOpciones > 2 && (
          <span
            className="text-[9px] font-bold px-2.5 py-1 rounded-lg"
            style={{ color: T.red, background: T.redL }}
          >
            EVITAR
          </span>
        )}
      </div>

      {/* Title */}
      <div className="text-sm font-bold mb-1 text-ink">{sc.label}</div>
      <div className="text-[11px] mb-4 leading-relaxed text-ink-mid">{sc.sublabel}</div>

      {/* Result */}
      <div
        className="rounded-xl p-3.5 mb-3.5"
        style={{ background: resBg, border: `1.5px solid ${resColor}22` }}
      >
        <div className="text-[11px] mb-0.5 text-ink-faint">
          {sc.resultado >= 0 ? "Hacienda devuelve \u2191" : "A pagar a Hacienda \u2193"}
        </div>
        <div
          className="text-3xl font-bold font-mono tracking-tight"
          style={{ color: resColor }}
        >
          {signedEur(sc.resultado)}
        </div>
      </div>

      {/* Ranking */}
      <div className="flex items-center gap-1.5 text-[11px] text-ink-faint">
        <span className="text-base">{["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49", "4\u00BA", "5\u00BA", "6\u00BA", "7\u00BA"][rank]}</span>
        <span>Puesto {rank + 1} de {totalOpciones}</span>
      </div>

      {/* Warning */}
      {sc.warning && (
        <div
          className="mt-3 rounded-xl p-2.5 text-[11px] leading-relaxed font-medium"
          style={{ background: "#FEF3C7", border: "1.5px solid #FCD34D33", color: "#92400E" }}
        >
          \u26A0 {sc.warning}
        </div>
      )}
    </div>
  );
}

/* WaterfallRow */
function WaterfallRow({ label, value, type, note, isLast }) {
  const colors = {
    start:  { bar: T.cobalt,   bg: T.cobaltL,    text: T.cobalt },
    minus:  { bar: T.redAcc,   bg: T.redL,       text: T.red },
    plus:   { bar: T.greenAcc, bg: T.greenL,     text: T.green },
    total:  { bar: T.ink,      bg: T.surfaceAlt,  text: T.ink },
    result: { bar: value >= 0 ? T.greenAcc : T.redAcc, bg: value >= 0 ? T.greenL : T.redL, text: value >= 0 ? T.green : T.red },
  };
  const c = colors[type] || colors.total;
  const absVal = Math.abs(value);
  const maxForBar = 60000;
  const barWidth = Math.min(95, (absVal / maxForBar) * 95);

  return (
    <div className={isLast ? "" : "pb-2 mb-1"}>
      <div className="flex items-center gap-2.5">
        <div className="w-5 text-center text-[13px] flex-shrink-0">
          {type === "minus" ? <span style={{ color: T.redAcc }}>&minus;</span>
           : type === "plus" ? <span style={{ color: T.greenAcc }}>+</span>
           : type === "result" ? <span className="font-bold" style={{ color: c.text }}>=</span>
           : <span className="text-ink-faint">&middot;</span>}
        </div>
        <div className="flex-1 text-xs" style={{ color: type === "total" || type === "result" ? T.ink : T.inkMid, fontWeight: type === "total" || type === "result" ? 700 : 400 }}>
          {label}
          {note && <div className="text-[10px] mt-0.5" style={{ color: T.inkFaint }}>{note}</div>}
        </div>
        <div
          className="text-[13px] font-mono min-w-[100px] text-right"
          style={{ fontWeight: type === "total" || type === "result" ? 700 : 500, color: c.text }}
        >
          {type === "minus" ? "\u2212" + eur(absVal) : type === "plus" ? "+" + eur(absVal) : eur(value)}
        </div>
      </div>
      {type !== "result" && (
        <div className="ml-[30px] mt-1 h-[4px] rounded-full overflow-hidden" style={{ background: T.border }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${barWidth}%`, background: c.bar }} />
        </div>
      )}
    </div>
  );
}

/* WaterfallDesglose */
function WaterfallDesglose({ data, label, accent }) {
  const [open, setOpen] = useState(false);
  if (!data) return null;
  const resultColor = data.resultado >= 0 ? T.green : T.red;

  return (
    <div className="rounded-xl overflow-hidden mb-2" style={{ border: `1.5px solid ${T.border}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full bg-white border-none cursor-pointer px-4 py-3.5 flex justify-between items-center gap-3 transition-colors duration-200"
        style={{ background: open ? T.surfaceAlt : T.surface }}
      >
        <div className="text-left">
          <div className="text-xs font-bold" style={{ color: accent }}>{label}</div>
          <div className="text-[11px] mt-0.5 text-ink-faint">
            Cuota l\u00EDquida: {eur(data.cl)} &middot; Tipo efectivo: {pct(data.teReal ?? 0)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] text-ink-faint">
              {data.resultado >= 0 ? "A devolver" : "A ingresar"}
            </div>
            <div className="text-xl font-bold font-mono" style={{ color: resultColor }}>
              {signedEur(data.resultado)}
            </div>
          </div>
          <div
            className="text-base transition-transform duration-200"
            style={{ color: T.inkFaint, transform: open ? "rotate(180deg)" : "none" }}
          >
            &#x25BE;
          </div>
        </div>
      </button>

      {open && (
        <div className="p-4 border-t bg-white" style={{ borderColor: T.border }}>
          <WaterfallRow label="Retribuci\u00F3n bruta" value={data.bruto ?? ((data.brutoA ?? 0) + (data.brutoB ?? 0))} type="start" />
          {(data.otrosRdtosTrabajo ?? data.otrosRdtosTotal ?? 0) > 0 && (
            <WaterfallRow label="Otros rdtos. trabajo" value={data.otrosRdtosTrabajo ?? data.otrosRdtosTotal} type="plus" note="Arts. 16, 18, 19 NF 33/2013" />
          )}
          <WaterfallRow label="Cotizaciones Seg. Social" value={data.ss ?? (data.ssA ?? 0) + (data.ssB ?? 0)} type="minus" />
          <WaterfallRow label="Bonificaci\u00F3n art. 23" value={data.bonif ?? (data.bonA ?? 0) + (data.bonB ?? 0)} type="minus" />
          <WaterfallRow label="Rendimiento neto del trabajo" value={data.rnt ?? (data.rntA ?? 0) + (data.rntB ?? 0)} type="total" />
          {((data.rciNeto ?? ((data.rciNetoA ?? 0) + (data.rciNetoB ?? 0)))) > 0 && (
            <WaterfallRow label="Rdto. neto capital inmobiliario" value={data.rciNeto ?? ((data.rciNetoA ?? 0) + (data.rciNetoB ?? 0))} type="plus" />
          )}
          {(data.redExtra ?? ((data.redExtraA ?? 0) + (data.redExtraB ?? 0))) > 0 && (
            <WaterfallRow label="Otras reducciones de base" value={data.redExtra ?? ((data.redExtraA ?? 0) + (data.redExtraB ?? 0))} type="minus" />
          )}
          <WaterfallRow label="Base liquidable general" value={data.bl ?? 0} type="total" />
          <WaterfallRow label="Cuota \u00EDntegra" value={data.ci ?? 0} type="total" />
          <WaterfallRow label="Minoraci\u00F3n de cuota" value={data.minTotal ?? 0} type="minus" />
          {(data.dedH ?? 0) > 0 && <WaterfallRow label="Deducci\u00F3n descendientes" value={data.dedH} type="minus" />}
          {(data.dedViud ?? 0) > 0 && <WaterfallRow label="Deducci\u00F3n viudedad" value={data.dedViud} type="minus" />}
          {(data.dedEdad ?? 0) > 0 && <WaterfallRow label="Deducci\u00F3n por edad" value={data.dedEdad} type="minus" />}
          {(data.dedDiscap ?? 0) > 0 && <WaterfallRow label="Deducci\u00F3n discapacidad" value={data.dedDiscap} type="minus" />}
          {(data.dedCuid ?? 0) > 0 && <WaterfallRow label="Deducci\u00F3n cuidado" value={data.dedCuid} type="minus" />}
          {(data.dedAsc ?? 0) > 0 && <WaterfallRow label="Deducci\u00F3n ascendientes" value={data.dedAsc} type="minus" />}
          {(data.dedOtras ?? 0) > 0 && <WaterfallRow label="Otras deducciones" value={data.dedOtras} type="minus" />}
          {(data.dedViv ?? 0) > 0 && <WaterfallRow label="Deducci\u00F3n vivienda" value={data.dedViv} type="minus" />}
          {(data.dedAlq ?? 0) > 0 && <WaterfallRow label="Deducci\u00F3n alquiler" value={data.dedAlq} type="minus" />}
          {(data.dedAlim ?? 0) > 0 && <WaterfallRow label="Deducci\u00F3n alimentos hijos" value={data.dedAlim} type="minus" />}
          {(data.dedDiscapFam ?? 0) > 0 && <WaterfallRow label="Deducci\u00F3n discapacidad familiares" value={data.dedDiscapFam} type="minus" />}
          {(data.dedAsistPers ?? 0) > 0 && <WaterfallRow label="Deducci\u00F3n asistente personal" value={data.dedAsistPers} type="minus" />}
          {(data.dedDon ?? 0) > 0 && <WaterfallRow label="Deducci\u00F3n donaciones" value={data.dedDon} type="minus" />}
          {(data.dedInv ?? 0) > 0 && <WaterfallRow label="Deducci\u00F3n inversi\u00F3n" value={data.dedInv} type="minus" />}
          <WaterfallRow label="CUOTA L\u00CDQUIDA" value={data.cl ?? 0} type="total" />
          <div className="h-3" />
          <WaterfallRow label="Retenciones practicadas" value={data.ret ?? data.retTotal ?? 0} type="start" />
          <WaterfallRow label="Cuota l\u00EDquida" value={data.cl ?? 0} type="minus" />
          <WaterfallRow
            label={data.resultado >= 0 ? "RESULTADO: A devolver" : "RESULTADO: A ingresar"}
            value={data.resultado}
            type="result"
          />

          {/* Secondary metrics */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {(() => {
              const brutoTotal = data.bruto ?? ((data.brutoA ?? 0) + (data.brutoB ?? 0));
              const retTotal = data.ret ?? data.retTotal ?? 0;
              const teRetCalc = data.teRet ?? (brutoTotal > 0 ? retTotal / brutoTotal : 0);
              return [
                ["Tipo efectivo real", pct(data.teReal ?? 0)],
                ["% retenci\u00F3n aplicada", pct(teRetCalc)],
                ["Cuota l\u00EDquida", eur(data.cl ?? 0)],
              ];
            })().map(([k, v]) => (
              <div
                key={k}
                className="rounded-xl p-2.5"
                style={{ background: T.surfaceAlt, border: `1px solid ${T.border}` }}
              >
                <div className="text-[9px] uppercase tracking-widest mb-1 text-ink-faint">{k}</div>
                <div className="text-sm font-bold font-mono text-ink">{v}</div>
              </div>
            ))}
          </div>
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
    { label: "Cuota \u00EDntegra", key: "ci",            fmt: eur, bold: true },
    { label: "Minoraci\u00F3n",    key: "minoracion",    fmt: v => "\u2212" + eur(v) },
    { label: "Deducc. hijos",      key: "dedH",          fmt: v => v > 0 ? "\u2212" + eur(v) : "\u2014" },
    { label: "CUOTA L\u00CDQUIDA", key: "cl",            fmt: eur, bold: true, highlight: true },
    { label: "Retenciones",        key: "retTotal",      fmt: eur },
    { label: "RESULTADO",          key: "resultado",     fmt: signedEur, bold: true, resultRow: true },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs font-mono">
        <thead>
          <tr style={{ background: T.surfaceAlt }}>
            <th
              className="text-left px-3.5 py-2.5 text-[10px] font-bold tracking-wider uppercase min-w-[140px] text-ink-faint"
              style={{ borderBottom: `1px solid ${T.border}` }}
            >
              Concepto
            </th>
            {sorted.map((sc, i) => (
              <th
                key={sc.id}
                className="text-right px-3.5 py-2.5 min-w-[130px]"
                style={{ borderBottom: `1px solid ${T.border}`, background: i === 0 ? T.greenL : "transparent" }}
              >
                <div className="text-[10px] font-bold tracking-wider uppercase" style={{ color: sc.accentColor }}>{sc.modalidad}</div>
                <div className="text-[11px] font-semibold text-ink">{sc.label}</div>
                {i === 0 && <div className="text-[9px] font-bold mt-0.5" style={{ color: T.greenAcc }}>\u2605 \u00D3PTIMO</div>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.key + row.label} style={{ borderBottom: `1px solid ${T.borderSoft}`, background: row.highlight ? T.surfaceAlt : "transparent" }}>
              <td className="px-3.5 py-2 text-[11px]" style={{ color: row.bold ? T.ink : T.inkMid, fontWeight: row.bold ? 700 : 400, fontFamily: T.fontSans }}>
                {row.label}
              </td>
              {sorted.map((sc, i) => {
                const val = sc[row.key];
                const isResult = row.resultRow;
                const colr = isResult ? (val >= 0 ? T.green : T.red) : (row.bold ? T.ink : T.inkMid);
                const diff = isResult && i > 0 ? val - best : null;
                return (
                  <td
                    key={sc.id}
                    className="text-right px-3.5 py-2"
                    style={{
                      fontWeight: row.bold ? 700 : 400,
                      color: colr,
                      background: i === 0 ? T.greenL + "80" : isResult ? (val >= 0 ? T.greenL : T.redL) : "transparent",
                      borderLeft: `1px solid ${T.borderSoft}`,
                    }}
                  >
                    {row.fmt(val)}
                    {diff !== null && (
                      <div className="text-[9px] mt-0.5" style={{ color: T.red }}>
                        \u2212{eur(Math.abs(diff))} vs \u00F3ptimo
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
      <div className="bg-white rounded-2xl border border-border/60 p-12 text-center shadow-sm">
        <div className="text-4xl mb-4 opacity-15">&harr;</div>
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
      {/* "Modificar datos" button */}
      <button
        onClick={onEditData}
        className="self-start px-4 py-2 rounded-xl text-xs font-medium cursor-pointer
                   transition-all duration-200 hover:bg-surface-alt"
        style={{
          background: T.surface,
          border: `1.5px solid ${T.border}`,
          color: T.inkMid,
        }}
      >
        &larr; Modificar datos
      </button>

      {/* 1. Recommendation Banner */}
      <RecommendationBanner optimo={optimo} diferencia={diferencia} />

      {/* 2. Scenario Cards Grid */}
      <div>
        <div className="text-[11px] font-bold tracking-widest uppercase mb-3 text-ink-faint">
          Comparativa de escenarios
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((sc, i) => (
            <ScenarioCard key={sc.id} sc={sc} rank={i} totalOpciones={scenarios.length} />
          ))}
        </div>
      </div>

      {/* 3. Waterfall breakdowns */}
      {calc && (
        <div>
          <div className="text-[11px] font-bold tracking-widest uppercase mb-3 text-ink-faint">
            Desglose paso a paso
          </div>

          <div className="text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: T.cobalt }}>
            Declaraci\u00F3n individual
          </div>
          {calc.a_sh && <WaterfallDesglose data={calc.a_sh} label="Persona A \u2014 Individual sin hijos" accent={T.cobalt} />}
          {calc.a_ch && hijos > 0 && (
            <WaterfallDesglose data={calc.a_ch} label={`Persona A \u2014 Individual con hijos (${calc.solo ? "100%" : "50%"} = ${eur(calc.a_ch.dedH)})`} accent={T.cobalt} />
          )}

          {!calc.solo && (
            <>
              {calc.b_sh && <WaterfallDesglose data={calc.b_sh} label="Persona B \u2014 Individual sin hijos" accent={T.teal} />}
              {calc.b_ch && hijos > 0 && (
                <WaterfallDesglose data={calc.b_ch} label={`Persona B \u2014 Individual con hijos (50% = ${eur(calc.b_ch.dedH)})`} accent={T.teal} />
              )}

              <div className="text-[11px] font-bold tracking-widest uppercase mb-2 mt-5" style={{ color: T.gold }}>
                Declaraci\u00F3n conjunta
              </div>
              {calc.c_sh && (
                <WaterfallDesglose data={calc.c_sh} label="Conjunta sin hijos" accent={T.gold} />
              )}
              {calc.c_ch && hijos > 0 && (
                <WaterfallDesglose data={calc.c_ch} label={`Conjunta con hijos (100% = ${eur(calc.c_ch.dedH)})`} accent={T.gold} />
              )}
            </>
          )}
        </div>
      )}

      {/* 4. Collapsible comparison table */}
      <div>
        <button
          onClick={() => setShowTabla(t => !t)}
          className="w-full px-5 py-3.5 bg-white cursor-pointer text-[13px] font-bold
                     flex justify-between items-center transition-all duration-200 hover:bg-surface-alt"
          style={{
            border: `1.5px solid ${T.border}`,
            borderRadius: showTabla ? "14px 14px 0 0" : 14,
            color: T.ink,
          }}
        >
          <span>Tabla comparativa lado a lado</span>
          <span className="text-[11px] text-ink-faint">
            {showTabla ? "Ocultar \u25B4" : "Mostrar \u25BE"}
          </span>
        </button>
        {showTabla && (
          <div
            className="bg-white overflow-hidden"
            style={{ border: `1.5px solid ${T.border}`, borderTop: "none", borderRadius: "0 0 14px 14px" }}
          >
            <TablaComparativa scenarios={scenarios} />
          </div>
        )}
      </div>

      {/* 5. Disclaimer */}
      <div
        className="rounded-xl p-4 text-[11px] leading-relaxed"
        style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, color: T.inkMid }}
      >
        <strong>Resultado estimado</strong> conforme a la normativa foral vigente.
        Su declaraci\u00F3n definitiva puede variar en funci\u00F3n de su situaci\u00F3n particular.
        Para confirmar, utilice <strong>Rentaf\u00E1cil</strong> de la Hacienda Foral de \u00C1lava
        o consulte con un asesor fiscal.
      </div>
    </div>
  );
}
