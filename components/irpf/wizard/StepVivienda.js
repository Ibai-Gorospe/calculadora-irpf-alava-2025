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
        hint="Amortización + intereses anuales"
        tooltipText="Deducción por adquisición de vivienda habitual. General: 18% (máx. 1.530 €). Mun. <4.000 hab.: 20% (m\u00E1x. 1.836 \u20AC). <36 a\u00F1os / fam. num.: 25% (m\u00E1x. 2.346 \u20AC). Art. 87 NF 33/2013 (mod. NF 3/2025)."
        accent={accent}
        accentLight={accentLight}
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
                Primer año de adquisición (art. 87.4ter)
              </div>
              <div className="text-xs mt-0.5" style={{ color: T.inkFaint }}>
                Sin límite máximo en la deducción para menores de 36 años
              </div>
            </div>
          </label>
        </div>
      )}

      <NumInput
        label="Alquiler vivienda habitual (art. 86)"
        value={data.alquilerAnual}
        onChange={v => set("alquilerAnual", v)}
        hint="Importe total del alquiler pagado en el año"
        tooltipText="Deducción por alquiler de vivienda habitual. General: 20% (máx. 1.600 €). Mejorado: 35% (máx. 2.800 €). Art. 86 NF 33/2013 (mod. NF 3/2025)."
        accent={accent}
        accentLight={accentLight}
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
        accent={accent}
        accentLight={accentLight}
      />

      {n(data.viviendaCompra) > 0 && n(data.alquilerAnual) > 0 && (
        <div className="text-xs py-1 font-medium" style={{ color: T.red }}>
          Normalmente no se aplican ambas deducciones simultáneamente (compra + alquiler)
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
