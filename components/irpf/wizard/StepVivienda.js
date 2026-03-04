"use client";

import { n } from "../engine/helpers.js";
import { T } from "../ui/tokens.js";
import { NumInput } from "../ui/NumInput.js";
import { SmallSelector } from "../ui/SmallSelector.js";
import { PersonCard } from "../ui/PersonCard.js";

function PersonViviendaFields({ data, dispatch, actionType, accent, accentLight }) {
  const set = (field, value) => dispatch({ type: actionType, field, value });

  return (
    <>
      <NumInput
        label="Pagos hipoteca anual (art. 87)"
        value={data.viviendaCompra}
        onChange={v => set("viviendaCompra", v)}
        hint="Amortizaci\u00F3n + intereses anuales"
        tooltipText="Deducci\u00F3n por adquisici\u00F3n de vivienda habitual. General: 18% (m\u00E1x. 1.530 \u20AC). Mun. <4.000 hab.: 20% (m\u00E1x. 1.836 \u20AC). <36 a\u00F1os / fam. num.: 25% (m\u00E1x. 2.346 \u20AC). Art. 87 NF 33/2013 (mod. NF 3/2025)."
        accent={accent}
        accentLight={accentLight}
      />

      <SmallSelector
        lbl="Perfil vivienda compra (art. 87)"
        value={data.viviendaPerfil}
        onChange={v => set("viviendaPerfil", v)}
        options={[
          { value: "general",   label: "General (18%, 1.530 \u20AC)" },
          { value: "municipio", label: "Mun. <4.000 (20%, 1.836 \u20AC)" },
          { value: "joven",     label: "<36 / Fam.num (25%, 2.346 \u20AC)" },
        ]}
        tooltipText="General: 18%/1.530 \u20AC. Municipio <4.000 hab.: 20%/1.836 \u20AC. Menores de 36 a\u00F1os y familias numerosas: 25%/2.346 \u20AC. Art. 87 NF 33/2013 (mod. NF 3/2025)."
        accent={accent}
        accentLight={accentLight}
      />

      {data.viviendaPerfil === "joven" && n(data.viviendaCompra) > 0 && (
        <div className="mb-5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={data.viviendaPrimerAnio}
              onChange={e => set("viviendaPrimerAnio", e.target.checked)}
              className="w-5 h-5 cursor-pointer rounded accent-current"
            />
            <div>
              <div className="text-sm font-medium" style={{ color: T.ink }}>
                Primer a\u00F1o de adquisici\u00F3n (art. 87.4ter)
              </div>
              <div className="text-xs mt-0.5" style={{ color: T.inkFaint }}>
                Sin l\u00EDmite m\u00E1ximo en la deducci\u00F3n para menores de 36 a\u00F1os
              </div>
            </div>
          </label>
        </div>
      )}

      <NumInput
        label="Alquiler vivienda habitual (art. 86)"
        value={data.alquilerAnual}
        onChange={v => set("alquilerAnual", v)}
        hint="Importe total del alquiler pagado en el a\u00F1o"
        tooltipText="Deducci\u00F3n por alquiler de vivienda habitual. General: 20% (m\u00E1x. 1.600 \u20AC). Mejorado: 35% (m\u00E1x. 2.800 \u20AC). Art. 86 NF 33/2013 (mod. NF 3/2025)."
        accent={accent}
        accentLight={accentLight}
      />

      <SmallSelector
        lbl="Perfil alquiler (art. 86)"
        value={data.alquilerPerfil}
        onChange={v => set("alquilerPerfil", v)}
        options={[
          { value: "general",  label: "General (20%, 1.600 \u20AC)" },
          { value: "mejorado", label: "Mejorado (35%, 2.800 \u20AC)" },
        ]}
        tooltipText="Perfil mejorado (35%/2.800 \u20AC) para: menores de 36 a\u00F1os, familias numerosas o monoparentales, discapacidad \u226565%, dependencia, v\u00EDctimas violencia de g\u00E9nero, o municipios en riesgo de despoblaci\u00F3n. Art. 86 NF 33/2013 (mod. NF 3/2025)."
        accent={accent}
        accentLight={accentLight}
      />

      {n(data.viviendaCompra) > 0 && n(data.alquilerAnual) > 0 && (
        <div className="text-xs py-1 font-medium" style={{ color: T.red }}>
          Normalmente no se aplican ambas deducciones simult\u00E1neamente (compra + alquiler)
        </div>
      )}
    </>
  );
}

export default function StepVivienda({ state, dispatch, showPersonB }) {
  return (
    <div className="space-y-6">
      <div className={showPersonB ? "grid grid-cols-1 md:grid-cols-2 gap-6" : ""}>
        <PersonCard
          letter="A"
          label="Persona A"
          subtitle="Vivienda habitual"
          accent={T.cobalt}
          accentLight={T.cobaltL}
        >
          <PersonViviendaFields
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
            subtitle="Vivienda habitual"
            accent={T.teal}
            accentLight={T.tealL}
          >
            <PersonViviendaFields
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
