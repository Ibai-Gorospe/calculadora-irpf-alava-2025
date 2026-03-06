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
        tooltipData={{
          title: "Retribución bruta anual",
          norm: "Art. 15 NF 33/2013",
          iconColor: "cobalt",
          text: "Suma de todas tus nóminas brutas de 2025, incluyendo pagas extra y complementos.",
          tag: "Lo encontrarás en tu certificado de retenciones",
        }}
        accent={accent}
        accentLight={accentLight}
      />
      <NumInput
        label="Retenciones IRPF practicadas"
        value={data.ret}
        onChange={v => set("ret", v)}
        hint="Figura en el certificado de retenciones del pagador"
        tooltipData={{
          title: "Retenciones IRPF",
          iconColor: "cobalt",
          text: "Importe total retenido por la empresa durante 2025 a cuenta del IRPF.",
          tag: "Figura en el certificado de retenciones del pagador",
        }}
        accent={accent}
        accentLight={accentLight}
      />
      <NumInput
        label="Otras reducciones de base (opcional)"
        value={data.redExtra}
        onChange={v => set("redExtra", v)}
        hint="Aportaciones a planes de pensiones, EPSV, etc."
        tooltipData={{
          title: "Otras reducciones de base",
          norm: "Arts. 70–72 NF 33/2013",
          iconColor: "gold",
          text: "Aportaciones a planes de pensiones, EPSV u otros sistemas de previsión social.",
          footnote: "Límite 2025: 5.000 € individuales + 8.000 € empresariales.",
        }}
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
        tooltipData={{
          title: "Tipo de contrato",
          norm: "Orden PJC/178/2025",
          iconColor: "gold",
          rows: [
            { label: "Indefinido", value: "6,48 %" },
            { label: "Temporal",   value: "6,53 %" },
          ],
          footnote: "Tope base SS: 58.914 €/año.",
        }}
        accent={accent}
        accentLight={accentLight}
      />
    </>
  );
}

export default function StepBasico({ state, dispatch, showPersonB, setShowPersonB }) {
  return (
    <div className="space-y-8">
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
              className="mt-5 w-full py-2.5 rounded-lg text-sm font-medium cursor-pointer
                         transition-all duration-200 hover:opacity-80"
              style={{
                background: T.redL,
                border: `1px solid ${T.redAcc}33`,
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
          className="w-full py-3 rounded-lg text-sm font-medium cursor-pointer
                     transition-all duration-200 hover:bg-teal-light/50 group"
          style={{
            background: "transparent",
            border: `1.5px dashed ${T.teal}44`,
            color: T.teal,
          }}
        >
          + Añadir pareja (Persona B)
        </button>
      )}
    </div>
  );
}
