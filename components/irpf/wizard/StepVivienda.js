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
              Vivienda habitual
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PersonViviendaFields — fields for one person
   ───────────────────────────────────────────────────────────────────────────── */
function PersonViviendaFields({ data, dispatch, actionType, accent, accentLight }) {
  const set = (field, value) => dispatch({ type: actionType, field, value });

  return (
    <>
      {/* Hipoteca */}
      <NumInput
        label="Pagos hipoteca anual (art. 87)"
        value={data.viviendaCompra}
        onChange={v => set("viviendaCompra", v)}
        hint="Amortización + intereses anuales"
        tooltipText="Deducción por adquisición de vivienda habitual. General: 18% (máx. 1.530 €). Mun. <4.000 hab.: 20% (máx. 1.836 €). <36 años / fam. num.: 25% (máx. 2.346 €). Art. 87 NF 33/2013 (mod. NF 3/2025)."
        accent={accent}
        accentLight={accentLight}
      />

      {/* Perfil vivienda compra */}
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

      {/* Primer año checkbox — only if perfil=joven and viviendaCompra > 0 */}
      {data.viviendaPerfil === "joven" && n(data.viviendaCompra) > 0 && (
        <div className="mb-3.5">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={data.viviendaPrimerAnio}
              onChange={e => set("viviendaPrimerAnio", e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-current"
            />
            <div>
              <div className="text-xs font-semibold" style={{ color: T.ink }}>
                Primer año de adquisición (art. 87.4ter)
              </div>
              <div className="text-[10px]" style={{ color: T.inkFaint }}>
                Sin límite máximo en la deducción para menores de 36 años
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Alquiler */}
      <NumInput
        label="Alquiler vivienda habitual (art. 86)"
        value={data.alquilerAnual}
        onChange={v => set("alquilerAnual", v)}
        hint="Importe total del alquiler pagado en el año"
        tooltipText="Deducción por alquiler de vivienda habitual. General: 20% (máx. 1.600 €). Mejorado: 35% (máx. 2.800 €). Art. 86 NF 33/2013 (mod. NF 3/2025)."
        accent={accent}
        accentLight={accentLight}
      />

      {/* Perfil alquiler */}
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

      {/* Warning: both mortgage and rent */}
      {data.viviendaCompra && data.alquilerAnual && (
        <div className="text-[10px] py-1" style={{ color: T.red }}>
          Normalmente no se aplican ambas deducciones simultáneamente (compra + alquiler)
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   StepVivienda — Step 3: "Vivienda" (optional)
   Mortgage and rent deductions
   ───────────────────────────────────────────────────────────────────────────── */
export default function StepVivienda({ state, dispatch, showPersonB }) {
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
          <PersonViviendaFields
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
