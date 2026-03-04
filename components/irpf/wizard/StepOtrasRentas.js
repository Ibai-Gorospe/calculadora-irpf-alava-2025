"use client";

import { useState } from "react";
import { n } from "../engine/helpers.js";
import { T } from "../ui/tokens.js";
import { NumInput } from "../ui/NumInput.js";
import { PersonCard } from "../ui/PersonCard.js";

function ToggleSection({ label, defaultOpen = false, hasData = false, children }) {
  const [open, setOpen] = useState(defaultOpen || hasData);

  return (
    <div className="mt-4">
      <label className="flex items-center gap-3 cursor-pointer select-none mb-4 group">
        <input
          type="checkbox"
          checked={open}
          onChange={e => setOpen(e.target.checked)}
          className="w-5 h-5 cursor-pointer rounded accent-current"
        />
        <span
          className="text-sm font-medium transition-colors duration-200"
          style={{ color: open ? T.ink : T.inkMid }}
        >
          {label}
        </span>
      </label>
      {open && (
        <div className="pl-3 border-l-2 ml-2.5 pb-1" style={{ borderColor: T.border }}>
          {children}
        </div>
      )}
    </div>
  );
}

function PersonOtrasRentasFields({ data, dispatch, actionType, accent, accentLight }) {
  const set = (field, value) => dispatch({ type: actionType, field, value });
  const hasOtrosRdtos = n(data.retribEspecie) > 0 || n(data.stockOptions) > 0 || n(data.rescatePension) > 0;

  return (
    <>
      {/* Capital Inmobiliario */}
      <div className="mb-5">
        <div className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: T.inkFaint }}>
          Capital inmobiliario &middot; Arts. 30-34 NF 33/2013
        </div>
        <NumInput
          label="Ingresos brutos por alquiler de inmuebles"
          value={data.ingresosCap_inm}
          onChange={v => set("ingresosCap_inm", v)}
          hint="Alquileres cobrados en 2025 antes de descontar gastos"
          tooltipText="Ingresos \u00EDntegros de bienes inmuebles arrendados. No incluyas el alquiler de tu propia vivienda habitual (eso es deducci\u00F3n, no ingreso). Art. 30 NF 33/2013."
          accent={accent}
          accentLight={accentLight}
        />
        <NumInput
          label="Gastos deducibles (IBI, seguros, reparaciones\u2026)"
          value={data.gastosCap_inm}
          onChange={v => set("gastosCap_inm", v)}
          hint="IBI, comunidad, seguro, intereses hipoteca del inmueble alquilado, reparaciones, amortizaci\u00F3n (3% del valor construcci\u00F3n)"
          tooltipText="Gastos necesarios: IBI, tasas, intereses de pr\u00E9stamos para adquirir el inmueble, gastos de conservaci\u00F3n y reparaci\u00F3n, primas de seguro, servicios y suministros, amortizaci\u00F3n del inmueble (3% del valor de construcci\u00F3n). Art. 32 NF 33/2013."
          accent={accent}
          accentLight={accentLight}
        />
        <div className="mb-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.esViviendaInq}
              onChange={e => set("esViviendaInq", e.target.checked)}
              className="w-5 h-5 cursor-pointer rounded accent-current"
            />
            <div>
              <div className="text-sm font-medium" style={{ color: T.ink }}>
                El inquilino lo usa como su vivienda habitual
              </div>
              <div className="text-xs mt-0.5" style={{ color: T.inkFaint }}>
                Reducci\u00F3n del 60% sobre el rendimiento neto positivo &middot; Art. 34 NF 33/2013
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Capital Mobiliario */}
      <div className="mb-5 pt-5 border-t" style={{ borderColor: T.border }}>
        <div className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: T.inkFaint }}>
          Capital mobiliario (base del ahorro) &middot; Arts. 35-38 NF 33/2013
        </div>
        <NumInput
          label="Rendimientos netos de capital mobiliario"
          value={data.capMob}
          onChange={v => set("capMob", v)}
          hint="Dividendos, intereses de cuentas y dep\u00F3sitos, rendimientos de bonos, seguros de ahorro\u2026"
          tooltipText="Dividendos, intereses de cuentas corrientes y dep\u00F3sitos, rendimientos de bonos y obligaciones, rendimientos de seguros de vida/ahorro. Introduce el importe neto (ya descontados gastos de administraci\u00F3n y custodia). Arts. 35-38 NF 33/2013."
          accent={accent}
          accentLight={accentLight}
        />
        <NumInput
          label="Retenciones sobre capital mobiliario"
          value={data.retCapMob}
          onChange={v => set("retCapMob", v)}
          hint="Figura en el certificado fiscal del banco (normalmente 19%)"
          tooltipText="Importe de las retenciones practicadas por el banco sobre dividendos, intereses, etc. Aparece en el certificado fiscal anual de tu entidad bancaria."
          accent={accent}
          accentLight={accentLight}
        />
      </div>

      {/* Ganancias Patrimoniales */}
      <div className="mb-5 pt-5 border-t" style={{ borderColor: T.border }}>
        <div className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: T.inkFaint }}>
          Ganancias/p\u00E9rdidas patrimoniales (base del ahorro) &middot; Arts. 43-59 NF 33/2013
        </div>
        <NumInput
          label="Saldo neto de ganancias/p\u00E9rdidas patrimoniales"
          value={data.gananciasPatr}
          onChange={v => set("gananciasPatr", v)}
          hint="Positivo = ganancias netas &middot; Negativo = p\u00E9rdidas netas &middot; Venta de acciones, fondos, inmuebles\u2026"
          tooltipText="Saldo neto resultante de sumar todas las ganancias y p\u00E9rdidas patrimoniales del a\u00F1o 2025 derivadas de transmisiones (venta de acciones, participaciones en fondos, inmuebles distintos de la vivienda habitual, etc.). Si el resultado global es negativo, introduce el valor negativo. Arts. 43-59 NF 33/2013."
          accent={accent}
          accentLight={accentLight}
        />
      </div>

      {/* Otros rendimientos del trabajo */}
      <div className="pt-5 border-t" style={{ borderColor: T.border }}>
        <ToggleSection label="Tengo otros rendimientos del trabajo" hasData={hasOtrosRdtos}>
          <div className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: T.inkFaint }}>
            Retribuciones en especie, stock options y rescates
          </div>

          <NumInput
            label="Retribuci\u00F3n en especie (art. 16)"
            value={data.retribEspecie}
            onChange={v => set("retribEspecie", v)}
            hint="Valoraci\u00F3n fiscal neta (uso veh\u00EDculo, seguro m\u00E9dico, etc.)"
            tooltipText="Retribuciones no dinerarias del trabajo: uso de veh\u00EDculo de empresa, seguro m\u00E9dico, vivienda, pr\u00E9stamos a tipo reducido, etc. Introduce la valoraci\u00F3n fiscal neta seg\u00FAn art. 16 NF 33/2013."
            accent={accent}
            accentLight={accentLight}
          />

          <NumInput
            label="Ganancias por stock options (art. 19)"
            value={data.stockOptions}
            onChange={v => set("stockOptions", v)}
            hint="Diferencia entre valor de mercado y precio de ejercicio"
            tooltipText="Ganancia obtenida al ejercitar opciones sobre acciones concedidas por la empresa. Diferencia entre el valor de mercado de las acciones en el momento de ejercicio y el precio pagado. Art. 19 NF 33/2013."
            accent={accent}
            accentLight={accentLight}
          />
          {n(data.stockOptions) > 0 && (
            <div className="mb-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.stockOptionsReduccion}
                  onChange={e => set("stockOptionsReduccion", e.target.checked)}
                  className="w-5 h-5 cursor-pointer rounded accent-current"
                />
                <div>
                  <div className="text-sm font-medium" style={{ color: T.ink }}>
                    Reducci\u00F3n 40% por renta irregular (art. 19.2)
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: T.inkFaint }}>
                    Periodo de generaci\u00F3n superior a 2 a\u00F1os
                  </div>
                </div>
              </label>
            </div>
          )}

          <NumInput
            label="Rescate planes pensiones / EPSV (art. 18)"
            value={data.rescatePension}
            onChange={v => set("rescatePension", v)}
            hint="Importe bruto rescatado en forma de capital"
            tooltipText="Prestaciones recibidas de planes de pensiones, EPSV, mutualidades, planes de previsi\u00F3n asegurados, etc. Introduce el importe bruto recibido en 2025. Art. 18 NF 33/2013."
            accent={accent}
            accentLight={accentLight}
          />
          {n(data.rescatePension) > 0 && (
            <div className="mb-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.rescatePensionReduccion}
                  onChange={e => set("rescatePensionReduccion", e.target.checked)}
                  className="w-5 h-5 cursor-pointer rounded accent-current"
                />
                <div>
                  <div className="text-sm font-medium" style={{ color: T.ink }}>
                    Reducci\u00F3n 40% aportaciones pre-2014
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: T.inkFaint }}>
                    Para la parte correspondiente a aportaciones anteriores a 01/01/2014
                  </div>
                </div>
              </label>
            </div>
          )}
        </ToggleSection>
      </div>
    </>
  );
}

export default function StepOtrasRentas({ state, dispatch, showPersonB }) {
  return (
    <div className="space-y-6">
      <div className={showPersonB ? "grid grid-cols-1 md:grid-cols-2 gap-6" : ""}>
        <PersonCard
          letter="A"
          label="Persona A"
          subtitle="Otras rentas y rendimientos"
          accent={T.cobalt}
          accentLight={T.cobaltL}
        >
          <PersonOtrasRentasFields
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
            subtitle="Otras rentas y rendimientos"
            accent={T.teal}
            accentLight={T.tealL}
          >
            <PersonOtrasRentasFields
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
