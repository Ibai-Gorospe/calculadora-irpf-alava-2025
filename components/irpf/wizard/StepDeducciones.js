"use client";

import { n } from "../engine/helpers.js";
import { T } from "../ui/tokens.js";
import { NumInput } from "../ui/NumInput.js";
import { SmallSelector } from "../ui/SmallSelector.js";

/* ─────────────────────────────────────────────────────────────────────────────
   PersonCard — shared card wrapper
   ───────────────────────────────────────────────────────────────────────────── */
function PersonCard({ letter, label, accent, accentLight, children }) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-border"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <div className="p-5">
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
              Deducciones e incentivos fiscales
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PersonDeduccionesFields — fields for one person
   ───────────────────────────────────────────────────────────────────────────── */
function PersonDeduccionesFields({ data, dispatch, actionType, accent, accentLight }) {
  const set = (field, value) => dispatch({ type: actionType, field, value });

  return (
    <>
      {/* ── Rentas y reducciones ─────────────────────────────────────────── */}
      <div className="mb-4">
        <div
          className="text-[10px] font-bold tracking-widest uppercase mb-2.5"
          style={{ color: T.inkFaint }}
        >
          Rentas adicionales y otras deducciones
        </div>

        {/* Otras rentas no laborales */}
        <NumInput
          label="Otras rentas no laborales adicionales (art. 23.2)"
          value={data.rentasNoLab}
          onChange={v => set("rentasNoLab", v)}
          hint="Solo si tienes rentas NO incluidas en la secci\u00f3n 'Otras rentas' de abajo"
          tooltipText="Rentas no laborales que no hayas introducido ya en la secci\u00f3n 'Otras rentas' (capital inmobiliario, mobiliario, ganancias). Si el total de todas las rentas no laborales supera 7.500 \u20ac, la bonificaci\u00f3n del trabajo se limita a 3.000 \u20ac (art. 23.2 NF 33/2013). Las rentas introducidas abajo ya se suman autom\u00e1ticamente."
          accent={accent}
          accentLight={accentLight}
        />

        {/* Otras deducciones */}
        <NumInput
          label="Otras deducciones no individualizadas"
          value={data.otrasDeducNF3}
          onChange={v => set("otrasDeducNF3", v)}
          hint="Corresponsabilidad (\u2264200 \u20ac), reincorporaci\u00f3n (\u22641.500 \u20ac), rehabilitaci\u00f3n (18%, m\u00e1x 3.000 \u20ac), eficiencia energ\u00e9tica (15%), recarga VE (15%)"
          tooltipText="Introduce la suma de las deducciones que no tienen campo propio: Art. 83 bis: hasta 200 \u20ac/a\u00f1o (corresponsabilidad masculina). Art. 83 ter: hasta 1.500 \u20ac/a\u00f1o (reincorporaci\u00f3n femenina). Art. 87 bis: 18% rehabilitaci\u00f3n vivienda protegida, m\u00e1x 3.000 \u20ac. Art. 87 ter/quater: 15% mejoras eficiencia energ\u00e9tica. Art. 87 quinquies: 15% puntos de recarga VE. Calcula el importe de cada deducci\u00f3n e introduce aqu\u00ed la suma total."
          accent={accent}
          accentLight={accentLight}
        />
      </div>

      {/* ── Anualidades por alimentos ────────────────────────────────────── */}
      <div className="mb-4 pt-3 border-t" style={{ borderColor: T.borderSoft }}>
        <NumInput
          label="Anualidades por alimentos a hijos (art. 80)"
          value={data.anualidadesAlimentos}
          onChange={v => set("anualidadesAlimentos", v)}
          hint="Importe anual por decisi\u00f3n judicial"
          tooltipText="Deducci\u00f3n del 15% de las anualidades por alimentos satisfechas a los hijos por decisi\u00f3n judicial. L\u00edmite por hijo: 30% de la deducci\u00f3n del art. 79 correspondiente a ese hijo. Art. 80 NF 3/2025."
          accent={accent}
          accentLight={accentLight}
        />
        {n(data.anualidadesAlimentos) > 0 && (
          <SmallSelector
            lbl="N\u00ba hijos que reciben alimentos"
            value={String(data.numHijosAlimentos)}
            onChange={v => set("numHijosAlimentos", parseInt(v) || 1)}
            options={[
              { value: "1", label: "1 hijo" },
              { value: "2", label: "2 hijos" },
              { value: "3", label: "3 hijos" },
              { value: "4", label: "4 hijos" },
            ]}
            tooltipText="N\u00famero de hijos a los que se satisfacen anualidades por alimentos. Se necesita para calcular el l\u00edmite del 30% de la deducci\u00f3n del art. 79 por cada hijo."
            accent={accent}
            accentLight={accentLight}
          />
        )}
      </div>

      {/* ── Incentivos fiscales ──────────────────────────────────────────── */}
      <div className="mb-4 pt-3 border-t" style={{ borderColor: T.borderSoft }}>
        <div
          className="text-[10px] font-bold tracking-widest uppercase mb-2.5"
          style={{ color: T.inkFaint }}
        >
          Incentivos fiscales
        </div>

        {/* Donaciones */}
        <NumInput
          label="Donaciones a entidades cualificadas (NF 35/2021)"
          value={data.donaciones}
          onChange={v => set("donaciones", v)}
          hint="Fundaciones, asociaciones de utilidad p\u00fablica, etc."
          tooltipText="Deducci\u00f3n del 30% (general) o 45% (actividades prioritarias de mecenazgo) de las donaciones a entidades beneficiarias de mecenazgo. Base m\u00e1xima: 30% de la base liquidable (art. 91 NF 33/2013). NF 35/2021 de r\u00e9gimen fiscal del mecenazgo."
          accent={accent}
          accentLight={accentLight}
        />
        {n(data.donaciones) > 0 && (
          <div className="mb-3.5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={data.donacionesPrioritarias}
                onChange={e => set("donacionesPrioritarias", e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-current"
              />
              <div>
                <div className="text-xs font-semibold" style={{ color: T.ink }}>
                  Actividades prioritarias de mecenazgo (45%)
                </div>
                <div className="text-[10px]" style={{ color: T.inkFaint }}>
                  En lugar del 30% general &middot; Art. 25 NF 35/2021
                </div>
              </div>
            </label>
          </div>
        )}

        {/* Inversi\u00f3n nueva creaci\u00f3n */}
        <NumInput
          label="Inversi\u00f3n en empresas de nueva creaci\u00f3n"
          value={data.inversionNuevaCreacion}
          onChange={v => set("inversionNuevaCreacion", v)}
          hint="Participaciones en empresas de nueva o reciente creaci\u00f3n"
          tooltipText="Deducci\u00f3n del 10% de las cantidades invertidas en empresas de nueva o reciente creaci\u00f3n, con un m\u00e1ximo de 6.000 \u20ac de deducci\u00f3n."
          accent={accent}
          accentLight={accentLight}
        />
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   StepDeducciones — Step 5: "Deducciones" (optional)
   Donations, investments, child support, other
   ───────────────────────────────────────────────────────────────────────────── */
export default function StepDeducciones({ state, dispatch, showPersonB }) {
  return (
    <div className="space-y-6">
      <div className={showPersonB ? "grid grid-cols-1 md:grid-cols-2 gap-6" : ""}>
        {/* Person A */}
        <PersonCard
          letter="A"
          label="Persona A"
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

        {/* Person B */}
        {showPersonB && (
          <PersonCard
            letter="B"
            label="Persona B"
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
