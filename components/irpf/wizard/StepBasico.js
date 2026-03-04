"use client";

import { n, eur } from "../engine/helpers.js";
import { T } from "../ui/tokens.js";
import { NumInput } from "../ui/NumInput.js";
import { SmallSelector } from "../ui/SmallSelector.js";
import { PersonCard } from "../ui/PersonCard.js";
import { PENSION_LIMIT_TOTAL } from "../engine/constants.js";

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
        <div className="text-xs leading-relaxed pb-2 font-medium" style={{ color: T.red }}>
          Las reducciones de base superan el límite de {eur(PENSION_LIMIT_TOTAL)} (5.000 \u20AC individual + 8.000 \u20AC empresarial).
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

export default function StepBasico({ state, dispatch, showPersonB, setShowPersonB }) {
  return (
    <div className="space-y-6">
      <div className={showPersonB ? "grid grid-cols-1 md:grid-cols-2 gap-6" : ""}>
        <PersonCard
          letter="A"
          label="Persona A"
          subtitle="Rendimientos del trabajo · Art. 15 NF 33/2013"
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

        {showPersonB && (
          <PersonCard
            letter="B"
            label="Persona B"
            subtitle="Rendimientos del trabajo · Art. 15 NF 33/2013"
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
            <button
              onClick={() => {
                dispatch({ type: "RESET_B" });
                setShowPersonB(false);
              }}
              className="mt-4 w-full py-3 rounded-xl text-sm font-medium cursor-pointer
                         transition-all duration-200 hover:opacity-80"
              style={{
                background: T.redL,
                border: `1.5px solid ${T.redAcc}33`,
                color: T.red,
              }}
            >
              Quitar pareja
            </button>
          </PersonCard>
        )}
      </div>

      {!showPersonB && (
        <button
          onClick={() => setShowPersonB(true)}
          className="w-full py-4 rounded-xl text-sm font-medium cursor-pointer
                     transition-all duration-200 hover:bg-teal-light/50 group"
          style={{
            background: "transparent",
            border: `2px dashed ${T.teal}44`,
            color: T.teal,
          }}
        >
          + Añadir pareja (Persona B)
        </button>
      )}
    </div>
  );
}
