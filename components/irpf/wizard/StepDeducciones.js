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
        <div className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: T.inkFaint }}>
          Rentas adicionales y otras deducciones
        </div>

        <NumInput
          label="Otras rentas no laborales adicionales (art. 23.2)"
          value={data.rentasNoLab}
          onChange={v => set("rentasNoLab", v)}
          hint="Solo si tienes rentas NO incluidas en la sección 'Otras rentas' de abajo"
          tooltipText="Rentas no laborales que no hayas introducido ya en la sección 'Otras rentas' (capital inmobiliario, mobiliario, ganancias). Si el total de todas las rentas no laborales supera 7.500 €, la bonificación del trabajo se limita a 3.000 € (art. 23.2 NF 33/2013). Las rentas introducidas abajo ya se suman automáticamente."
          accent={accent}
          accentLight={accentLight}
        />

        <NumInput
          label="Otras deducciones no individualizadas"
          value={data.otrasDeducNF3}
          onChange={v => set("otrasDeducNF3", v)}
          hint="Corresponsabilidad (≤200 €), reincorporación (≤1.500 €), rehabilitación (18%, máx 3.000 €), eficiencia energética (15%), recarga VE (15%)"
          tooltipText="Introduce la suma de las deducciones que no tienen campo propio: Art. 83 bis: hasta 200 €/año (corresponsabilidad masculina). Art. 83 ter: hasta 1.500 €/año (reincorporación femenina). Art. 87 bis: 18% rehabilitación vivienda protegida, máx 3.000 €. Art. 87 ter/quater: 15% mejoras eficiencia energética. Art. 87 quinquies: 15% puntos de recarga VE. Calcula el importe de cada deducción e introduce aquí la suma total."
          accent={accent}
          accentLight={accentLight}
        />
      </div>

      {/* Anualidades por alimentos */}
      <div className="mb-5 pt-5 border-t" style={{ borderColor: T.border }}>
        <NumInput
          label="Anualidades por alimentos a hijos (art. 80)"
          value={data.anualidadesAlimentos}
          onChange={v => set("anualidadesAlimentos", v)}
          hint="Importe anual por decisión judicial"
          tooltipText="Deducción del 15% de las anualidades por alimentos satisfechas a los hijos por decisión judicial. Límite por hijo: 30% de la deducción del art. 79 correspondiente a ese hijo. Art. 80 NF 3/2025."
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
            tooltipText="Número de hijos a los que se satisfacen anualidades por alimentos. Se necesita para calcular el límite del 30% de la deducción del art. 79 por cada hijo."
            accent={accent}
            accentLight={accentLight}
          />
        )}
      </div>

      {/* Incentivos fiscales */}
      <div className="mb-5 pt-5 border-t" style={{ borderColor: T.border }}>
        <div className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: T.inkFaint }}>
          Incentivos fiscales
        </div>

        <NumInput
          label="Donaciones a entidades cualificadas (NF 35/2021)"
          value={data.donaciones}
          onChange={v => set("donaciones", v)}
          hint="Fundaciones, asociaciones de utilidad pública, etc."
          tooltipText="Deducción del 30% (general) o 45% (actividades prioritarias de mecenazgo) de las donaciones a entidades beneficiarias de mecenazgo. Base máxima: 30% de la base liquidable (art. 91 NF 33/2013). NF 35/2021 de régimen fiscal del mecenazgo."
          accent={accent}
          accentLight={accentLight}
        />
        {n(data.donaciones) > 0 && (
          <div className="mb-5">
            <label className="flex items-center gap-3 cursor-pointer">
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
          tooltipText="Deducción del 10% de las cantidades invertidas en empresas de nueva o reciente creación, con un máximo de 6.000 € de deducción."
          accent={accent}
          accentLight={accentLight}
        />
      </div>
    </>
  );
}

export default function StepDeducciones({ state, dispatch, showPersonB }) {
  return (
    <div className="space-y-6">
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
