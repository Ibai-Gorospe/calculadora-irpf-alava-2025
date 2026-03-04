"use client";

import { T } from "../ui/tokens.js";
import { NumInput } from "../ui/NumInput.js";
import { SmallSelector } from "../ui/SmallSelector.js";
import { Tooltip } from "../ui/Tooltip.js";
import { PersonCard } from "../ui/PersonCard.js";
import HijosSelector from "./HijosSelector.js";

function DiscapacidadSelector({ value, onChange, accent }) {
  const row1 = [
    { value: "ninguna", label: "Sin discapacidad" },
    { value: "33-65",   label: "\u226533% <65%" },
    { value: "65+",     label: "\u226565% / Gr.I" },
  ];
  const row2 = [
    { value: "gradoII",  label: "Grado II severa (1.756,75 \u20AC)" },
    { value: "gradoIII", label: "Grado III gran dep. (2.191,03 \u20AC)" },
  ];

  const Btn = ({ opt }) => (
    <button
      onClick={() => onChange(opt.value)}
      className="py-3 px-3 text-[13px] font-medium rounded-xl cursor-pointer
                 transition-all duration-200 leading-tight min-h-[48px]"
      style={{
        background: value === opt.value ? accent : T.surface,
        color: value === opt.value ? "#fff" : T.inkMid,
        border: `1.5px solid ${value === opt.value ? accent : T.border}`,
        boxShadow: value === opt.value ? `0 4px 12px ${accent}30` : "none",
      }}
    >
      {opt.label}
    </button>
  );

  return (
    <div className="mb-5">
      <div className="text-[13px] font-medium mb-2.5 flex items-center gap-1.5" style={{ color: T.inkMid }}>
        Discapacidad / dependencia (arts. 23.3 + 82)
        <Tooltip text="Doble efecto: 1) Art. 23.3: incrementa bonificaci\u00F3n del trabajo (+100% \u226533%, +250% \u226565%). 2) Art. 82 NF 19/2024: deducci\u00F3n de cuota de 1.025,64 \u20AC (33-65%), 1.464,54 \u20AC (\u226565%/Grado I), 1.756,75 \u20AC (Grado II) o 2.191,03 \u20AC (Grado III)." />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {row1.map(opt => <Btn key={opt.value} opt={opt} />)}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {row2.map(opt => <Btn key={opt.value} opt={opt} />)}
      </div>
    </div>
  );
}

