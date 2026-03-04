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
          tooltipText="Ingresos íntegros de bienes inmuebles arrendados. No incluyas el alquiler de tu propia vivienda habitual (eso es deducción, no ingreso). Art. 30 NF 33/2013."
          accent={accent}
          accentLight={accentLight}
        />
        <NumInput
          label="Gastos deducibles (IBI, seguros, reparaciones…)"
          value={data.gastosCap_inm}
          onChange={v => set("gastosCap_inm", v)}
          hint="IBI, comunidad, seguro, intereses hipoteca del inmueble alquilado, reparaciones, amortización (3% del valor construcción)"
          tooltipText="Gastos necesarios: IBI, tasas, intereses de préstamos para adquirir el inmueble, gastos de conservación y reparación, primas de seguro, servicios y suministros, amortización del inmueble (3% del valor de construcción). Art. 32 NF 33/2013."
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
                Reducción del 60% sobre el rendimiento neto positivo &middot; Art. 34 NF 33/2013
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
          hint="Dividendos, intereses de cuentas y depósitos, rendimientos de bonos, seguros de ahorro…"
          tooltipText="Dividendos, intereses de cuentas corrientes y depósitos, rendimientos de bonos y obligaciones, rendimientos de seguros de vida/ahorro. Introduce el importe neto (ya descontados gastos de administración y custodia). Arts. 35-38 NF 33/2013."
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
          Ganancias/pérdidas patrimoniales (base del ahorro) &middot; Arts. 43-59 NF 33/2013
        </div>
        <NumInput
          label="Saldo neto de ganancias/pérdidas patrimoniales"
          value={data.gananciasPatr}
          onChange={v => set("gananciasPatr", v)}
          hint="Positivo = ganancias netas &middot; Negativo = pérdidas netas &middot; Venta de acciones, fondos, inmuebles…"
          tooltipText="Saldo neto resultante de sumar todas las ganancias y pérdidas patrimoniales del año 2025 derivadas de transmisiones (venta de acciones, participaciones en fondos, inmuebles distintos de la vivienda habitual, etc.). Si el resultado global es negativo, introduce el valor negativo. Arts. 43-59 NF 33/2013."
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
            label="Retribución en especie (art. 16)"
            value={data.retribEspecie}
            onChange={v => set("retribEspecie", v)}
            hint="Valoración fiscal neta (uso vehículo, seguro médico, etc.)"
            tooltipText="Retribuciones no dinerarias del trabajo: uso de vehículo de empresa, seguro médico, vivienda, préstamos a tipo reducido, etc. Introduce la valoración fiscal neta según art. 16 NF 33/2013."
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
                    Reducción 40% por renta irregular (art. 19.2)
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: T.inkFaint }}>
                    Periodo de generación superior a 2 años
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
            tooltipText="Prestaciones recibidas de planes de pensiones, EPSV, mutualidades, planes de previsión asegurados, etc. Introduce el importe bruto recibido en 2025. Art. 18 NF 33/2013."
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
                    Reducción 40% aportaciones pre-2014
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
