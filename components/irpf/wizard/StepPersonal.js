"use client";

import { T } from "../ui/tokens.js";
import { NumInput } from "../ui/NumInput.js";
import { SmallSelector } from "../ui/SmallSelector.js";
import { Tooltip } from "../ui/Tooltip.js";
import { PersonCard } from "../ui/PersonCard.js";
import HijosSelector from "./HijosSelector.js";

/* ─────────────────────────────────────────────────────────────────────────────
   DiscapacidadSelector — 5 options in 3+2 grid
   ───────────────────────────────────────────────────────────────────────────── */
function DiscapacidadSelector({ value, onChange, accent }) {
  const row1 = [
    { value: "ninguna", label: "Sin discapacidad" },
    { value: "33-65",   label: "≥33% <65%" },
    { value: "65+",     label: "≥65% / Gr.I" },
  ];
  const row2 = [
    { value: "gradoII",  label: "Grado II severa (1.756,75 €)" },
    { value: "gradoIII", label: "Grado III gran dep. (2.191,03 €)" },
  ];

  const Btn = ({ opt }) => (
    <button
      onClick={() => onChange(opt.value)}
      className="py-3.5 px-3 text-[13px] font-semibold rounded-xl cursor-pointer transition-all duration-150 leading-tight min-h-[52px]"
      style={{
        background: value === opt.value ? accent : T.surface,
        color: value === opt.value ? "#fff" : T.inkMid,
        border: `1.5px solid ${value === opt.value ? accent : T.border}`,
        fontFamily: T.fontSerif,
      }}
    >
      {opt.label}
    </button>
  );

  return (
    <div className="mb-6">
      <div
        className="text-[13px] font-semibold mb-2.5 flex items-center gap-1"
        style={{ color: T.inkMid }}
      >
        Discapacidad / dependencia (arts. 23.3 + 82)
        <Tooltip text="Doble efecto: 1) Art. 23.3: incrementa bonificación del trabajo (+100% ≥33%, +250% ≥65%). 2) Art. 82 NF 19/2024: deducción de cuota de 1.025,64 € (33-65%), 1.464,54 € (≥65%/Grado I), 1.756,75 € (Grado II) o 2.191,03 € (Grado III)." />
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

/* ─────────────────────────────────────────────────────────────────────────────
   DiscapFamiliarGradoSelector — 4 options in 2x2 grid
   ───────────────────────────────────────────────────────────────────────────── */
function DiscapFamiliarGradoSelector({ value, onChange, accent }) {
  const opts = [
    { value: "33-65",    label: "≥33% <65% (1.025,64 €)" },
    { value: "65+",      label: "≥65% / Gr.I (1.464,54 €)" },
    { value: "gradoII",  label: "Gr. II (1.756,75 €)" },
    { value: "gradoIII", label: "Gr. III (2.191,03 €)" },
  ];

  return (
    <div className="mb-6">
      <div
        className="text-[13px] font-semibold mb-2.5 flex items-center gap-1"
        style={{ color: T.inkMid }}
      >
        Grado discapacidad del/los familiar/es
        <Tooltip text="Selecciona el grado de discapacidad/dependencia de los familiares convivientes. Si tienen grados diferentes, introduce cada uno por separado o selecciona el más bajo y añade manualmente la diferencia en 'Otras deducciones'." />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {opts.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="py-3.5 px-3 text-[13px] font-semibold rounded-xl cursor-pointer transition-all duration-150 leading-tight min-h-[52px]"
            style={{
              background: value === opt.value ? accent : T.surface,
              color: value === opt.value ? "#fff" : T.inkMid,
              border: `1.5px solid ${value === opt.value ? accent : T.border}`,
              fontFamily: T.fontSerif,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PersonPersonalFields — fields for one person
   ───────────────────────────────────────────────────────────────────────────── */
function PersonPersonalFields({ data, dispatch, actionType, accent, accentLight }) {
  const set = (field, value) => dispatch({ type: actionType, field, value });

  return (
    <>
      {/* Edad */}
      <SmallSelector
        lbl="Edad del contribuyente (art. 83)"
        value={data.edad}
        onChange={v => set("edad", v)}
        options={[
          { value: "menor65", label: "Menor de 65" },
          { value: "65-74",   label: "65-74 (385 €)" },
          { value: "75+",     label: "75+ (700 €)" },
        ]}
        tooltipText="Deducción por edad: 385 € (>65) o 700 € (>75), BI ≤ 20.000 €, fase-out hasta 30.000 €. Incompatible con deducción viudedad: se aplica la más beneficiosa. Art. 83 NF 33/2013."
        accent={accent}
        accentLight={accentLight}
      />

      {/* Discapacidad */}
      <DiscapacidadSelector
        value={data.discapacidad}
        onChange={v => set("discapacidad", v)}
        accent={accent}
      />

      {/* Viudedad */}
      <SmallSelector
        lbl="Viudedad (art. 82 bis NF 3/2025)"
        value={data.viudedad ? "si" : "no"}
        onChange={v => set("viudedad", v === "si")}
        options={[
          { value: "no", label: "No aplica" },
          { value: "si", label: "Viudo/a (hasta 200 €)" },
        ]}
        tooltipText="Deducción de 200 € para contribuyentes viudos con BI ≤ 20.000 €, fase-out hasta 30.000 €. Incompatible con deducción por edad (art. 83): se aplica automáticamente la más beneficiosa."
        accent={accent}
        accentLight={accentLight}
      />

      {/* Warning: viudedad + edad */}
      {data.viudedad && data.edad !== "menor65" && (
        <div className="text-xs leading-relaxed pb-2" style={{ color: T.gold }}>
          Viudedad y edad son incompatibles (art. 82 bis / art. 83). Se aplica automáticamente la más beneficiosa.
        </div>
      )}

      {/* Despoblación */}
      <SmallSelector
        lbl="Municipio (art. 77.2 despoblación)"
        value={data.despoblacion ? "si" : "no"}
        onChange={v => set("despoblacion", v === "si")}
        options={[
          { value: "no", label: "Normal" },
          { value: "si", label: "≤500 hab. (+200 €)" },
        ]}
        tooltipText="Minoración adicional de 200 € por residir en municipio con ≤ 500 habitantes. Art. 77.2 NF 19/2024."
        accent={accent}
        accentLight={accentLight}
      />

      {/* Ascendientes */}
      <SmallSelector
        lbl="Ascendientes convivientes (art. 81)"
        value={String(data.ascendientes)}
        onChange={v => set("ascendientes", parseInt(v) || 0)}
        options={[
          { value: "0", label: "Ninguno" },
          { value: "1", label: "1 (423,72 €)" },
          { value: "2", label: "2 (847,44 €)" },
        ]}
        tooltipText="423,72 € por ascendiente que conviva permanentemente con el contribuyente, con rentas ≤ SMI (16.576 €) y que no presente declaración propia. Art. 81 NF 33/2013 (mod. NF 19/2024)."
        accent={accent}
        accentLight={accentLight}
      />

      {/* Cuidado menores/dependientes */}
      <SmallSelector
        lbl="Cuidado menores/dependientes (art. 81 ter)"
        value={data.cuidado}
        onChange={v => set("cuidado", v)}
        options={[
          { value: "ninguno",        label: "No aplica" },
          { value: "empleado_hogar", label: "Empleado hogar (250 €)" },
          { value: "profesional",    label: "Profesional cert. (500 €)" },
        ]}
        tooltipText="Por contratar a un empleado del hogar para el cuidado de hijos <12 años o familiares dependientes/discapacitados. 250 € (general) o 500 € si el cuidador es profesional certificado. Art. 81 ter NF 3/2025."
        accent={accent}
        accentLight={accentLight}
      />

      {/* Discapacidad familiares */}
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
        tooltipText="Deducción por cada familiar conviviente con discapacidad/dependencia reconocida. Mismos importes que para el contribuyente según grado. Art. 82 NF 19/2024."
        accent={accent}
        accentLight={accentLight}
      />

      {/* Grade selector for disabled family members */}
      {data.discapFamiliar > 0 && (
        <DiscapFamiliarGradoSelector
          value={data.discapFamiliarGrado}
          onChange={v => set("discapFamiliarGrado", v)}
          accent={accent}
        />
      )}

      {/* Asistente personal */}
      <NumInput
        label="Gasto asistente personal (art. 81 bis)"
        value={data.asistPersonal}
        onChange={v => set("asistPersonal", v)}
        hint="Para titulares de la prestación de asistencia personal (DF 39/2014)"
        tooltipText="Deducción del 30% de las cantidades pagadas por contratar asistentes personales, con un máximo de 900 € anuales. Solo para titulares de la prestación de asistencia personal del sistema de dependencia (DF 39/2014). Art. 81 bis NF 33/2013."
        accent={accent}
        accentLight={accentLight}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   StepPersonal — Step 2: "Situación personal"
   ───────────────────────────────────────────────────────────────────────────── */
export default function StepPersonal({ state, dispatch, showPersonB }) {
  return (
    <div className="space-y-6">
      {/* Hijos selector (shared between persons) */}
      <PersonCard
        letter="H"
        label="Descendientes"
        subtitle="Hijos en común · Art. 79 NF 33/2013"
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

      {/* Person cards side by side */}
      <div className={showPersonB ? "grid grid-cols-1 md:grid-cols-2 gap-6" : ""}>
        <PersonCard
          letter="A"
          label="Persona A"
          subtitle="Situación personal y familiar"
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
            subtitle="Situación personal y familiar"
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
