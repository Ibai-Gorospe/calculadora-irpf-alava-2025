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
      className="py-2.5 px-3 text-sm font-medium rounded-lg cursor-pointer
                 transition-all duration-200 leading-tight"
      style={{
        background: value === opt.value ? accent : T.surface,
        color: value === opt.value ? "#fff" : T.inkMid,
        border: `1px solid ${value === opt.value ? accent : T.border}`,
      }}
    >
      {opt.label}
    </button>
  );

  return (
    <div className="mb-5">
      <div className="text-sm font-medium mb-2.5 flex items-center gap-1.5" style={{ color: T.inkMid }}>
        Discapacidad / dependencia (arts. 23.3 + 82)
        <Tooltip data={{
          title: "Discapacidad / dependencia",
          norm: "Arts. 23.3 + 82 NF 19/2024",
          iconColor: "cobalt",
          text: "Doble efecto: incrementa la bonificación del trabajo y genera una deducción directa en cuota.",
          rows: [
            { label: "≥33% <65%",          value: "1.025,64 €", highlight: true },
            { label: "≥65% / Grado I",     value: "1.464,54 €", highlight: true },
            { label: "Grado II severa",    value: "1.756,75 €", highlight: true },
            { label: "Grado III gran dep.",value: "2.191,03 €", highlight: true },
          ],
        }} />
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
    { value: "33-65",    label: "≥33% <65% (1.025,64 €)" },
    { value: "65+",      label: "≥65% / Gr.I (1.464,54 €)" },
    { value: "gradoII",  label: "Gr. II (1.756,75 €)" },
    { value: "gradoIII", label: "Gr. III (2.191,03 €)" },
  ];

  return (
    <div className="mb-5">
      <div className="text-sm font-medium mb-2.5 flex items-center gap-1.5" style={{ color: T.inkMid }}>
        Grado discapacidad del/los familiar/es
        <Tooltip data={{
          title: "Grado discapacidad familiar",
          norm: "Art. 82 NF 19/2024",
          iconColor: "cobalt",
          text: "Si los familiares convivientes tienen grados diferentes, selecciona el más frecuente.",
          rows: [
            { label: "≥33% <65%",          value: "1.025,64 €", highlight: true },
            { label: "≥65% / Grado I",     value: "1.464,54 €", highlight: true },
            { label: "Grado II severa",    value: "1.756,75 €", highlight: true },
            { label: "Grado III gran dep.",value: "2.191,03 €", highlight: true },
          ],
        }} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {opts.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="py-2.5 px-3 text-sm font-medium rounded-lg cursor-pointer
                       transition-all duration-200 leading-tight"
            style={{
              background: value === opt.value ? accent : T.surface,
              color: value === opt.value ? "#fff" : T.inkMid,
              border: `1px solid ${value === opt.value ? accent : T.border}`,
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
          { value: "65-74",   label: "65-74 (385 €)" },
          { value: "75+",     label: "75+ (700 €)" },
        ]}
        tooltipData={{
          title: "Deducción por edad",
          norm: "Art. 83 NF 33/2013",
          iconColor: "cobalt",
          rows: [
            { label: "Menor de 65 años",   value: "—" },
            { label: "Entre 65 y 74 años", value: "+ 385 €",  highlight: true },
            { label: "75 años o más",      value: "+ 700 €",  highlight: true },
          ],
          footnote: "Incompatible con deducción viudedad: se aplica la más beneficiosa. BI ≤ 20.000 €, fase-out hasta 30.000 €.",
        }}
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
          { value: "si", label: "Viudo/a (hasta 200 €)" },
        ]}
        tooltipData={{
          title: "Deducción por viudedad",
          norm: "Art. 82 bis NF 3/2025",
          iconColor: "cobalt",
          rows: [{ label: "Deducción máxima", value: "200 €", highlight: true }],
          footnote: "BI ≤ 20.000 €, fase-out hasta 30.000 €. Incompatible con deducción por edad.",
        }}
        accent={accent}
        accentLight={accentLight}
      />

      {data.viudedad && data.edad !== "menor65" && (
        <div className="text-xs leading-relaxed pb-2 font-medium" style={{ color: T.gold }}>
          Viudedad y edad son incompatibles (art. 82 bis / art. 83). Se aplica automáticamente la más beneficiosa.
        </div>
      )}

      <SmallSelector
        lbl="Municipio (art. 77.2 despoblación)"
        value={data.despoblacion ? "si" : "no"}
        onChange={v => set("despoblacion", v === "si")}
        options={[
          { value: "no", label: "Normal" },
          { value: "si", label: "≤500 hab. (+200 €)" },
        ]}
        tooltipData={{
          title: "Municipio de despoblación",
          norm: "Art. 77.2 NF 33/2013",
          iconColor: "cobalt",
          rows: [{ label: "Municipio ≤500 hab.", value: "+ 200 €", highlight: true }],
          footnote: "Deducción adicional por residencia en municipios en riesgo de despoblación.",
        }}
        accent={accent}
        accentLight={accentLight}
      />

      <SmallSelector
        lbl="Ascendientes convivientes (art. 81)"
        value={String(data.ascendientes)}
        onChange={v => set("ascendientes", parseInt(v) || 0)}
        options={[
          { value: "0", label: "Ninguno" },
          { value: "1", label: "1 (423,72 €)" },
          { value: "2", label: "2 (847,44 €)" },
        ]}
        tooltipData={{
          title: "Ascendientes convivientes",
          norm: "Art. 81 NF 33/2013",
          iconColor: "cobalt",
          text: "Padres o abuelos mayores de 65 años (o con discapacidad) que conviven contigo y tienen rentas ≤ SMI.",
        }}
        accent={accent}
        accentLight={accentLight}
      />

      <SmallSelector
        lbl="Cuidado menores/dependientes (art. 81 ter)"
        value={data.cuidado}
        onChange={v => set("cuidado", v)}
        options={[
          { value: "ninguno",        label: "No aplica" },
          { value: "empleado_hogar", label: "Empleado hogar (250 €)" },
          { value: "profesional",    label: "Profesional cert. (500 €)" },
        ]}
        tooltipData={{
          title: "Cuidado menores/dependientes",
          norm: "Art. 81 ter NF 3/2025",
          iconColor: "cobalt",
          text: "Por contratar a un empleado del hogar para el cuidado de hijos <12 años o familiares dependientes/discapacitados.",
          rows: [
            { label: "Empleado hogar",        value: "250 €", highlight: true },
            { label: "Profesional certificado",value: "500 €", highlight: true },
          ],
        }}
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
        tooltipData={{
          title: "Familiares con discapacidad",
          norm: "Art. 82 NF 19/2024",
          iconColor: "cobalt",
          text: "Deducción por cada familiar conviviente con discapacidad/dependencia reconocida. Mismos importes que para el contribuyente según grado.",
        }}
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
        hint="Para titulares de la prestación de asistencia personal (DF 39/2014)"
        tooltipData={{
          title: "Gasto asistente personal",
          norm: "Art. 81 bis NF 33/2013",
          iconColor: "cobalt",
          text: "Deducción del 30% de las cantidades pagadas por contratar asistentes personales.",
          footnote: "Máximo 900 €/año. Solo para titulares de la prestación de asistencia personal (DF 39/2014).",
        }}
        accent={accent}
        accentLight={accentLight}
      />
    </>
  );
}

export default function StepPersonal({ state, dispatch, showPersonB }) {
  return (
    <div className="space-y-8">
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
