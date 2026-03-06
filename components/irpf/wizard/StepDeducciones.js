"use client";

import { n } from "../engine/helpers.js";
import { T } from "../ui/tokens.js";
import { NumInput } from "../ui/NumInput.js";
import { SmallSelector } from "../ui/SmallSelector.js";
import { PersonCard } from "../ui/PersonCard.js";

function PersonDeduccionesFields({ data, dispatch, actionType, accent, accentLight }) {
  const set = (field, value) => dispatch({ type: actionType, field, value });

  return (
    <>
      {/* Rentas y reducciones */}
      <div className="mb-5">
        <div className="text-[12px] font-bold tracking-widest uppercase mb-4" style={{ color: T.inkFaint }}>
          Rentas adicionales y otras deducciones
        </div>

        <NumInput
          label="Otras rentas no laborales adicionales (art. 23.2)"
          value={data.rentasNoLab}
          onChange={v => set("rentasNoLab", v)}
          hint="Solo si tienes rentas NO incluidas en la sección 'Otras rentas' de abajo"
          tooltipData={{
            title: "Otras rentas no laborales",
            norm: "Art. 23.2 NF 33/2013",
            iconColor: "teal",
            text: "Rentas no laborales no introducidas en la sección 'Otras rentas'. Las rentas de capital y ganancias ya se suman automáticamente.",
            footnote: "Si el total supera 7.500 €, la bonificación del trabajo se limita a 3.000 €.",
          }}
          accent={accent}
          accentLight={accentLight}
        />

        <NumInput
          label="Otras deducciones no individualizadas"
          value={data.otrasDeducNF3}
          onChange={v => set("otrasDeducNF3", v)}
          hint="Corresponsabilidad (≤200 €), reincorporación (≤1.500 €), rehabilitación (18%, máx 3.000 €), eficiencia energética (15%), recarga VE (15%)"
          tooltipData={{
            title: "Otras deducciones",
            iconColor: "teal",
            text: "Suma de deducciones sin campo propio. Calcula el importe de cada una e introduce la suma total.",
            rows: [
              { label: "Corresponsabilidad (83 bis)",    value: "≤ 200 €" },
              { label: "Reincorporación (83 ter)",       value: "≤ 1.500 €" },
              { label: "Rehab. vivienda (87 bis)",       value: "18%, máx 3.000 €" },
              { label: "Eficiencia energ. (87 ter/qua)", value: "15%" },
              { label: "Recarga VE (87 quinquies)",      value: "15%" },
            ],
          }}
          accent={accent}
          accentLight={accentLight}
        />
      </div>

      {/* Anualidades por alimentos */}
      <div className="mb-8 pt-8 border-t" style={{ borderColor: T.border }}>
        <NumInput
          label="Anualidades por alimentos a hijos (art. 80)"
          value={data.anualidadesAlimentos}
          onChange={v => set("anualidadesAlimentos", v)}
          hint="Importe anual por decisión judicial"
          tooltipData={{
            title: "Anualidades por alimentos",
            norm: "Art. 80 NF 3/2025",
            iconColor: "teal",
            text: "Deducción del 15% de las anualidades por alimentos satisfechas a los hijos por decisión judicial.",
            footnote: "Límite por hijo: 30% de la deducción del art. 79 correspondiente a ese hijo.",
          }}
          accent={accent}
          accentLight={accentLight}
        />
        {n(data.anualidadesAlimentos) > 0 && (
          <SmallSelector
            lbl="Nº hijos que reciben alimentos"
            value={String(data.numHijosAlimentos)}
            onChange={v => set("numHijosAlimentos", parseInt(v) || 1)}
            options={[
              { value: "1", label: "1 hijo" },
              { value: "2", label: "2 hijos" },
              { value: "3", label: "3 hijos" },
              { value: "4", label: "4 hijos" },
            ]}
            tooltipData={{
              title: "Nº hijos que reciben alimentos",
              norm: "Art. 80 NF 3/2025",
              iconColor: "teal",
              text: "Se necesita para calcular el límite del 30% de la deducción del art. 79 por cada hijo.",
            }}
            accent={accent}
            accentLight={accentLight}
          />
        )}
      </div>

      {/* Incentivos fiscales */}
      <div className="mb-8 pt-8 border-t" style={{ borderColor: T.border }}>
        <div className="text-[12px] font-bold tracking-widest uppercase mb-4" style={{ color: T.inkFaint }}>
          Incentivos fiscales
        </div>

        <NumInput
          label="Donaciones a entidades cualificadas (NF 35/2021)"
          value={data.donaciones}
          onChange={v => set("donaciones", v)}
          hint="Fundaciones, asociaciones de utilidad pública, etc."
          tooltipData={{
            title: "Donaciones a entidades cualificadas",
            norm: "NF 35/2021",
            iconColor: "teal",
            text: "Donaciones a entidades beneficiarias de mecenazgo.",
            rows: [
              { label: "General",                value: "30%", highlight: true },
              { label: "Actividades prioritarias",value: "45%", highlight: true },
            ],
            footnote: "Base máxima: 30% de la base liquidable (art. 91 NF 33/2013).",
          }}
          accent={accent}
          accentLight={accentLight}
        />
        {n(data.donaciones) > 0 && (
          <div className="mb-5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={data.donacionesPrioritarias}
                onChange={e => set("donacionesPrioritarias", e.target.checked)}
                className="w-5 h-5 cursor-pointer rounded accent-current"
              />
              <div>
                <div className="text-sm font-medium" style={{ color: T.ink }}>
                  Actividades prioritarias de mecenazgo (45%)
                </div>
                <div className="text-xs mt-0.5" style={{ color: T.inkFaint }}>
                  En lugar del 30% general &middot; Art. 25 NF 35/2021
                </div>
              </div>
            </label>
          </div>
        )}

        <NumInput
          label="Inversión en empresas de nueva creación"
          value={data.inversionNuevaCreacion}
          onChange={v => set("inversionNuevaCreacion", v)}
          hint="Participaciones en empresas de nueva o reciente creación"
          tooltipData={{
            title: "Inversión en empresas de nueva creación",
            iconColor: "teal",
            text: "Deducción del 10% de las cantidades invertidas en empresas de nueva o reciente creación.",
            footnote: "Máximo de 6.000 € de deducción.",
          }}
          accent={accent}
          accentLight={accentLight}
        />
      </div>
    </>
  );
}

export default function StepDeducciones({ state, dispatch, showPersonB }) {
  return (
    <div className="space-y-8">
      <div className={showPersonB ? "grid grid-cols-1 md:grid-cols-2 gap-6" : ""}>
        <PersonCard
          letter="A"
          label="Persona A"
          subtitle="Deducciones e incentivos fiscales"
          accent={T.cobalt}
          accentLight={T.cobaltL}
        >
          <PersonDeduccionesFields
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
            subtitle="Deducciones e incentivos fiscales"
            accent={T.teal}
            accentLight={T.tealL}
          >
            <PersonDeduccionesFields
              data={state.personB}
              dispatch={dispatch}
              actionType="SET_B"
              accent={T.teal}
              accentLight={T.tealL}
            />
          </PersonCard>
        )}
      </div>
    </div>
  );
}
