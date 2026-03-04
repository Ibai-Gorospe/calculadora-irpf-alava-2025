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
          hint="Solo si tienes rentas NO incluidas en la secci\u00F3n 'Otras rentas' de abajo"
          tooltipText="Rentas no laborales que no hayas introducido ya en la secci\u00F3n 'Otras rentas' (capital inmobiliario, mobiliario, ganancias). Si el total de todas las rentas no laborales supera 7.500 \u20AC, la bonificaci\u00F3n del trabajo se limita a 3.000 \u20AC (art. 23.2 NF 33/2013). Las rentas introducidas abajo ya se suman autom\u00E1ticamente."
          accent={accent}
          accentLight={accentLight}
        />

        <NumInput
          label="Otras deducciones no individualizadas"
          value={data.otrasDeducNF3}
          onChange={v => set("otrasDeducNF3", v)}
          hint="Corresponsabilidad (\u2264200 \u20AC), reincorporaci\u00F3n (\u22641.500 \u20AC), rehabilitaci\u00F3n (18%, m\u00E1x 3.000 \u20AC), eficiencia energ\u00E9tica (15%), recarga VE (15%)"
          tooltipText="Introduce la suma de las deducciones que no tienen campo propio: Art. 83 bis: hasta 200 \u20AC/a\u00F1o (corresponsabilidad masculina). Art. 83 ter: hasta 1.500 \u20AC/a\u00F1o (reincorporaci\u00F3n femenina). Art. 87 bis: 18% rehabilitaci\u00F3n vivienda protegida, m\u00E1x 3.000 \u20AC. Art. 87 ter/quater: 15% mejoras eficiencia energ\u00E9tica. Art. 87 quinquies: 15% puntos de recarga VE. Calcula el importe de cada deducci\u00F3n e introduce aqu\u00ED la suma total."
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
          hint="Importe anual por decisi\u00F3n judicial"
          tooltipText="Deducci\u00F3n del 15% de las anualidades por alimentos satisfechas a los hijos por decisi\u00F3n judicial. L\u00EDmite por hijo: 30% de la deducci\u00F3n del art. 79 correspondiente a ese hijo. Art. 80 NF 3/2025."
          accent={accent}
          accentLight={accentLight}
        />
        {n(data.anualidadesAlimentos) > 0 && (
          <SmallSelector
            lbl="N\u00BA hijos que reciben alimentos"
            value={String(data.numHijosAlimentos)}
            onChange={v => set("numHijosAlimentos", parseInt(v) || 1)}
            options={[
              { value: "1", label: "1 hijo" },
              { value: "2", label: "2 hijos" },
              { value: "3", label: "3 hijos" },
              { value: "4", label: "4 hijos" },
            ]}
            tooltipText="N\u00FAmero de hijos a los que se satisfacen anualidades por alimentos. Se necesita para calcular el l\u00EDmite del 30% de la deducci\u00F3n del art. 79 por cada hijo."
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
          hint="Fundaciones, asociaciones de utilidad p\u00FAblica, etc."
          tooltipText="Deducci\u00F3n del 30% (general) o 45% (actividades prioritarias de mecenazgo) de las donaciones a entidades beneficiarias de mecenazgo. Base m\u00E1xima: 30% de la base liquidable (art. 91 NF 33/2013). NF 35/2021 de r\u00E9gimen fiscal del mecenazgo."
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
          label="Inversi\u00F3n en empresas de nueva creaci\u00F3n"
          value={data.inversionNuevaCreacion}
          onChange={v => set("inversionNuevaCreacion", v)}
          hint="Participaciones en empresas de nueva o reciente creaci\u00F3n"
          tooltipText="Deducci\u00F3n del 10% de las cantidades invertidas en empresas de nueva o reciente creaci\u00F3n, con un m\u00E1ximo de 6.000 \u20AC de deducci\u00F3n."
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