function DiscapFamiliarGradoSelector({ value, onChange, accent }) {
  const opts = [
    { value: "33-65",    label: "\u226533% <65% (1.025,64 \u20AC)" },
    { value: "65+",      label: "\u226565% / Gr.I (1.464,54 \u20AC)" },
    { value: "gradoII",  label: "Gr. II (1.756,75 \u20AC)" },
    { value: "gradoIII", label: "Gr. III (2.191,03 \u20AC)" },
  ];

  return (
    <div className="mb-5">
      <div className="text-[13px] font-medium mb-2.5 flex items-center gap-1.5" style={{ color: T.inkMid }}>
        Grado discapacidad del/los familiar/es
        <Tooltip text="Selecciona el grado de discapacidad/dependencia de los familiares convivientes. Si tienen grados diferentes, introduce cada uno por separado o selecciona el m\u00E1s bajo y a\u00F1ade manualmente la diferencia en 'Otras deducciones'." />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {opts.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="py-3 px-3 text-[13px] font-medium rounded-xl cursor-pointer
                       transition-all duration-200 leading-tight min-h-[48px]"
            style={{
              background: value === opt.value ? accent : T.surface,
              color: value === opt.value ? "#fff" : T.inkMid,
              border: `1.5px solid ${value === opt.value ? accent : T.border}`,
              boxShadow: value === opt.value ? `0 4px 12px ${accent}30` : "none",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PersonPersonalFields({ data, dispatch, actionType, accent, accentLight }) {
  const set = (field, value) => dispatch({ type: actionType, field, value });

  return (
    <>
      <SmallSelector
        lbl="Edad del contribuyente (art. 83)"
        value={data.edad}
        onChange={v => set("edad", v)}
        options={[
          { value: "menor65", label: "Menor de 65" },
          { value: "65-74",   label: "65-74 (385 \u20AC)" },
          { value: "75+",     label: "75+ (700 \u20AC)" },
        ]}
        tooltipText="Deducci\u00F3n por edad: 385 \u20AC (>65) o 700 \u20AC (>75), BI \u2264 20.000 \u20AC, fase-out hasta 30.000 \u20AC. Incompatible con deducci\u00F3n viudedad: se aplica la m\u00E1s beneficiosa. Art. 83 NF 33/2013."
        accent={accent}
        accentLight={accentLight}
      />

      <DiscapacidadSelector
        value={data.discapacidad}
        onChange={v => set("discapacidad", v)}
        accent={accent}
      />

      <SmallSelector
        lbl="Viudedad (art. 82 bis NF 3/2025)"
        value={data.viudedad ? "si" : "no"}
        onChange={v => set("viudedad", v === "si")}
        options={[
          { value: "no", label: "No aplica" },
          { value: "si", label: "Viudo/a (hasta 200 \u20AC)" },
        ]}
        tooltipText="Deducci\u00F3n de 200 \u20AC para contribuyentes viudos con BI \u2264 20.000 \u20AC, fase-out hasta 30.000 \u20AC. Incompatible con deducci\u00F3n por edad (art. 83): se aplica autom\u00E1ticamente la m\u00E1s beneficiosa."
        accent={accent}
        accentLight={accentLight}
      />

      {data.viudedad && data.edad !== "menor65" && (
        <div className="text-xs leading-relaxed pb-2 font-medium" style={{ color: T.gold }}>
          Viudedad y edad son incompatibles (art. 82 bis / art. 83). Se aplica autom\u00E1ticamente la m\u00E1s beneficiosa.
        </div>
      )}

      <SmallSelector
        lbl="Municipio (art. 77.2 despoblaci\u00F3n)"
        value={data.despoblacion ? "si" : "no"}
        onChange={v => set("despoblacion", v === "si")}
        options={[
          { value: "no", label: "Normal" },
          { value: "si", label: "\u2264500 hab. (+200 \u20AC)" },
        ]}
        tooltipText="Minoraci\u00F3n adicional de 200 \u20AC por residir en municipio con \u2264 500 habitantes. Art. 77.2 NF 19/2024."
        accent={accent}
        accentLight={accentLight}
      />

      <SmallSelector
        lbl="Ascendientes convivientes (art. 81)"
        value={String(data.ascendientes)}
        onChange={v => set("ascendientes", parseInt(v) || 0)}
        options={[
          { value: "0", label: "Ninguno" },
          { value: "1", label: "1 (423,72 \u20AC)" },
          { value: "2", label: "2 (847,44 \u20AC)" },
        ]}
        tooltipText="423,72 \u20AC por ascendiente que conviva permanentemente con el contribuyente, con rentas \u2264 SMI (16.576 \u20AC) y que no presente declaraci\u00F3n propia. Art. 81 NF 33/2013 (mod. NF 19/2024)."
        accent={accent}
        accentLight={accentLight}
      />

      <SmallSelector
        lbl="Cuidado menores/dependientes (art. 81 ter)"
        value={data.cuidado}
        onChange={v => set("cuidado", v)}
        options={[
          { value: "ninguno",        label: "No aplica" },
          { value: "empleado_hogar", label: "Empleado hogar (250 \u20AC)" },
          { value: "profesional",    label: "Profesional cert. (500 \u20AC)" },
        ]}
        tooltipText="Por contratar a un empleado del hogar para el cuidado de hijos <12 a\u00F1os o familiares dependientes/discapacitados. 250 \u20AC (general) o 500 \u20AC si el cuidador es profesional certificado. Art. 81 ter NF 3/2025."
        accent={accent}
        accentLight={accentLight}
      />

      <SmallSelector
        lbl="Familiares convivientes con discapacidad (art. 82)"
        value={String(data.discapFamiliar)}
        onChange={v => set("discapFamiliar", parseInt(v) || 0)}
        options={[
          { value: "0", label: "Ninguno" },
          { value: "1", label: "1 familiar" },
          { value: "2", label: "2 familiares" },
          { value: "3", label: "3 familiares" },
        ]}
        tooltipText="Deducci\u00F3n por cada familiar conviviente con discapacidad/dependencia reconocida. Mismos importes que para el contribuyente seg\u00FAn grado. Art. 82 NF 19/2024."
        accent={accent}
        accentLight={accentLight}
      />

      {data.discapFamiliar > 0 && (
        <DiscapFamiliarGradoSelector
          value={data.discapFamiliarGrado}
          onChange={v => set("discapFamiliarGrado", v)}
          accent={accent}
        />
      )}

      <NumInput
        label="Gasto asistente personal (art. 81 bis)"
        value={data.asistPersonal}
        onChange={v => set("asistPersonal", v)}
        hint="Para titulares de la prestaci\u00F3n de asistencia personal (DF 39/2014)"
        tooltipText="Deducci\u00F3n del 30% de las cantidades pagadas por contratar asistentes personales, con un m\u00E1ximo de 900 \u20AC anuales. Solo para titulares de la prestaci\u00F3n de asistencia personal del sistema de dependencia (DF 39/2014). Art. 81 bis NF 33/2013."
        accent={accent}
        accentLight={accentLight}
      />
    </>
  );
}

export default function StepPersonal({ state, dispatch, showPersonB }) {
  return (
    <div className="space-y-6">
      <PersonCard
        letter="H"
        label="Descendientes"
        subtitle="Hijos en com\u00FAn \u00B7 Art. 79 NF 33/2013"
        accent={T.gold}
        accentLight={T.goldL}
      >
        <HijosSelector
          value={state.hijos}
          onChange={v => dispatch({ type: "SET_HIJOS", value: v })}
          hijosM6={state.hijosM6}
          onChangeM6={v => dispatch({ type: "SET_HIJOS_M6", value: v })}
          hijos6a15={state.hijos6a15}
          onChangej6a15={v => dispatch({ type: "SET_HIJOS_6A15", value: v })}
          soloMode={!showPersonB}
        />
      </PersonCard>

      <div className={showPersonB ? "grid grid-cols-1 md:grid-cols-2 gap-6" : ""}>
        <PersonCard
          letter="A"
          label="Persona A"
          subtitle="Situaci\u00F3n personal y familiar"
          accent={T.cobalt}
          accentLight={T.cobaltL}
        >
          <PersonPersonalFields
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
            subtitle="Situaci\u00F3n personal y familiar"
            accent={T.teal}
            accentLight={T.tealL}
          >
            <PersonPersonalFields
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
