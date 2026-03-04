"use client";

import { n, eur } from "../engine/helpers.js";
import { T } from "../ui/tokens.js";
import { NumInput } from "../ui/NumInput.js";
import { SmallSelector } from "../ui/SmallSelector.js";
import { PENSION_LIMIT_TOTAL } from "../engine/constants.js";

/* ─────────────────────────────────────────────────────────────────────────────
   PersonCard — shared card wrapper for Person A / Person B
   ───────────────────────────────────────────────────────────────────────────── */
function PersonCard({ letter, label, accent, accentLight, children }) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-border"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <div className="p-5">
        {/* Header with avatar */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-[15px] font-extrabold font-mono"
            style={{ background: accentLight, border: `2px solid ${accent}30`, color: accent }}
          >
            {letter}
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: T.ink }}>{label}</div>
            <div className="text-[11px]" style={{ color: T.inkFaint }}>
              Rendimientos del trabajo &middot; Art. 15 NF 33/2013
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PersonBasicoFields — fields for one person
   ───────────────────────────────────────────────────────────────────────────── */
function PersonBasicoFields({ data, dispatch, actionType, accent, accentLight }) {
  const set = (field, value) => dispatch({ type: actionType, field, value });

  return (
    <>
      <NumInput
        label="Retribución bruta anual"
        value={data.bruto}
        onChange={v => set("bruto", v)}
        hint="Total antes de retenciones y cotizaciones SS"
        tooltipText="Suma de nóminas brutas del año 2025, incluyendo pagas extra, complementos y cualquier otra retribución dineraria del trabajo."
        accent={accent}
        accentLight={accentLight}
      />
      <NumInput
        label="Retenciones IRPF practicadas"
        value={data.ret}
        onChange={v => set("ret", v)}
        hint="Figura en el certificado de retenciones del pagador"
        tooltipText="Importe total retenido por la empresa durante 2025 a cuenta del IRPF. Aparece en el certificado de retenciones que debe entregarte el pagador."
        accent={accent}
        accentLight={accentLight}
      />
      <NumInput
        label="Otras reducciones de base (opcional)"
        value={data.redExtra}
        onChange={v => set("redExtra", v)}
        hint="Aportaciones a planes de pensiones, EPSV, etc."
        tooltipText="Aportaciones a planes de pensiones, EPSV u otros sistemas de previsión social. Límite general 2025: 5.000 € individuales + 8.000 € empresariales (art. 70-72 NF 33/2013)."
        accent={accent}
        accentLight={accentLight}
      />

      {n(data.redExtra) > PENSION_LIMIT_TOTAL && (
        <div className="text-[10px] leading-relaxed pb-2" style={{ color: T.red }}>
          Las reducciones de base superan el límite de {eur(PENSION_LIMIT_TOTAL)} (5.000 € individual + 8.000 € empresarial).
        </div>
      )}

      <SmallSelector
        lbl="Tipo de contrato"
        value={data.tipoContrato}
        onChange={v => set("tipoContrato", v)}
        options={[
          { value: "indefinido", label: "Indefinido (6,48%)" },
          { value: "temporal",   label: "Temporal (6,53%)" },
        ]}
        tooltipText="Afecta al tipo de cotización SS. Indefinido: 6,48% (4,70+1,55+0,10+0,13 MEI). Temporal: 6,53% (4,70+1,60+0,10+0,13 MEI). Orden PJC/178/2025. Tope base: 58.914 €/año."
        accent={accent}
        accentLight={accentLight}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   StepBasico — Step 1: "Lo básico"
   Salary, withholdings, contract type for Person A (and B if applicable)
   ───────────────────────────────────────────────────────────────────────────── */
export default function StepBasico({ state, dispatch, showPersonB, setShowPersonB }) {
  return (
    <div className="space-y-6">
      {/* Two-column layout when both persons are visible */}
      <div className={showPersonB ? "grid grid-cols-1 md:grid-cols-2 gap-6" : ""}>
        {/* Person A */}
        <PersonCard
          letter="A"
          label="Persona A"
          accent={T.cobalt}
          accentLight={T.cobaltL}
        >
          <PersonBasicoFields
            data={state.personA}
            dispatch={dispatch}
            actionType="SET_A"
            accent={T.cobalt}
            accentLight={T.cobaltL}
          />
        </PersonCard>

        {/* Person B */}
        {showPersonB && (
          <PersonCard
            letter="B"
            label="Persona B"
            accent={T.teal}
            accentLight={T.tealL}
          >
            <PersonBasicoFields
              data={state.personB}
              dispatch={dispatch}
              actionType="SET_B"
              accent={T.teal}
              accentLight={T.tealL}
            />
            {/* Remove person B button */}
            <button
              onClick={() => {
                dispatch({ type: "RESET_B" });
                setShowPersonB(false);
              }}
              className="mt-4 w-full py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 hover:opacity-80"
              style={{
                background: T.redL,
                border: `1px solid ${T.redAcc}44`,
                color: T.red,
              }}
            >
              Quitar pareja
            </button>
          </PersonCard>
        )}
      </div>

      {/* Add person B button */}
      {!showPersonB && (
        <button
          onClick={() => setShowPersonB(true)}
          className="w-full py-3.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-150 hover:opacity-80"
          style={{
            background: "transparent",
            border: `2px dashed ${T.teal}55`,
            color: T.teal,
          }}
        >
          + Añadir pareja (Persona B)
        </button>
      )}
    </div>
  );
}
