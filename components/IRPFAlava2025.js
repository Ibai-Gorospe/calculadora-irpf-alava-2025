"use client";

import { useReducer, useMemo, useState, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// MOTOR FISCAL — NF 33/2013 + NF 19/2024 + NF 3/2025 — Álava 2025
// ═══════════════════════════════════════════════════════════════════════════════

const SS_PCT_INDEF   = 0.0648;  // Orden PJC/178/2025: CC 4,70 + Desempleo indef. 1,55 + FP 0,10 + MEI 0,13
const SS_PCT_TEMP    = 0.0653;  // idem + Desempleo temporal 1,60 (en lugar de 1,55)
const SS_BASE_MAX    = 58914;   // Orden PJC/178/2025: base máx. cotización 4.909,50 €/mes × 12
const COMP_M6        = 424.60;  // Art. 79.2 NF 19/2024: suplemento descendiente <6 años
const COMP_6A15      = 68.20;   // Art. 79.2 NF 19/2024: suplemento descendiente 6-15 años
const MINORACION = 1583;
const MINORACION_DESPOBLACION = 200; // Art. 77.2 NF 19/2024: municipios ≤500 hab.
const RED_CONJUNTA = 4800;
const SMI_2025 = 16576;
const DEDUC_EDAD_65 = 385;       // Art. 83 NF 33/2013 (NF 26/2023): >65 años
const DEDUC_EDAD_75 = 700;       // Art. 83 NF 33/2013 (NF 26/2023): >75 años
const DEDUC_ASCENDIENTE = 423.72; // Art. 81 NF 19/2024: por ascendiente conviviente
const DEDUC_DISCAP_CUOTA = { "33-65": 1025.64, "65+": 1464.54 }; // Art. 82 NF 19/2024

const DEDUC_HIJOS = [734.80, 909.70, 1532.30, 1811.70, 2366.10];

const ESCALA_GRAL = [
  [0,       17720,    0,        0.23],
  [17720,   35440,    4075.60,  0.28],
  [35440,   53160,    9037.20,  0.35],
  [53160,   75910,    15239.20, 0.40],
  [75910,   105130,   24339.20, 0.45],
  [105130,  140130,   37488.20, 0.46],
  [140130,  204270,   53588.20, 0.47],
  [204270,  Infinity, 83734.00, 0.49],
];

function calcSS(bruto, tipoContrato) {
  const pct = tipoContrato === "temporal" ? SS_PCT_TEMP : SS_PCT_INDEF;
  return +(Math.min(bruto, SS_BASE_MAX) * pct).toFixed(2);
}

function bonificacionArt23(dif, discapacidad = "ninguna", rentasNoLab = 0) {
  // Art. 23.2: si otras rentas > 7.500 € → bonificación fija en 3.000 €
  if (rentasNoLab > 7500) return 3000;
  let bonif;
  if (dif <= 0)          bonif = 0;
  else if (dif <= 14800) bonif = Math.min(8000, dif);
  else if (dif <= 23000) bonif = Math.max(0, 8000 - 0.6098 * (dif - 14800));
  else                   bonif = 3000;
  // Art. 23.3: incremento por discapacidad del trabajador activo
  if (discapacidad === "33-65") bonif *= 2;       // +100%
  else if (discapacidad === "65+") bonif *= 3.5;  // +250%
  return bonif;
}

function cuotaEscala(bl) {
  if (bl <= 0) return 0;
  for (let i = ESCALA_GRAL.length - 1; i >= 0; i--) {
    const [desde, , acum, tipo] = ESCALA_GRAL[i];
    if (bl >= desde) return +(acum + (bl - desde) * tipo).toFixed(2);
  }
  return 0;
}

function tipoMarginal(bl) {
  for (let i = ESCALA_GRAL.length - 1; i >= 0; i--)
    if (bl >= ESCALA_GRAL[i][0]) return ESCALA_GRAL[i][3];
  return 0.23;
}

function deducHijosTotal(num, hijosM6 = 0, hijos6a15 = 0) {
  const base = DEDUC_HIJOS.slice(0, Math.min(num, DEDUC_HIJOS.length)).reduce((a, b) => a + b, 0);
  return base + hijosM6 * COMP_M6 + hijos6a15 * COMP_6A15;
}

function deducViudedad(bi) {
  // Art. 82 bis NF 3/2025: deducción para contribuyentes viudos
  if (bi <= 20000) return 200;
  if (bi <= 30000) return Math.max(0, 200 - 0.02 * (bi - 20000));
  return 0;
}

// Art. 87 NF 33/2013 (mod. NF 3/2025): deducción por adquisición de vivienda habitual
function deducViviendaCompra(cantidadAnual, perfil = "general") {
  if (cantidadAnual <= 0) return 0;
  // general: 18%/1.530€ | municipio <4.000 hab: 20%/1.836€ | joven <36 / fam.num: 25%/2.346€
  const pct = perfil === "joven" ? 0.25 : perfil === "municipio" ? 0.20 : 0.18;
  const max = perfil === "joven" ? 2346 : perfil === "municipio" ? 1836 : 1530;
  return Math.min(+(cantidadAnual * pct).toFixed(2), max);
}

// Art. 86 NF 33/2013 (mod. NF 3/2025): deducción por alquiler de vivienda habitual
function deducAlquiler(alquilerAnual, perfil = "general") {
  if (alquilerAnual <= 0) return 0;
  // general: 20%/1.600€ | mejorado: 35%/2.800€ (<36, fam.num/monop, discap≥65%, depend., desp.)
  const pct = perfil === "mejorado" ? 0.35 : 0.20;
  const max = perfil === "mejorado" ? 2800 : 1600;
  return Math.min(+(alquilerAnual * pct).toFixed(2), max);
}

// Art. 83 NF 33/2013: deducción por edad (incompatible con Art. 82 bis viudedad)
function deducEdad(edad, bi) {
  if (!edad || edad === "menor65") return 0;
  const base = edad === "75+" ? DEDUC_EDAD_75 : DEDUC_EDAD_65;
  const coef = edad === "75+" ? 0.07 : 0.0385;
  if (bi <= 20000) return base;
  if (bi < 30000) return Math.max(0, +(base - coef * (bi - 20000)).toFixed(2));
  return 0;
}

// Art. 82 NF 19/2024: deducción por discapacidad/dependencia del contribuyente (cuota)
function deducDiscapCuota(discapacidad) {
  return DEDUC_DISCAP_CUOTA[discapacidad] || 0;
}

// Cálculo individual de una persona
function calcPersona({
  bruto, ret, redExtra, hijosShare,
  tipoContrato = "indefinido", rentasNoLab = 0, discapacidad = "ninguna",
  viudedad = false, cuidado = "ninguno", otrasDeducNF3 = 0,
  viviendaCompra = 0, viviendaPerfil = "general",
  alquilerAnual = 0, alquilerPerfil = "general",
  edad = "menor65", despoblacion = false, ascendientes = 0,
}) {
  const ss       = calcSS(bruto, tipoContrato);
  const dif      = Math.max(0, bruto - ss);
  const bonif    = bonificacionArt23(dif, discapacidad, rentasNoLab);
  const rnt      = Math.max(0, dif - bonif);
  const bi       = Math.max(0, rnt - redExtra);
  const bl       = bi; // sin conjunta
  const ci       = cuotaEscala(bl);
  const minTotal = MINORACION + (despoblacion ? MINORACION_DESPOBLACION : 0);
  const pm       = Math.max(0, ci - minTotal);
  const dedH     = +(hijosShare).toFixed(2);
  // Art. 82 bis y Art. 83 son incompatibles: se aplica la más beneficiosa
  const dedViudRaw  = viudedad ? deducViudedad(bi) : 0;
  const dedEdadRaw  = deducEdad(edad, bi);
  const dedViud  = viudedad && dedViudRaw >= dedEdadRaw ? dedViudRaw : 0;
  const dedEdad  = !viudedad || dedEdadRaw > dedViudRaw ? dedEdadRaw : 0;
  const dedDiscap = deducDiscapCuota(discapacidad);
  const dedCuid  = cuidado === "profesional" ? 500 : cuidado === "empleado_hogar" ? 250 : 0;
  const dedOtras = +otrasDeducNF3;
  const dedViv   = deducViviendaCompra(viviendaCompra, viviendaPerfil);
  const dedAlq   = deducAlquiler(alquilerAnual, alquilerPerfil);
  const dedAsc   = +(ascendientes * DEDUC_ASCENDIENTE).toFixed(2);
  const cl       = Math.max(0, pm - dedH - dedViud - dedEdad - dedDiscap - dedCuid - dedOtras - dedViv - dedAlq - dedAsc);
  const resultado = +(ret - cl).toFixed(2);
  const teReal   = bruto > 0 ? cl / bruto : 0;
  const teRet    = bruto > 0 ? ret / bruto : 0;
  return { bruto, ret, ss, dif, bonif, rnt, bi, bl, ci, minTotal, pm, dedH, dedViud, dedEdad, dedDiscap, dedCuid, dedOtras, dedViv, dedAlq, dedAsc, cl, resultado, teReal, teRet, redExtra };
}

// Cálculo declaración conjunta
function calcConjunta({
  brutoA, retA, redExtraA, brutoB, retB, redExtraB, hijosTotal,
  tipoContratoA = "indefinido", rentasNoLabA = 0, discapacidadA = "ninguna",
  viudedadA = false, cuidadoA = "ninguno", otrasDeducNF3A = 0,
  viviendaCompraA = 0, viviendaPerfilA = "general",
  alquilerAnualA = 0, alquilerPerfilA = "general",
  edadA = "menor65", despoblacionA = false, ascendientesA = 0,
  tipoContratoB = "indefinido", rentasNoLabB = 0, discapacidadB = "ninguna",
  viudedadB = false, cuidadoB = "ninguno", otrasDeducNF3B = 0,
  viviendaCompraB = 0, viviendaPerfilB = "general",
  alquilerAnualB = 0, alquilerPerfilB = "general",
  edadB = "menor65", despoblacionB = false, ascendientesB = 0,
}) {
  const ssA   = calcSS(brutoA, tipoContratoA);
  const ssB   = calcSS(brutoB, tipoContratoB);
  const difA  = Math.max(0, brutoA - ssA);
  const difB  = Math.max(0, brutoB - ssB);
  const bonA  = bonificacionArt23(difA, discapacidadA, rentasNoLabA);
  const bonB  = bonificacionArt23(difB, discapacidadB, rentasNoLabB);
  const rntA  = Math.max(0, difA - bonA);
  const rntB  = Math.max(0, difB - bonB);
  const biSum = Math.max(0, rntA + rntB - redExtraA - redExtraB);
  const bl    = Math.max(0, biSum - RED_CONJUNTA);
  const ci    = cuotaEscala(bl);
  // Minoración: 1 sola + despoblación si aplica a alguno
  const minDesp = (despoblacionA || despoblacionB) ? MINORACION_DESPOBLACION : 0;
  const minTotal = MINORACION + minDesp;
  const pm    = Math.max(0, ci - minTotal);
  const dedH  = hijosTotal;
  // Deducciones personales: se calculan sobre BI individual aproximado
  const biA      = Math.max(0, rntA - redExtraA);
  const biB      = Math.max(0, rntB - redExtraB);
  // Art. 82 bis (viudedad) y Art. 83 (edad) son incompatibles: se aplica la más beneficiosa por persona
  const dedViudRawA = viudedadA ? deducViudedad(biA) : 0;
  const dedEdadRawA = deducEdad(edadA, biA);
  const dedViudA = viudedadA && dedViudRawA >= dedEdadRawA ? dedViudRawA : 0;
  const dedEdadA = !viudedadA || dedEdadRawA > dedViudRawA ? dedEdadRawA : 0;
  const dedViudRawB = viudedadB ? deducViudedad(biB) : 0;
  const dedEdadRawB = deducEdad(edadB, biB);
  const dedViudB = viudedadB && dedViudRawB >= dedEdadRawB ? dedViudRawB : 0;
  const dedEdadB = !viudedadB || dedEdadRawB > dedViudRawB ? dedEdadRawB : 0;
  const dedViud  = dedViudA + dedViudB;
  const dedEdad  = dedEdadA + dedEdadB;
  const dedDiscap = deducDiscapCuota(discapacidadA) + deducDiscapCuota(discapacidadB);
  const dedCuid  = (cuidadoA === "profesional" ? 500 : cuidadoA === "empleado_hogar" ? 250 : 0)
                 + (cuidadoB === "profesional" ? 500 : cuidadoB === "empleado_hogar" ? 250 : 0);
  const dedOtras = +otrasDeducNF3A + +otrasDeducNF3B;
  const dedViv   = deducViviendaCompra(viviendaCompraA, viviendaPerfilA) + deducViviendaCompra(viviendaCompraB, viviendaPerfilB);
  const dedAlq   = deducAlquiler(alquilerAnualA, alquilerPerfilA) + deducAlquiler(alquilerAnualB, alquilerPerfilB);
  const dedAsc   = +((ascendientesA + ascendientesB) * DEDUC_ASCENDIENTE).toFixed(2);
  const cl    = Math.max(0, pm - dedH - dedViud - dedEdad - dedDiscap - dedCuid - dedOtras - dedViv - dedAlq - dedAsc);
  const retTotal = retA + retB;
  const resultado = +(retTotal - cl).toFixed(2);
  const teReal = (brutoA + brutoB) > 0 ? cl / (brutoA + brutoB) : 0;
  return {
    brutoA, brutoB, ssA, ssB, difA, difB, bonA, bonB, rntA, rntB,
    biSum, bl, ci, minTotal, pm, dedH, dedViud, dedEdad, dedDiscap, dedCuid, dedOtras, dedViv, dedAlq, dedAsc, cl, resultado, retTotal, teReal,
    redExtraA, redExtraB,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REDUCER + ESTADO
// ═══════════════════════════════════════════════════════════════════════════════

const personInit = {
  bruto: "", ret: "", redExtra: "",
  tipoContrato: "indefinido", rentasNoLab: "", discapacidad: "ninguna",
  viudedad: false, cuidado: "ninguno", otrasDeducNF3: "",
  viviendaCompra: "", viviendaPerfil: "general",
  alquilerAnual: "", alquilerPerfil: "general",
  edad: "menor65", despoblacion: false, ascendientes: 0,
};

const initialState = {
  personA: { ...personInit },
  personB: { ...personInit },
  hijos: 0,
  hijosM6: 0,
  hijos6a15: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_A": return { ...state, personA: { ...state.personA, [action.field]: action.value } };
    case "SET_B": return { ...state, personB: { ...state.personB, [action.field]: action.value } };
    case "SET_HIJOS": return {
      ...state, hijos: action.value,
      hijosM6: Math.min(state.hijosM6, action.value),
      hijos6a15: Math.min(state.hijos6a15, action.value),
    };
    case "SET_HIJOS_M6":   return { ...state, hijosM6: action.value };
    case "SET_HIJOS_6A15": return { ...state, hijos6a15: action.value };
    case "RESET_B": return { ...state, personB: { ...personInit } };
    case "RESET": return initialState;
    default: return state;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const n = (s) => { const v = parseFloat(String(s).replace(/\./g, "").replace(",", ".")); return isNaN(v) ? 0 : v; };
const eur = (x, abs = false) => new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(abs ? Math.abs(x) : x) + " €";
const pct = (x) => (x * 100).toFixed(1) + "%";
const sign = (x) => x >= 0 ? "+" : "−";
const signedEur = (x) => sign(x) + eur(Math.abs(x));

// ═══════════════════════════════════════════════════════════════════════════════
// TOKENS DE DISEÑO
// ═══════════════════════════════════════════════════════════════════════════════

const T = {
  // Palette — elegante light con acentos oscuros
  bg:         "#F7F5F0",      // warm off-white
  surface:    "#FFFFFF",
  surfaceAlt: "#F2EFE9",
  border:     "#E3DDD4",
  borderSoft: "#EDE9E2",

  // Texto
  ink:        "#1A1714",
  inkMid:     "#4A4642",
  inkFaint:   "#9A9490",

  // Acentos
  cobalt:     "#1B3F6E",      // persona A
  cobaltL:    "#E8EEF6",
  teal:       "#0D6B5E",      // persona B
  tealL:      "#E4F2F0",
  gold:       "#8B6400",      // conjunta / neutral
  goldL:      "#FDF3D8",
  goldAcc:    "#D4A017",

  // Semáforo
  green:      "#1A6B3A",
  greenL:     "#E4F5EC",
  greenAcc:   "#2CA85A",
  red:        "#8B1F1F",
  redL:       "#FBEAEA",
  redAcc:     "#D94040",

  // Tipografía
  fontMono:   "'Courier Prime', 'Courier New', monospace",
  fontSans:   "'Literata', Georgia, serif",
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTES BASE
// ═══════════════════════════════════════════════════════════════════════════════

function Tooltip({ text, children }) {
  const [vis, setVis] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      {children}
      <button
        onMouseEnter={() => setVis(true)}
        onMouseLeave={() => setVis(false)}
        style={{ background: "none", border: "none", cursor: "help", color: T.inkFaint, fontSize: 11, padding: "0 2px", lineHeight: 1 }}
      >ⓘ</button>
      {vis && (
        <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: T.ink, color: "#fff", fontSize: 11, lineHeight: 1.5, padding: "8px 12px", borderRadius: 8, width: 220, zIndex: 100, pointerEvents: "none" }}>
          {text}
        </div>
      )}
    </span>
  );
}

function NumInput({ label, value, onChange, hint, tooltipText, accent = T.cobalt, accentLight = T.cobaltL }) {
  const [focus, setFocus] = useState(false);
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: focus ? accent : T.inkMid, marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>
        {label}
        {tooltipText && <Tooltip text={tooltipText}><span /></Tooltip>}
      </div>
      <input
        type="text" inputMode="decimal" value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={e => { setFocus(true); e.target.select(); }}
        onBlur={() => setFocus(false)}
        placeholder="0,00 €"
        style={{
          width: "100%", boxSizing: "border-box",
          background: focus ? accentLight : T.surface,
          border: `1.5px solid ${focus ? accent : T.border}`,
          borderRadius: 8, padding: "10px 14px",
          fontSize: 17, fontFamily: T.fontMono,
          color: T.ink, outline: "none", transition: "all .15s",
        }}
      />
      {hint && <div style={{ fontSize: 10, color: T.inkFaint, marginTop: 4 }}>{hint}</div>}
    </label>
  );
}

function HijosSelector({ value, onChange, hijosM6, onChangeM6, hijos6a15, onChangej6a15, soloMode = false }) {
  const dedBase   = deducHijosTotal(value, 0, 0);
  const dedTotal  = deducHijosTotal(value, hijosM6, hijos6a15);
  const compExtra = dedTotal - dedBase;

  const AgeCounter = ({ label, val, onChange: onChg, max, tooltipText }) => (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.inkMid, marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>
        {label}
        {tooltipText && <Tooltip text={tooltipText}><span /></Tooltip>}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {Array.from({ length: max + 1 }, (_, i) => (
          <button key={i} onClick={() => onChg(i)} style={{
            flex: 1, padding: "7px 0", fontSize: 14, fontWeight: 700,
            background: val === i ? T.gold : T.surface,
            color: val === i ? "#fff" : T.inkMid,
            border: `1.5px solid ${val === i ? T.goldAcc : T.border}`,
            borderRadius: 6, cursor: "pointer", fontFamily: T.fontMono, transition: "all .15s",
          }}>{i === 0 ? "—" : i}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.inkMid, marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
        Hijos en común
        <Tooltip text="Descendientes convivientes con rentas ≤ SMI (16.576 €/año) y edad < 30 años. Art. 79 NF 33/2013."><span /></Tooltip>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <button
            key={i}
            onClick={() => onChange(i)}
            style={{
              flex: 1, padding: "10px 0", fontSize: 16, fontWeight: 700,
              background: value === i ? T.gold : T.surface,
              color: value === i ? "#fff" : T.inkMid,
              border: `1.5px solid ${value === i ? T.goldAcc : T.border}`,
              borderRadius: 8, cursor: "pointer", fontFamily: T.fontMono,
              transition: "all .15s",
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
            val={hijosM6} onChange={v => onChangeM6(v)} max={value}
            tooltipText={`+${eur(COMP_M6)} por cada hijo menor de 6 años. Art. 79.2 NF 19/2024.`}
          />
          <AgeCounter
            label="De 6 a 15 años"
            val={hijos6a15} onChange={v => onChangej6a15(v)} max={value - hijosM6}
            tooltipText={`+${eur(COMP_6A15)} por cada hijo de 6 a 15 años. Art. 79.2 NF 19/2024.`}
          />
          <div style={{ marginTop: 10, background: T.goldL, border: `1px solid ${T.goldAcc}44`, borderRadius: 8, padding: "10px 12px", fontSize: 11, color: T.gold, lineHeight: 1.7 }}>
            <div style={{ fontWeight: 700 }}>Deducción base: {eur(dedBase)}{compExtra > 0 ? ` + ${eur(compExtra)} (suplemento edad)` : ""}</div>
            <div style={{ fontWeight: 700 }}>Total: {eur(dedTotal)}</div>
            {soloMode ? (
              <div>Individual (100%): {eur(dedTotal)}</div>
            ) : (
              <>
                <div>Individual (50% c/u): {eur(dedTotal / 2)} por progenitor</div>
                <div>Conjunta (100%): {eur(dedTotal)} completa</div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PANEL DE INPUTS DE PERSONA
// ═══════════════════════════════════════════════════════════════════════════════

function PersonaInputs({ label, letter, accent, accentLight, data, dispatch, actionType }) {
  const [expanded, setExpanded] = useState(false);
  const set = (field, value) => dispatch({ type: actionType, field, value });

  const SmallSelector = ({ lbl, value: val, onChange, options, tooltipText }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.inkMid, marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>
        {lbl}{tooltipText && <Tooltip text={tooltipText}><span /></Tooltip>}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {options.map(opt => (
          <button key={opt.value} onClick={() => onChange(opt.value)} style={{
            flex: 1, padding: "7px 4px", fontSize: 10, fontWeight: 600,
            background: val === opt.value ? accent : T.surface,
            color: val === opt.value ? "#fff" : T.inkMid,
            border: `1.5px solid ${val === opt.value ? accent : T.border}`,
            borderRadius: 6, cursor: "pointer", fontFamily: T.fontSans,
            transition: "all .15s", lineHeight: 1.3,
          }}>{opt.label}</button>
        ))}
      </div>
    </div>
  );

  const hasExtras = data.rentasNoLab || data.discapacidad !== "ninguna" || data.viudedad
    || data.cuidado !== "ninguno" || data.otrasDeducNF3
    || data.viviendaCompra || data.alquilerAnual
    || data.edad !== "menor65" || data.despoblacion || data.ascendientes > 0;

  return (
    <div style={{
      background: T.surface, border: `1.5px solid ${T.border}`,
      borderTop: `3px solid ${accent}`, borderRadius: 12, padding: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: accentLight, border: `2px solid ${accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: accent, fontFamily: T.fontMono }}>
          {letter}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{label}</div>
          <div style={{ fontSize: 11, color: T.inkFaint }}>Rendimientos del trabajo · Art. 15 NF 33/2013</div>
        </div>
      </div>
      <NumInput
        label="Retribución bruta anual"
        value={data.bruto}
        onChange={v => set("bruto", v)}
        hint="Total antes de retenciones y cotizaciones SS"
        tooltipText="Suma de nóminas brutas del año 2025, incluyendo pagas extra, complementos y cualquier otra retribución dineraria del trabajo."
        accent={accent} accentLight={accentLight}
      />
      <NumInput
        label="Retenciones IRPF practicadas"
        value={data.ret}
        onChange={v => set("ret", v)}
        hint="Figura en el certificado de retenciones del pagador"
        tooltipText="Importe total retenido por la empresa durante 2025 a cuenta del IRPF. Aparece en el certificado de retenciones que debe entregarte el pagador."
        accent={accent} accentLight={accentLight}
      />
      <NumInput
        label="Otras reducciones de base (opcional)"
        value={data.redExtra}
        onChange={v => set("redExtra", v)}
        hint="Aportaciones a planes de pensiones, EPSV, etc."
        tooltipText="Aportaciones a planes de pensiones, EPSV u otros sistemas de previsión social. Límite general 2025: 5.000 € individuales + 8.000 € empresariales (art. 70-72 NF 33/2013)."
        accent={accent} accentLight={accentLight}
      />

      {/* Tipo de contrato — siempre visible, afecta a cotización SS */}
      <SmallSelector
        lbl="Tipo de contrato"
        value={data.tipoContrato}
        onChange={v => set("tipoContrato", v)}
        options={[
          { value: "indefinido", label: "Indefinido (6,48%)" },
          { value: "temporal",   label: "Temporal (6,53%)" },
        ]}
        tooltipText="Afecta al tipo de cotización SS. Indefinido: 6,48% (4,70+1,55+0,10+0,13 MEI). Temporal: 6,53% (4,70+1,60+0,10+0,13 MEI). Orden PJC/178/2025. Tope base: 58.914 €/año."
      />

      {/* Deducciones adicionales — colapsables */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%", marginTop: 4, padding: "8px 12px",
          background: hasExtras ? accentLight : T.surfaceAlt,
          border: `1px solid ${hasExtras ? accent + "44" : T.borderSoft}`,
          borderRadius: 8, cursor: "pointer", fontSize: 11,
          color: hasExtras ? accent : T.inkMid,
          fontFamily: T.fontSans, fontWeight: hasExtras ? 700 : 400,
          textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center",
          transition: "all .15s",
        }}
      >
        <span>Deducciones adicionales y vivienda{hasExtras ? " ✓" : ""}</span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>{expanded ? "▴" : "▾"}</span>
      </button>

      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.borderSoft}` }}>
          <NumInput
            label="Otras rentas no laborales (art. 23.2)"
            value={data.rentasNoLab}
            onChange={v => set("rentasNoLab", v)}
            hint="Si supera 7.500 €, la bonificación del trabajo queda fija en 3.000 €"
            tooltipText="Rendimientos del capital inmobiliario/mobiliario, ganancias patrimoniales, etc. Si el total supera 7.500 €, la bonificación del art. 23 se limita a 3.000 € (art. 23.2 NF 33/2013)."
            accent={accent} accentLight={accentLight}
          />
          <SmallSelector
            lbl="Discapacidad reconocida (arts. 23.3 + 82)"
            value={data.discapacidad}
            onChange={v => set("discapacidad", v)}
            options={[
              { value: "ninguna", label: "Sin discapacidad" },
              { value: "33-65",   label: "≥33% y <65%" },
              { value: "65+",     label: "≥65% / mov. reducida" },
            ]}
            tooltipText="Doble efecto: 1) Art. 23.3: incrementa bonificación del trabajo (+100% o +250%). 2) Art. 82 NF 19/2024: deducción de cuota de 1.025,64 € (33-65%) o 1.464,54 € (≥65%). Grados superiores (Grado II/III) consultar asesor."
          />
          <SmallSelector
            lbl="Edad del contribuyente (art. 83)"
            value={data.edad}
            onChange={v => set("edad", v)}
            options={[
              { value: "menor65", label: "Menor de 65" },
              { value: "65-74",   label: "65-74 (385 €)" },
              { value: "75+",     label: "75+ (700 €)" },
            ]}
            tooltipText="Deducción por edad: 385 € (>65) o 700 € (>75), BI ≤ 20.000 €, fase-out hasta 30.000 €. Incompatible con deducción viudedad: se aplica la más beneficiosa. Art. 83 NF 33/2013."
          />
          <SmallSelector
            lbl="Viudedad (art. 82 bis NF 3/2025)"
            value={data.viudedad ? "si" : "no"}
            onChange={v => set("viudedad", v === "si")}
            options={[
              { value: "no", label: "No aplica" },
              { value: "si", label: "Viudo/a (hasta 200 €)" },
            ]}
            tooltipText="Deducción de 200 € para contribuyentes viudos con BI ≤ 20.000 €, fase-out hasta 30.000 €. Incompatible con deducción por edad (art. 83): se aplica automáticamente la más beneficiosa."
          />
          {data.viudedad && data.edad !== "menor65" && (
            <div style={{ fontSize: 10, color: T.gold, padding: "2px 0 8px", lineHeight: 1.5 }}>
              Viudedad y edad son incompatibles (art. 82 bis / art. 83). Se aplica automáticamente la más beneficiosa.
            </div>
          )}
          <SmallSelector
            lbl="Municipio (art. 77.2 despoblación)"
            value={data.despoblacion ? "si" : "no"}
            onChange={v => set("despoblacion", v === "si")}
            options={[
              { value: "no", label: "Normal" },
              { value: "si", label: "≤500 hab. (+200 €)" },
            ]}
            tooltipText="Minoración adicional de 200 € por residir en municipio con ≤ 500 habitantes. Art. 77.2 NF 19/2024."
          />
          <SmallSelector
            lbl="Ascendientes convivientes (art. 81)"
            value={String(data.ascendientes)}
            onChange={v => set("ascendientes", parseInt(v) || 0)}
            options={[
              { value: "0", label: "Ninguno" },
              { value: "1", label: "1 (423,72 €)" },
              { value: "2", label: "2 (847,44 €)" },
            ]}
            tooltipText="423,72 € por ascendiente que conviva permanentemente con el contribuyente, con rentas ≤ SMI (16.576 €) y que no presente declaración propia. Art. 81 NF 33/2013 (mod. NF 19/2024)."
          />
          <SmallSelector
            lbl="Cuidado menores/dependientes (art. 81 ter)"
            value={data.cuidado}
            onChange={v => set("cuidado", v)}
            options={[
              { value: "ninguno",        label: "No aplica" },
              { value: "empleado_hogar", label: "Empleado hogar (250 €)" },
              { value: "profesional",    label: "Profesional cert. (500 €)" },
            ]}
            tooltipText="Por contratar a un empleado del hogar para el cuidado de hijos <12 años o familiares dependientes/discapacitados. 250 € (general) o 500 € si el cuidador es profesional certificado. Art. 81 ter NF 3/2025."
          />
          <NumInput
            label="Otras deducciones NF 3/2025 (arts. 83 bis/ter)"
            value={data.otrasDeducNF3}
            onChange={v => set("otrasDeducNF3", v)}
            hint="Corresponsabilidad masculina (≤200 €) / Reincorporación femenina (≤1.500 €)"
            tooltipText="Art. 83 bis: hasta 200 €/año para hombres que reducen su jornada para cuidar hijos <4 años. Art. 83 ter: hasta 1.500 €/año (2.250 € si parto/adopción múltiple) para mujeres que se reincorporan al trabajo."
            accent={accent} accentLight={accentLight}
          />

          {/* Vivienda habitual */}
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.borderSoft}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.inkFaint, marginBottom: 8 }}>
              Vivienda habitual
            </div>
            <NumInput
              label="Pagos hipoteca anual (art. 87)"
              value={data.viviendaCompra}
              onChange={v => set("viviendaCompra", v)}
              hint="Amortización + intereses anuales"
              tooltipText="Deducción por adquisición de vivienda habitual. General: 18% (máx. 1.530 €). Mun. <4.000 hab.: 20% (máx. 1.836 €). <36 años / fam. num.: 25% (máx. 2.346 €). Art. 87 NF 33/2013 (mod. NF 3/2025)."
              accent={accent} accentLight={accentLight}
            />
            <SmallSelector
              lbl="Perfil vivienda compra (art. 87)"
              value={data.viviendaPerfil}
              onChange={v => set("viviendaPerfil", v)}
              options={[
                { value: "general",   label: "General (18%, 1.530 €)" },
                { value: "municipio", label: "Mun. <4.000 (20%, 1.836 €)" },
                { value: "joven",     label: "<36 / Fam.num (25%, 2.346 €)" },
              ]}
              tooltipText="General: 18%/1.530 €. Municipio <4.000 hab.: 20%/1.836 €. Menores de 36 años y familias numerosas: 25%/2.346 €. Art. 87 NF 33/2013 (mod. NF 3/2025)."
            />
            <NumInput
              label="Alquiler vivienda habitual (art. 86)"
              value={data.alquilerAnual}
              onChange={v => set("alquilerAnual", v)}
              hint="Importe total del alquiler pagado en el año"
              tooltipText="Deducción por alquiler de vivienda habitual. General: 20% (máx. 1.600 €). Mejorado: 35% (máx. 2.800 €). Art. 86 NF 33/2013 (mod. NF 3/2025)."
              accent={accent} accentLight={accentLight}
            />
            <SmallSelector
              lbl="Perfil alquiler (art. 86)"
              value={data.alquilerPerfil}
              onChange={v => set("alquilerPerfil", v)}
              options={[
                { value: "general",  label: "General (20%, 1.600 €)" },
                { value: "mejorado", label: "Mejorado (35%, 2.800 €)" },
              ]}
              tooltipText="Perfil mejorado (35%/2.800 €) para: menores de 36 años, familias numerosas o monoparentales, discapacidad ≥65%, dependencia, víctimas violencia de género, o municipios en riesgo de despoblación. Art. 86 NF 33/2013 (mod. NF 3/2025)."
            />
            {data.viviendaCompra && data.alquilerAnual && (
              <div style={{ fontSize: 10, color: T.red, padding: "4px 0" }}>
                Normalmente no se aplican ambas deducciones simultáneamente (compra + alquiler)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WATERFALL CHART — Desglose visual paso a paso
// ═══════════════════════════════════════════════════════════════════════════════

function WaterfallRow({ label, value, type, note, isLast }) {
  // type: 'start' | 'minus' | 'plus' | 'total' | 'result'
  const colors = {
    start:  { bar: T.cobalt,   bg: T.cobaltL,  text: T.cobalt },
    minus:  { bar: T.redAcc,   bg: T.redL,     text: T.red },
    plus:   { bar: T.greenAcc, bg: T.greenL,   text: T.green },
    total:  { bar: T.ink,      bg: T.surfaceAlt, text: T.ink },
    result: { bar: value >= 0 ? T.greenAcc : T.redAcc, bg: value >= 0 ? T.greenL : T.redL, text: value >= 0 ? T.green : T.red },
  };
  const c = colors[type] || colors.total;
  const absVal = Math.abs(value);
  const maxForBar = 60000; // normalize bar width
  const barWidth = Math.min(95, (absVal / maxForBar) * 95);

  return (
    <div style={{ paddingBottom: isLast ? 0 : 8, marginBottom: isLast ? 0 : 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Indicador */}
        <div style={{ width: 20, textAlign: "center", fontSize: 13, flexShrink: 0 }}>
          {type === "minus" ? <span style={{ color: T.redAcc }}>−</span>
           : type === "plus" ? <span style={{ color: T.greenAcc }}>+</span>
           : type === "result" ? <span style={{ color: c.text, fontWeight: 700 }}>=</span>
           : <span style={{ color: T.inkFaint }}>·</span>}
        </div>
        {/* Etiqueta */}
        <div style={{ flex: 1, fontSize: 12, color: type === "total" || type === "result" ? T.ink : T.inkMid, fontWeight: type === "total" || type === "result" ? 700 : 400 }}>
          {label}
          {note && <div style={{ fontSize: 10, color: T.inkFaint, marginTop: 1 }}>{note}</div>}
        </div>
        {/* Valor */}
        <div style={{ fontSize: 13, fontFamily: T.fontMono, fontWeight: type === "total" || type === "result" ? 800 : 500, color: c.text, minWidth: 100, textAlign: "right" }}>
          {type === "minus" ? "−" + eur(absVal) : type === "plus" ? "+" + eur(absVal) : eur(value)}
        </div>
      </div>
      {/* Barra */}
      {type !== "result" && (
        <div style={{ marginLeft: 30, marginTop: 4, height: 5, background: T.borderSoft, borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${barWidth}%`, background: c.bar, borderRadius: 3, transition: "width .4s ease" }} />
        </div>
      )}
    </div>
  );
}

function WaterfallDesglose({ data, label, accent }) {
  const [open, setOpen] = useState(false);
  if (!data) return null;
  const resultColor = data.resultado >= 0 ? T.green : T.red;

  return (
    <div style={{ border: `1.5px solid ${T.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 8 }}>
      {/* Header clickable */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", background: open ? T.surfaceAlt : T.surface, border: "none", cursor: "pointer", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}
      >
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: accent }}>{label}</div>
          <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 2 }}>
            Cuota líquida: {eur(data.cl)} · Tipo efectivo: {pct(data.teReal ?? 0)}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: T.inkFaint }}>{data.resultado >= 0 ? "A devolver" : "A ingresar"}</div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: T.fontMono, color: resultColor }}>
              {signedEur(data.resultado)}
            </div>
          </div>
          <div style={{ fontSize: 16, color: T.inkFaint, transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }}>▾</div>
        </div>
      </button>

      {/* Desglose */}
      {open && (
        <div style={{ padding: "16px 18px", borderTop: `1px solid ${T.borderSoft}`, background: T.surface }}>
          <WaterfallRow label="Retribución bruta" value={data.bruto ?? data.brutoA + data.brutoB} type="start" />
          <WaterfallRow label="Cotizaciones Seg. Social" value={data.ss ?? data.ssA + data.ssB} type="minus" note="Art. 22 NF 33/2013 · Orden PJC/178/2025 · tope base 58.914 €/año" />
          <WaterfallRow label="Bonificación rendimiento trabajo (art. 23)" value={data.bonif ?? data.bonA + data.bonB} type="minus" note={
            (data.dif ?? data.difA) <= 14800 ? "Tramo máximo (≤ 14.800 €): 8.000 €" :
            (data.dif ?? data.difA) <= 23000 ? "Tramo decreciente (14.800–23.000 €)" : "Tramo mínimo (> 23.000 €): 3.000 €"
          } />
          <WaterfallRow label="Rendimiento neto del trabajo" value={data.rnt ?? data.rntA + data.rntB} type="total" />
          {(data.redExtra ?? (data.redExtraA + data.redExtraB)) > 0 && (
            <WaterfallRow label="Otras reducciones de base (PP, EPSV…)" value={data.redExtra ?? (data.redExtraA + data.redExtraB)} type="minus" note="Arts. 70-72 NF 33/2013" />
          )}
          {data.bl !== undefined && data.bl !== (data.rnt - (data.redExtra ?? 0)) && (
            <WaterfallRow label="Reducción tributación conjunta" value={RED_CONJUNTA} type="minus" note="Art. 73 NF 3/2025 — exclusiva de la declaración conjunta" />
          )}
          <WaterfallRow label="Base liquidable general" value={data.bl ?? data.biSum - RED_CONJUNTA} type="total" />
          <WaterfallRow label="Cuota íntegra (escala art. 75)" value={data.ci} type="total"
            note={`Tipo marginal: ${pct(tipoMarginal(data.bl ?? data.biSum - RED_CONJUNTA))} · 8 tramos 23%–49%`} />
          <WaterfallRow label="Minoración de cuota (art. 77)" value={data.minTotal ?? MINORACION} type="minus" note={`${eur(MINORACION)} general${(data.minTotal ?? MINORACION) > MINORACION ? ` + ${eur(MINORACION_DESPOBLACION)} despoblación (art. 77.2)` : ""} · ${data.redConj !== undefined ? "1 en conjunta" : "1 por declaración"}`} />
          {data.dedH > 0 && (
            <WaterfallRow label="Deducción descendientes (art. 79)" value={data.dedH} type="minus" note={data.bl !== undefined && data.redConj !== undefined ? "100% en conjunta" : "50% por progenitor"} />
          )}
          {(data.dedViud ?? 0) > 0 && (
            <WaterfallRow label="Deducción viudedad (art. 82 bis NF 3/2025)" value={data.dedViud} type="minus" />
          )}
          {(data.dedEdad ?? 0) > 0 && (
            <WaterfallRow label="Deducción por edad (art. 83)" value={data.dedEdad} type="minus" />
          )}
          {(data.dedDiscap ?? 0) > 0 && (
            <WaterfallRow label="Deducción discapacidad contribuyente (art. 82)" value={data.dedDiscap} type="minus" />
          )}
          {(data.dedCuid ?? 0) > 0 && (
            <WaterfallRow label="Deducción cuidado menores/dependientes (art. 81 ter NF 3/2025)" value={data.dedCuid} type="minus" />
          )}
          {(data.dedAsc ?? 0) > 0 && (
            <WaterfallRow label="Deducción ascendientes (art. 81)" value={data.dedAsc} type="minus" />
          )}
          {(data.dedOtras ?? 0) > 0 && (
            <WaterfallRow label="Otras deducciones NF 3/2025 (arts. 83 bis/ter)" value={data.dedOtras} type="minus" />
          )}
          {(data.dedViv ?? 0) > 0 && (
            <WaterfallRow label="Deducción vivienda habitual (art. 87)" value={data.dedViv} type="minus" />
          )}
          {(data.dedAlq ?? 0) > 0 && (
            <WaterfallRow label="Deducción alquiler vivienda (art. 86)" value={data.dedAlq} type="minus" />
          )}
          <WaterfallRow label="CUOTA LÍQUIDA (IRPF a pagar)" value={data.cl} type="total" />
          <div style={{ height: 12 }} />
          <WaterfallRow label="Retenciones practicadas" value={data.ret ?? data.retTotal} type="start" />
          <WaterfallRow label="Cuota líquida" value={data.cl} type="minus" note="IRPF real correspondiente al ejercicio 2025" />
          <WaterfallRow label={data.resultado >= 0 ? "✓ RESULTADO: A devolver" : "✗ RESULTADO: A ingresar"} value={data.resultado} type="result" />

          {/* Métricas secundarias */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 16 }}>
            {[
              ["Tipo efectivo real", pct(data.teReal ?? 0)],
              ["% retención aplicada", pct(data.teRet ?? ((data.ret ?? data.retTotal) / (data.bruto ?? data.brutoA + data.brutoB)))],
              ["Neto fiscal (bruto − SS − CL)", eur((data.bruto ?? data.brutoA + data.brutoB) - (data.ss ?? data.ssA + data.ssB) - data.cl)],
            ].map(([k, v]) => (
              <div key={k} style={{ background: T.surfaceAlt, borderRadius: 8, padding: "10px 12px", border: `1px solid ${T.borderSoft}` }}>
                <div style={{ fontSize: 9, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{k}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: T.fontMono, color: T.ink }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENARIO CARD — Resumen por opción
// ═══════════════════════════════════════════════════════════════════════════════

function ScenarioCard({ sc, rank, totalOpciones }) {
  const isOptimo  = rank === 0;
  const isSecond  = rank === 1;
  const isPeor    = rank === totalOpciones - 1;
  const resColor  = sc.resultado >= 0 ? T.green : T.red;
  const resBg     = sc.resultado >= 0 ? T.greenL : T.redL;

  return (
    <div style={{
      position: "relative",
      background: isOptimo ? T.greenL : T.surface,
      border: `2px solid ${isOptimo ? T.greenAcc : isPeor && totalOpciones > 2 ? T.redAcc + "55" : T.border}`,
      borderRadius: 14, padding: "20px 18px",
      transition: "box-shadow .15s, transform .15s",
      boxShadow: isOptimo ? `0 4px 20px ${T.greenAcc}25` : "0 1px 4px rgba(0,0,0,.05)",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = isOptimo ? `0 4px 20px ${T.greenAcc}25` : "0 1px 4px rgba(0,0,0,.05)"; e.currentTarget.style.transform = "none"; }}
    >
      {/* Badge superior */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: sc.accentColor, background: sc.accentColor + "18", border: `1px solid ${sc.accentColor}33`, borderRadius: 20, padding: "2px 10px" }}>
          {sc.modalidad}
        </span>
        {isOptimo && (
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#fff", background: T.greenAcc, borderRadius: 20, padding: "3px 10px" }}>
            ★ ÓPTIMO
          </span>
        )}
        {isPeor && totalOpciones > 2 && (
          <span style={{ fontSize: 9, fontWeight: 700, color: T.red, background: T.redL, border: `1px solid ${T.redAcc}44`, borderRadius: 20, padding: "3px 10px" }}>
            EVITAR
          </span>
        )}
      </div>

      {/* Título */}
      <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 4 }}>{sc.label}</div>
      <div style={{ fontSize: 11, color: T.inkMid, marginBottom: 16, lineHeight: 1.5 }}>{sc.sublabel}</div>

      {/* Resultado grande */}
      <div style={{ background: resBg, border: `1px solid ${resColor}33`, borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: T.inkFaint, marginBottom: 2 }}>
          {sc.resultado >= 0 ? "Hacienda devuelve ↑" : "A pagar a Hacienda ↓"}
        </div>
        <div style={{ fontSize: 30, fontWeight: 900, fontFamily: T.fontMono, color: resColor, letterSpacing: "-0.02em" }}>
          {signedEur(sc.resultado)}
        </div>
      </div>

      {/* Ranking visual */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.inkFaint }}>
        <span style={{ fontSize: 16 }}>{["🥇","🥈","🥉","4º","5º","6º","7º"][rank]}</span>
        <span>Puesto {rank + 1} de {totalOpciones}</span>
      </div>

      {/* Warning */}
      {sc.warning && (
        <div style={{ marginTop: 12, background: "#FEF3C7", border: "1px solid #FCD34D44", borderRadius: 8, padding: "8px 10px", fontSize: 10, color: "#92400E", lineHeight: 1.5 }}>
          ⚠ {sc.warning}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TABLA COMPARATIVA LADO A LADO
// ═══════════════════════════════════════════════════════════════════════════════

function TablaComparativa({ scenarios }) {
  if (!scenarios?.length) return null;
  const sorted = [...scenarios].sort((a, b) => b.resultado - a.resultado);
  const best = sorted[0].resultado;

  const rows = [
    { label: "Bruto total",          key: "brutoTotal",   fmt: eur },
    { label: "− Cotiz. SS",          key: "ssTotal",      fmt: v => "−" + eur(v) },
    { label: "− Bonif. art. 23",     key: "bonifTotal",   fmt: v => "−" + eur(v), color: T.teal },
    { label: "Rendimiento neto",     key: "rntTotal",     fmt: eur, bold: true },
    { label: "− Otras reducciones",  key: "redTotal",     fmt: v => v > 0 ? "−" + eur(v) : "—", color: T.teal },
    { label: "− Red. conjunta",      key: "redConj",      fmt: v => v > 0 ? "−" + eur(v) : "—", color: T.teal },
    { label: "Base liquidable",      key: "bl",           fmt: eur, bold: true },
    { label: "Cuota íntegra",        key: "ci",           fmt: eur },
    { label: "− Minoración(es)",     key: "minoracion",   fmt: v => "−" + eur(v), color: T.teal },
    { label: "− Deducc. hijos",            key: "dedH",      fmt: v => v > 0 ? "−" + eur(v) : "—", color: T.teal },
    { label: "− Deducc. viudedad",        key: "dedViud",   fmt: v => v > 0 ? "−" + eur(v) : "—", color: T.teal },
    { label: "− Deducc. edad (art. 83)",  key: "dedEdad",   fmt: v => v > 0 ? "−" + eur(v) : "—", color: T.teal },
    { label: "− Deducc. discapac. (art. 82)", key: "dedDiscap", fmt: v => v > 0 ? "−" + eur(v) : "—", color: T.teal },
    { label: "− Deducc. cuidado",         key: "dedCuid",   fmt: v => v > 0 ? "−" + eur(v) : "—", color: T.teal },
    { label: "− Deducc. ascend. (art. 81)", key: "dedAsc",  fmt: v => v > 0 ? "−" + eur(v) : "—", color: T.teal },
    { label: "− Otras deducc. NF 3/2025", key: "dedOtras",  fmt: v => v > 0 ? "−" + eur(v) : "—", color: T.teal },
    { label: "− Deducc. vivienda (art. 87)",  key: "dedViv",  fmt: v => v > 0 ? "−" + eur(v) : "—", color: T.teal },
    { label: "− Deducc. alquiler (art. 86)",  key: "dedAlq",  fmt: v => v > 0 ? "−" + eur(v) : "—", color: T.teal },
    { label: "CUOTA LÍQUIDA",             key: "cl",       fmt: eur, bold: true, highlight: true },
    { label: "Retenciones",          key: "retTotal",     fmt: eur },
    { label: "RESULTADO",            key: "resultado",    fmt: signedEur, bold: true, resultRow: true },
  ];

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: T.fontMono }}>
        <thead>
          <tr style={{ background: T.surfaceAlt }}>
            <th style={{ textAlign: "left", padding: "10px 14px", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.inkFaint, borderBottom: `1px solid ${T.border}`, minWidth: 140 }}>
              Concepto
            </th>
            {sorted.map((sc, i) => (
              <th key={sc.id} style={{ textAlign: "right", padding: "10px 14px", borderBottom: `1px solid ${T.border}`, minWidth: 130, background: i === 0 ? T.greenL : "transparent" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: sc.accentColor, letterSpacing: "0.08em", textTransform: "uppercase" }}>{sc.modalidad}</div>
                <div style={{ fontSize: 11, color: T.ink, fontWeight: 600 }}>{sc.label}</div>
                {i === 0 && <div style={{ fontSize: 9, color: T.greenAcc, fontWeight: 800, marginTop: 2 }}>★ ÓPTIMO</div>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.key} style={{ borderBottom: `1px solid ${T.borderSoft}`, background: row.highlight ? T.surfaceAlt : "transparent" }}>
              <td style={{ padding: "8px 14px", fontSize: 11, color: row.bold ? T.ink : T.inkMid, fontWeight: row.bold ? 700 : 400, fontFamily: "'Literata', Georgia, serif" }}>
                {row.label}
              </td>
              {sorted.map((sc, i) => {
                const val = sc[row.key];
                const isResult = row.resultRow;
                const colr = isResult ? (val >= 0 ? T.green : T.red) : (row.color || (row.bold ? T.ink : T.inkMid));
                const diff = isResult && i > 0 ? val - best : null;
                return (
                  <td key={sc.id} style={{ textAlign: "right", padding: "8px 14px", fontWeight: row.bold ? 700 : 400, color: colr, background: i === 0 ? T.greenL + "80" : isResult ? (val >= 0 ? T.greenL : T.redL) : "transparent", borderLeft: `1px solid ${T.borderSoft}` }}>
                    {row.fmt(val)}
                    {diff !== null && <div style={{ fontSize: 9, color: T.red, marginTop: 2 }}>−{eur(Math.abs(diff))} vs óptimo</div>}
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

// ═══════════════════════════════════════════════════════════════════════════════
// PANEL PEDAGÓGICO — "¿Por qué?"
// ═══════════════════════════════════════════════════════════════════════════════

function PorquePanel({ scenarios, hijos, hijosM6 = 0, hijos6a15 = 0 }) {
  if (!scenarios?.length) return null;
  const sorted = [...scenarios].sort((a, b) => b.resultado - a.resultado);
  const best = sorted[0];
  const hasConj = scenarios.some(s => s.id.startsWith("CONJ"));

  // Modo solo: sin escenarios conjuntos
  if (!hasConj) {
    return (
      <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 8 }}>
          Declaración individual
        </div>
        <div style={{ fontSize: 12, color: T.inkMid, lineHeight: 1.6 }}>
          Solo se muestra la declaración individual. Para comparar con la declaración conjunta, añade los datos de una segunda persona (Persona B).
          {hijos > 0 && ` Con hijos, la deducción de ${eur(deducHijosTotal(hijos, hijosM6, hijos6a15))} se aplica al 100% como progenitor único declarante.`}
        </div>
      </div>
    );
  }

  const drivers = [];

  // Analizar drivers de la diferencia
  const isConj = best.id.startsWith("CONJ");
  const hasHijos = hijos > 0;

  // ¿Cuánto pesa la penalización de la conjunta?
  const conjNoHijos = scenarios.find(s => s.id === "CONJ-NOHIJOS");
  const indNoHijos  = scenarios.find(s => s.id === "IND-NOHIJOS");
  if (conjNoHijos && indNoHijos) {
    const penalizacion = conjNoHijos.resultado - indNoHijos.resultado;
    if (penalizacion < 0) drivers.push({ label: "Penalización por 1 sola minoración en conjunta", value: penalizacion, note: `La conjunta aplica 1.583 € de minoración; la individual aplica 2 × 1.583 = 3.166 €. Diferencia: −1.583 €. Pero la reducción de base de 4.800 € (art. 73) ahorra ${eur(4800 * tipoMarginal(conjNoHijos.bl))} al tipo ${pct(tipoMarginal(conjNoHijos.bl))}.` });
    if (penalizacion >= 0) drivers.push({ label: "Ventaja neta de la declaración conjunta (sin hijos)", value: penalizacion, note: `La reducción de base de 4.800 € (art. 73 NF 3/2025) genera un ahorro de ${eur(4800 * tipoMarginal(conjNoHijos.bl))} que supera la pérdida de 1 minoración.` });
  }

  if (hasHijos) {
    const dedTotal = deducHijosTotal(hijos, hijosM6, hijos6a15);
    const dedConj  = dedTotal;          // 100%
    const dedInd   = dedTotal / 2;      // 50% pero puede perderse si cuota cero
    const perdida  = scenarios.find(s => s.id === "IND-HIJOS");
    if (perdida) {
      const dedEfectivaInd = (indNoHijos?.resultado !== undefined ? -(perdida.resultado - indNoHijos.resultado) : dedInd);
      drivers.push({ label: "Ventaja de la deducción de hijos en conjunta vs. individual", value: dedConj - dedEfectivaInd, note: `Conjunta: ${eur(dedConj)} completos. Individual: solo ${eur(dedEfectivaInd)} efectivos (si la otra persona tiene cuota cero, su 50% se pierde). Diferencia: ${eur(dedConj - dedEfectivaInd)}.` });
    }
  }

  if (!drivers.length) {
    drivers.push({ label: "La diferencia entre opciones es pequeña", value: best.resultado - sorted[sorted.length - 1].resultado, note: "Con rentas similares o sin hijos, la ventaja de la conjunta depende principalmente del tipo marginal aplicable a la reducción de 4.800 €." });
  }

  return (
    <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, marginBottom: 4 }}>
        ¿Por qué <span style={{ color: T.green }}>{best.label}</span> es la mejor opción?
      </div>
      <div style={{ fontSize: 11, color: T.inkMid, marginBottom: 16, lineHeight: 1.5 }}>
        Análisis de los factores que determinan la diferencia entre escenarios
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {drivers.map((d, i) => (
          <div key={i} style={{ background: d.value >= 0 ? T.greenL : T.redL, border: `1px solid ${d.value >= 0 ? T.greenAcc : T.redAcc}33`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.ink }}>{d.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, fontFamily: T.fontMono, color: d.value >= 0 ? T.green : T.red, whiteSpace: "nowrap" }}>
                {signedEur(d.value)}
              </div>
            </div>
            <div style={{ fontSize: 11, color: T.inkMid, lineHeight: 1.6 }}>{d.note}</div>
          </div>
        ))}
      </div>
      {/* Norma clave */}
      <div style={{ marginTop: 14, background: T.surfaceAlt, border: `1px solid ${T.borderSoft}`, borderRadius: 8, padding: "10px 14px", fontSize: 11, color: T.inkFaint, lineHeight: 1.6 }}>
        <strong style={{ color: T.inkMid }}>Regla general Álava:</strong> La conjunta suele convenir cuando la diferencia de rentas entre cónyuges es grande Y hay hijos en común (la deducción de hijos se aplica al 100% en lugar del 50%). La individual conviene cuando ambos tienen rentas similares y ambas cuotas absorben las deducciones.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export default function IRPFAlava2025() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activeTab, setActiveTab] = useState("comparativa");
  const [showPersonB, setShowPersonB] = useState(false);

  const aB    = n(state.personA.bruto);
  const aR    = n(state.personA.ret);
  const aRe   = n(state.personA.redExtra);
  const aTc   = state.personA.tipoContrato;
  const aRnl  = n(state.personA.rentasNoLab);
  const aDisc = state.personA.discapacidad;
  const aViu  = state.personA.viudedad;
  const aCuid = state.personA.cuidado;
  const aOt   = n(state.personA.otrasDeducNF3);
  const aVivC = n(state.personA.viviendaCompra);
  const aVivP = state.personA.viviendaPerfil;
  const aAlq  = n(state.personA.alquilerAnual);
  const aAlqP = state.personA.alquilerPerfil;
  const aEdad = state.personA.edad;
  const aDesp = state.personA.despoblacion;
  const aAsc  = state.personA.ascendientes;

  const bB    = n(state.personB.bruto);
  const bR    = n(state.personB.ret);
  const bRe   = n(state.personB.redExtra);
  const bTc   = state.personB.tipoContrato;
  const bRnl  = n(state.personB.rentasNoLab);
  const bDisc = state.personB.discapacidad;
  const bViu  = state.personB.viudedad;
  const bCuid = state.personB.cuidado;
  const bOt   = n(state.personB.otrasDeducNF3);
  const bVivC = n(state.personB.viviendaCompra);
  const bVivP = state.personB.viviendaPerfil;
  const bAlq  = n(state.personB.alquilerAnual);
  const bAlqP = state.personB.alquilerPerfil;
  const bEdad = state.personB.edad;
  const bDesp = state.personB.despoblacion;
  const bAsc  = state.personB.ascendientes;

  const hj      = state.hijos;
  const hjM6    = state.hijosM6;
  const hj6a15  = state.hijos6a15;
  const ready   = aB > 0;
  const hasPairData = showPersonB && bB > 0;

  // ── Cálculos ──────────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    if (!ready) return null;
    const dedHTotal = deducHijosTotal(hj, hjM6, hj6a15);
    const commonA = { tipoContrato: aTc, rentasNoLab: aRnl, discapacidad: aDisc, viudedad: aViu, cuidado: aCuid, otrasDeducNF3: aOt, viviendaCompra: aVivC, viviendaPerfil: aVivP, alquilerAnual: aAlq, alquilerPerfil: aAlqP, edad: aEdad, despoblacion: aDesp, ascendientes: aAsc };

    // Persona A individual (siempre)
    const a_sh = calcPersona({ bruto: aB, ret: aR, redExtra: aRe, hijosShare: 0, ...commonA });
    const hijosShareA = hasPairData ? dedHTotal / 2 : dedHTotal;
    const a_ch = calcPersona({ bruto: aB, ret: aR, redExtra: aRe, hijosShare: hijosShareA, ...commonA });

    if (!hasPairData) {
      return { a_sh, a_ch, solo: true };
    }

    // Persona B individual + conjuntas (solo cuando hay pareja)
    const commonB = { tipoContrato: bTc, rentasNoLab: bRnl, discapacidad: bDisc, viudedad: bViu, cuidado: bCuid, otrasDeducNF3: bOt, viviendaCompra: bVivC, viviendaPerfil: bVivP, alquilerAnual: bAlq, alquilerPerfil: bAlqP, edad: bEdad, despoblacion: bDesp, ascendientes: bAsc };
    const b_sh = calcPersona({ bruto: bB, ret: bR, redExtra: bRe, hijosShare: 0, ...commonB });
    const b_ch = calcPersona({ bruto: bB, ret: bR, redExtra: bRe, hijosShare: dedHTotal / 2, ...commonB });

    const conjParams = {
      brutoA: aB, retA: aR, redExtraA: aRe, brutoB: bB, retB: bR, redExtraB: bRe,
      tipoContratoA: aTc, rentasNoLabA: aRnl, discapacidadA: aDisc, viudedadA: aViu, cuidadoA: aCuid, otrasDeducNF3A: aOt,
      viviendaCompraA: aVivC, viviendaPerfilA: aVivP, alquilerAnualA: aAlq, alquilerPerfilA: aAlqP,
      edadA: aEdad, despoblacionA: aDesp, ascendientesA: aAsc,
      tipoContratoB: bTc, rentasNoLabB: bRnl, discapacidadB: bDisc, viudedadB: bViu, cuidadoB: bCuid, otrasDeducNF3B: bOt,
      viviendaCompraB: bVivC, viviendaPerfilB: bVivP, alquilerAnualB: bAlq, alquilerPerfilB: bAlqP,
      edadB: bEdad, despoblacionB: bDesp, ascendientesB: bAsc,
    };
    const c_sh = calcConjunta({ ...conjParams, hijosTotal: 0 });
    const c_ch = calcConjunta({ ...conjParams, hijosTotal: dedHTotal });

    return { a_sh, b_sh, a_ch, b_ch, c_sh, c_ch, solo: false };
  }, [aB, aR, aRe, aTc, aRnl, aDisc, aViu, aCuid, aOt, aVivC, aVivP, aAlq, aAlqP, aEdad, aDesp, aAsc,
      bB, bR, bRe, bTc, bRnl, bDisc, bViu, bCuid, bOt, bVivC, bVivP, bAlq, bAlqP, bEdad, bDesp, bAsc,
      hj, hjM6, hj6a15, ready, hasPairData]);

  // ── Escenarios ────────────────────────────────────────────────────────────
  const scenarios = useMemo(() => {
    if (!calc) return [];
    const hasH    = hj > 0;
    const dedHTxt = eur(deducHijosTotal(hj, hjM6, hj6a15));

    if (calc.solo) {
      // Modo solo: solo escenarios individuales de Persona A
      const { a_sh, a_ch } = calc;
      const list = [
        {
          id: "IND-NOHIJOS", modalidad: "Individual", label: "Individual · Sin hijos",
          sublabel: "Declaración individual, sin deducción de descendientes",
          accentColor: T.cobalt,
          resultado: a_sh.resultado,
          brutoTotal: aB, ssTotal: a_sh.ss,
          bonifTotal: a_sh.bonif, rntTotal: a_sh.rnt,
          redTotal: aRe, redConj: 0, bl: a_sh.bl,
          ci: a_sh.ci, minoracion: a_sh.minTotal,
          dedH: 0, dedViud: a_sh.dedViud, dedEdad: a_sh.dedEdad, dedDiscap: a_sh.dedDiscap,
          dedCuid: a_sh.dedCuid, dedAsc: a_sh.dedAsc, dedOtras: a_sh.dedOtras,
          dedViv: a_sh.dedViv, dedAlq: a_sh.dedAlq,
          cl: a_sh.cl, retTotal: aR,
          warning: hasH ? `No aprovechas la deducción de hijos de ${dedHTxt}` : null,
          _calcA: a_sh,
        },
        ...(hasH ? [{
          id: "IND-HIJOS", modalidad: "Individual", label: "Individual · Con hijos",
          sublabel: "Declaración individual, 100% deducción de descendientes",
          accentColor: T.cobalt,
          resultado: a_ch.resultado,
          brutoTotal: aB, ssTotal: a_ch.ss,
          bonifTotal: a_ch.bonif, rntTotal: a_ch.rnt,
          redTotal: aRe, redConj: 0, bl: a_ch.bl,
          ci: a_ch.ci, minoracion: a_ch.minTotal,
          dedH: a_ch.dedH, dedViud: a_ch.dedViud, dedEdad: a_ch.dedEdad, dedDiscap: a_ch.dedDiscap,
          dedCuid: a_ch.dedCuid, dedAsc: a_ch.dedAsc, dedOtras: a_ch.dedOtras,
          dedViv: a_ch.dedViv, dedAlq: a_ch.dedAlq,
          cl: a_ch.cl, retTotal: aR,
          _calcA: a_ch,
        }] : []),
      ];
      return list.sort((a, b) => b.resultado - a.resultado);
    }

    // Modo pareja: escenarios individuales + conjuntas
    const { a_sh, b_sh, a_ch, b_ch, c_sh, c_ch } = calc;
    const list = [
      {
        id: "IND-NOHIJOS", modalidad: "Individual", label: "Individual · Sin hijos",
        sublabel: "Dos declaraciones separadas, sin deducción de descendientes",
        accentColor: T.cobalt,
        resultado:  +(a_sh.resultado + b_sh.resultado).toFixed(2),
        brutoTotal: aB + bB, ssTotal: a_sh.ss + b_sh.ss,
        bonifTotal: a_sh.bonif + b_sh.bonif, rntTotal: a_sh.rnt + b_sh.rnt,
        redTotal: aRe + bRe, redConj: 0, bl: a_sh.bl + b_sh.bl,
        ci: a_sh.ci + b_sh.ci, minoracion: a_sh.minTotal + b_sh.minTotal,
        dedH: 0, dedViud: a_sh.dedViud + b_sh.dedViud, dedEdad: a_sh.dedEdad + b_sh.dedEdad, dedDiscap: a_sh.dedDiscap + b_sh.dedDiscap,
        dedCuid: a_sh.dedCuid + b_sh.dedCuid, dedAsc: a_sh.dedAsc + b_sh.dedAsc, dedOtras: a_sh.dedOtras + b_sh.dedOtras,
        dedViv: a_sh.dedViv + b_sh.dedViv, dedAlq: a_sh.dedAlq + b_sh.dedAlq,
        cl: a_sh.cl + b_sh.cl, retTotal: aR + bR,
        warning: hasH ? `No aprovechas la deducción de hijos de ${dedHTxt}` : null,
        _calcA: a_sh, _calcB: b_sh,
      },
      ...(hasH ? [{
        id: "IND-HIJOS", modalidad: "Individual", label: "Individual · Con hijos",
        sublabel: "Dos declaraciones, 50% de deducción de descendientes cada uno",
        accentColor: T.cobalt,
        resultado:  +(a_ch.resultado + b_ch.resultado).toFixed(2),
        brutoTotal: aB + bB, ssTotal: a_ch.ss + b_ch.ss,
        bonifTotal: a_ch.bonif + b_ch.bonif, rntTotal: a_ch.rnt + b_ch.rnt,
        redTotal: aRe + bRe, redConj: 0, bl: a_ch.bl + b_ch.bl,
        ci: a_ch.ci + b_ch.ci, minoracion: a_ch.minTotal + b_ch.minTotal,
        dedH: a_ch.dedH + b_ch.dedH, dedViud: a_ch.dedViud + b_ch.dedViud, dedEdad: a_ch.dedEdad + b_ch.dedEdad, dedDiscap: a_ch.dedDiscap + b_ch.dedDiscap,
        dedCuid: a_ch.dedCuid + b_ch.dedCuid, dedAsc: a_ch.dedAsc + b_ch.dedAsc, dedOtras: a_ch.dedOtras + b_ch.dedOtras,
        dedViv: a_ch.dedViv + b_ch.dedViv, dedAlq: a_ch.dedAlq + b_ch.dedAlq,
        cl: a_ch.cl + b_ch.cl, retTotal: aR + bR,
        warning: "El hijo NO debe presentar declaración voluntaria (art. 79.3.c NF 33/2013)",
        _calcA: a_ch, _calcB: b_ch,
      }] : []),
      {
        id: "CONJ-NOHIJOS", modalidad: "Conjunta", label: "Conjunta · Sin hijos",
        sublabel: "Una declaración · −4.800 € reducción base (art. 73 NF 3/2025)",
        accentColor: T.gold,
        resultado:  c_sh.resultado,
        brutoTotal: aB + bB, ssTotal: c_sh.ssA + c_sh.ssB,
        bonifTotal: c_sh.bonA + c_sh.bonB, rntTotal: c_sh.rntA + c_sh.rntB,
        redTotal: aRe + bRe, redConj: RED_CONJUNTA, bl: c_sh.bl,
        ci: c_sh.ci, minoracion: c_sh.minTotal,
        dedH: 0, dedViud: c_sh.dedViud, dedEdad: c_sh.dedEdad, dedDiscap: c_sh.dedDiscap,
        dedCuid: c_sh.dedCuid, dedAsc: c_sh.dedAsc, dedOtras: c_sh.dedOtras,
        dedViv: c_sh.dedViv, dedAlq: c_sh.dedAlq,
        cl: c_sh.cl, retTotal: aR + bR,
        warning: hasH ? `Deducción de hijos no aplicada: te pierdes ${dedHTxt}` : null,
        _calcConj: c_sh,
      },
      ...(hasH ? [{
        id: "CONJ-HIJOS", modalidad: "Conjunta", label: "Conjunta · Con hijos",
        sublabel: "Una declaración · −4.800 € base · deducción hijos 100%",
        accentColor: T.gold,
        resultado:  c_ch.resultado,
        brutoTotal: aB + bB, ssTotal: c_ch.ssA + c_ch.ssB,
        bonifTotal: c_ch.bonA + c_ch.bonB, rntTotal: c_ch.rntA + c_ch.rntB,
        redTotal: aRe + bRe, redConj: RED_CONJUNTA, bl: c_ch.bl,
        ci: c_ch.ci, minoracion: c_ch.minTotal,
        dedH: c_ch.dedH, dedViud: c_ch.dedViud, dedEdad: c_ch.dedEdad, dedDiscap: c_ch.dedDiscap,
        dedCuid: c_ch.dedCuid, dedAsc: c_ch.dedAsc, dedOtras: c_ch.dedOtras,
        dedViv: c_ch.dedViv, dedAlq: c_ch.dedAlq,
        cl: c_ch.cl, retTotal: aR + bR,
        warning: "El hijo NO debe presentar declaración voluntaria (art. 79.3.c NF 33/2013)",
        _calcConj: c_ch,
      }] : []),
    ];
    return list.sort((a, b) => b.resultado - a.resultado);
  }, [calc, hj, hjM6, hj6a15, aB, aR, aRe, bB, bR, bRe]);

  const optimo = scenarios[0];
  const peor   = scenarios[scenarios.length - 1];
  const diferencia = optimo && peor ? optimo.resultado - peor.resultado : 0;

  const TABS = [
    { id: "comparativa", label: "Comparativa" },
    { id: "detalle",     label: "Desglose paso a paso" },
    { id: "tabla",       label: "Tabla lado a lado" },
    { id: "porque",      label: "¿Por qué?" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: T.fontSans, color: T.ink }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{ background: T.ink, color: "#fff", padding: "0 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0 14px", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,.45)", marginBottom: 5 }}>
                Hacienda Foral de Álava · NF 33/2013 · NF 3/2025 · DF 23/2025
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>
                Calculadora IRPF Álava 2025
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 3 }}>
                Declaración 2026 · {hasPairData ? "Comparativa individual vs conjunta" : "Declaración individual"} · Solo rendimientos del trabajo
              </div>
            </div>
            {ready && optimo && (
              <div style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, padding: "12px 18px", textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", marginBottom: 4 }}>Mejor opción</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{optimo.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, fontFamily: T.fontMono, color: optimo.resultado >= 0 ? "#4ade80" : "#f87171" }}>
                  {signedEur(optimo.resultado)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BODY ──────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
        <div className="grid-main" style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 28, alignItems: "start" }}>

          {/* ────── PANEL IZQUIERDO: INPUTS ────────────────────────────── */}
          <div className="sticky-panel" style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Inputs side-by-side en mobile, stacked en desktop */}
            <PersonaInputs
              label="Persona A" letter="A" accent={T.cobalt} accentLight={T.cobaltL}
              data={state.personA} dispatch={dispatch} actionType="SET_A"
            />
            {showPersonB ? (
              <div style={{ position: "relative" }}>
                <PersonaInputs
                  label="Persona B" letter="B" accent={T.teal} accentLight={T.tealL}
                  data={state.personB} dispatch={dispatch} actionType="SET_B"
                />
                <button
                  onClick={() => { setShowPersonB(false); dispatch({ type: "RESET_B" }); }}
                  style={{
                    position: "absolute", top: 8, right: 8,
                    background: T.redL, border: `1px solid ${T.redAcc}44`,
                    borderRadius: 6, padding: "4px 10px", fontSize: 10,
                    color: T.red, cursor: "pointer", fontFamily: T.fontSans,
                    fontWeight: 600,
                  }}
                >
                  Quitar pareja
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPersonB(true)}
                style={{
                  background: T.tealL, border: `2px dashed ${T.teal}44`,
                  borderRadius: 12, padding: "18px 20px",
                  cursor: "pointer", fontSize: 13, color: T.teal,
                  fontFamily: T.fontSans, fontWeight: 600,
                  textAlign: "center", transition: "all .15s", width: "100%",
                }}
              >
                + Añadir pareja (Persona B)
                <div style={{ fontSize: 11, color: T.inkFaint, fontWeight: 400, marginTop: 4 }}>
                  Para comparar declaración individual vs conjunta
                </div>
              </button>
            )}

            {/* Hijos */}
            <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
              <HijosSelector
                value={hj}
                onChange={v => dispatch({ type: "SET_HIJOS", value: v })}
                hijosM6={hjM6}
                onChangeM6={v => dispatch({ type: "SET_HIJOS_M6", value: v })}
                hijos6a15={hj6a15}
                onChangej6a15={v => dispatch({ type: "SET_HIJOS_6A15", value: v })}
                soloMode={!showPersonB}
              />
            </div>

            {/* Reset */}
            <button
              onClick={() => { dispatch({ type: "RESET" }); setShowPersonB(false); }}
              style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px", fontSize: 12, color: T.inkFaint, cursor: "pointer", fontFamily: T.fontSans }}
            >
              ↺ Limpiar todos los datos
            </button>

            {/* Aviso */}
            <div style={{ background: T.surfaceAlt, border: `1px solid ${T.borderSoft}`, borderRadius: 8, padding: "12px 14px", fontSize: 10, color: T.inkFaint, lineHeight: 1.7 }}>
              <strong style={{ color: T.inkMid }}>Incluye:</strong> rendimientos del trabajo, bonificación art. 23 (incl. discapacidad), deducciones por descendientes (art. 79), edad (art. 83), viudedad (art. 82 bis), discapacidad del contribuyente (art. 82, grados base), ascendientes (art. 81), cuidado de dependientes (art. 81 ter), corresponsabilidad/reincorporación (arts. 83 bis/ter), vivienda habitual (art. 87) y alquiler (art. 86), minoración por despoblación (art. 77.2).
              <br /><strong style={{ color: T.inkMid }}>No incluye:</strong> capital inmobiliario/mobiliario, actividades económicas, ganancias patrimoniales, anualidades por alimentos (art. 80), discapacidad grados II/III (art. 82), asistentes personales (art. 81 bis), discapacidad de familiares convivientes, ni año de adquisición sin límite para &lt;36 (art. 87.4ter).
              <br /><strong style={{ color: T.red }}>Esta herramienta es orientativa.</strong> Para la declaración oficial, utiliza <strong>Rentafácil</strong> de la Hacienda Foral de Álava o consulta un asesor fiscal profesional.
            </div>
          </div>

          {/* ────── PANEL DERECHO: RESULTADOS ──────────────────────────── */}
          <div>
            {!ready ? (
              /* Estado vacío */
              <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 16, padding: "80px 40px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>⟷</div>
                <div style={{ fontSize: 17, color: T.inkMid, marginBottom: 8, fontWeight: 600 }}>Introduce los ingresos de Persona A</div>
                <div style={{ fontSize: 13, color: T.inkFaint, lineHeight: 1.6 }}>
                  Los escenarios se calculan en tiempo real.<br />
                  {showPersonB
                    ? "Compara individual vs conjunta, con y sin deducción de hijos."
                    : "Añade una pareja para comparar individual vs conjunta."}
                </div>
              </div>
            ) : (
              <>
                {/* ── Banner recomendación ─────────────────────────────── */}
                {optimo && (
                  <div style={{ background: `linear-gradient(135deg, ${T.greenL}, ${T.surface})`, border: `2px solid ${T.greenAcc}55`, borderRadius: 16, padding: "18px 22px", marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: T.green, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 5 }}>★ Recomendación</div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: T.ink }}>{optimo.label}</div>
                      <div style={{ fontSize: 12, color: T.inkMid, marginTop: 3 }}>{optimo.sublabel}</div>
                    </div>
                    {diferencia > 0 && (
                      <div style={{ background: T.greenL, border: `1px solid ${T.greenAcc}44`, borderRadius: 12, padding: "10px 16px", textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: T.green, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Ahorro vs. peor opción</div>
                        <div style={{ fontSize: 26, fontWeight: 900, fontFamily: T.fontMono, color: T.green }}>+{eur(diferencia)}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── TABS ────────────────────────────────────────────── */}
                <div style={{ display: "flex", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 4, marginBottom: 20, gap: 4 }}>
                  {TABS.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: "9px 4px", background: activeTab === t.id ? T.ink : "transparent", color: activeTab === t.id ? "#fff" : T.inkMid, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: activeTab === t.id ? 700 : 400, fontFamily: T.fontSans, transition: "all .15s" }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* ══ TAB: COMPARATIVA (CARDS) ═════════════════════════ */}
                {activeTab === "comparativa" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 16 }}>
                    {scenarios.map((sc, i) => (
                      <ScenarioCard key={sc.id} sc={sc} rank={i} totalOpciones={scenarios.length} />
                    ))}
                  </div>
                )}

                {/* ══ TAB: DESGLOSE WATERFALL ══════════════════════════ */}
                {activeTab === "detalle" && calc && (
                  <div>
                    <div style={{ fontSize: 12, color: T.inkFaint, marginBottom: 14 }}>
                      Haz clic en cada escenario para ver el cálculo paso a paso completo.
                    </div>

                    {/* Individuales */}
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.cobalt, marginBottom: 8 }}>
                      Declaración individual
                    </div>
                    <WaterfallDesglose data={{ ...calc.a_sh, bruto: aB, ret: aR, teRet: aR / aB }} label="Persona A — Individual sin hijos" accent={T.cobalt} />
                    {hj > 0 && <WaterfallDesglose data={{ ...calc.a_ch, bruto: aB, ret: aR, teRet: aR / aB }} label={`Persona A — Individual con hijos (${calc.solo ? "100%" : "50%"} = ${eur(calc.a_ch.dedH)})`} accent={T.cobalt} />}

                    {!calc.solo && (
                      <>
                        <WaterfallDesglose data={{ ...calc.b_sh, bruto: bB, ret: bR, teRet: bR / bB }} label="Persona B — Individual sin hijos" accent={T.teal} />
                        {hj > 0 && <WaterfallDesglose data={{ ...calc.b_ch, bruto: bB, ret: bR, teRet: bR / bB }} label={`Persona B — Individual con hijos (50% = ${eur(calc.b_ch.dedH)})`} accent={T.teal} />}

                        {/* Conjuntas */}
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.gold, marginBottom: 8, marginTop: 20 }}>
                          Declaración conjunta
                        </div>
                        <WaterfallDesglose
                          data={{ ...calc.c_sh, bruto: aB + bB, ss: calc.c_sh.ssA + calc.c_sh.ssB, bonif: calc.c_sh.bonA + calc.c_sh.bonB, rnt: calc.c_sh.rntA + calc.c_sh.rntB, redExtra: aRe + bRe, redConj: RED_CONJUNTA, ret: aR + bR, teRet: (aR + bR) / (aB + bB), teReal: calc.c_sh.teReal }}
                          label="Conjunta sin hijos — ambos en una sola declaración"
                          accent={T.gold}
                        />
                        {hj > 0 && (
                          <WaterfallDesglose
                            data={{ ...calc.c_ch, bruto: aB + bB, ss: calc.c_ch.ssA + calc.c_ch.ssB, bonif: calc.c_ch.bonA + calc.c_ch.bonB, rnt: calc.c_ch.rntA + calc.c_ch.rntB, redExtra: aRe + bRe, redConj: RED_CONJUNTA, ret: aR + bR, teRet: (aR + bR) / (aB + bB), teReal: calc.c_ch.teReal }}
                            label={`Conjunta con hijos (100% = ${eur(calc.c_ch.dedH)}) — opción óptima si hijos`}
                            accent={T.gold}
                          />
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ══ TAB: TABLA COMPARATIVA ═══════════════════════════ */}
                {activeTab === "tabla" && (
                  <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
                    <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.borderSoft}` }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>Todos los escenarios — comparativa de líneas</div>
                      <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 2 }}>Ordenados de mayor a menor resultado (mejor a peor)</div>
                    </div>
                    <TablaComparativa scenarios={scenarios} />
                  </div>
                )}

                {/* ══ TAB: POR QUÉ ═════════════════════════════════════ */}
                {activeTab === "porque" && (
                  <PorquePanel scenarios={scenarios} hijos={hj} hijosM6={hjM6} hijos6a15={hj6a15} />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", padding: "20px 24px", fontSize: 10, color: T.inkFaint, borderTop: `1px solid ${T.border}`, lineHeight: 1.7 }}>
        NF 33/2013 (texto consolidado) · NF 19/2024 · NF 3/2025 · DF 23/2025 · Orden PJC/178/2025 · Solo rendimientos del trabajo · Ejercicio fiscal 2025
        <br />Herramienta orientativa — para la declaración oficial usa Rentafácil (Hacienda Foral de Álava) o consulta un asesor fiscal
      </div>
    </div>
  );
}
