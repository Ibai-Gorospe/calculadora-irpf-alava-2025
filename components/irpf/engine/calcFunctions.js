// ═══════════════════════════════════════════════════════════════════════════════
// MOTOR FISCAL — NF 33/2013 + NF 19/2024 + NF 3/2025 — Álava 2025
// ═══════════════════════════════════════════════════════════════════════════════

import {
  SS_PCT_INDEF, SS_PCT_TEMP, SS_BASE_MAX,
  COMP_M6, COMP_6A15, MINORACION, MINORACION_DESPOBLACION,
  RED_CONJUNTA, DEDUC_EDAD_65, DEDUC_EDAD_75,
  DEDUC_ASCENDIENTE, DEDUC_DISCAP_CUOTA, DEDUC_HIJOS,
  ALIMENTOS_PCT, ALIMENTOS_LIMITE_PCT,
  DONACIONES_PCT, DONACIONES_PRIORIT_PCT, DONACIONES_BASE_MAX_PCT,
  INVERSION_NUEVA_PCT, INVERSION_NUEVA_MAX,
  ESCALA_GRAL, ESCALA_AHORRO,
} from "./constants.js";

// Art. 77.3 NF 19/2024: minoración extraordinaria para BL ≤ 35.000 €
export function minoracionExtraordinaria(bl) {
  if (bl <= 30000) return 200;
  if (bl < 35000) return Math.max(0, +(200 - 0.04 * (bl - 30000)).toFixed(2));
  return 0;
}

export function calcSS(bruto, tipoContrato) {
  const pct = tipoContrato === "temporal" ? SS_PCT_TEMP : SS_PCT_INDEF;
  return +(Math.min(bruto, SS_BASE_MAX) * pct).toFixed(2);
}

export function bonificacionArt23(dif, discapacidad = "ninguna", rentasNoLab = 0) {
  if (rentasNoLab > 7500) return 3000;
  let bonif;
  if (dif <= 0)          bonif = 0;
  else if (dif <= 14800) bonif = Math.min(8000, dif);
  else if (dif <= 23000) bonif = Math.max(0, 8000 - 0.6098 * (dif - 14800));
  else                   bonif = 3000;
  if (discapacidad === "33-65") bonif *= 2;
  else if (discapacidad === "65+") bonif *= 3.5;
  return bonif;
}

export function cuotaEscala(bl) {
  if (bl <= 0) return 0;
  for (let i = ESCALA_GRAL.length - 1; i >= 0; i--) {
    const [desde, , acum, tipo] = ESCALA_GRAL[i];
    if (bl >= desde) return +(acum + (bl - desde) * tipo).toFixed(2);
  }
  return 0;
}

export function tipoMarginal(bl) {
  for (let i = ESCALA_GRAL.length - 1; i >= 0; i--)
    if (bl >= ESCALA_GRAL[i][0]) return ESCALA_GRAL[i][3];
  return 0.23;
}

export function deducHijosTotal(num, hijosM6 = 0, hijos6a15 = 0) {
  const base = DEDUC_HIJOS.slice(0, Math.min(num, DEDUC_HIJOS.length)).reduce((a, b) => a + b, 0);
  return base + hijosM6 * COMP_M6 + hijos6a15 * COMP_6A15;
}

export function deducViudedad(bi) {
  if (bi <= 20000) return 200;
  if (bi <= 30000) return Math.max(0, 200 - 0.02 * (bi - 20000));
  return 0;
}

export function deducViviendaCompra(cantidadAnual, perfil = "general", primerAnio = false) {
  if (cantidadAnual <= 0) return 0;
  const pct = perfil === "joven" ? 0.25 : perfil === "municipio" ? 0.20 : 0.18;
  const max = (perfil === "joven" && primerAnio) ? Infinity : (perfil === "joven" ? 2346 : perfil === "municipio" ? 1836 : 1530);
  return Math.min(+(cantidadAnual * pct).toFixed(2), max);
}

export function deducAlquiler(alquilerAnual, perfil = "general") {
  if (alquilerAnual <= 0) return 0;
  const pct = perfil === "mejorado" ? 0.35 : 0.20;
  const max = perfil === "mejorado" ? 2800 : 1600;
  return Math.min(+(alquilerAnual * pct).toFixed(2), max);
}

export function deducEdad(edad, bi) {
  if (!edad || edad === "menor65") return 0;
  const base = edad === "75+" ? DEDUC_EDAD_75 : DEDUC_EDAD_65;
  const coef = edad === "75+" ? 0.07 : 0.0385;
  if (bi <= 20000) return base;
  if (bi < 30000) return Math.max(0, +(base - coef * (bi - 20000)).toFixed(2));
  return 0;
}

export function deducDiscapCuota(discapacidad) {
  return DEDUC_DISCAP_CUOTA[discapacidad] || 0;
}

export function cuotaEscalaAhorro(ba) {
  if (ba <= 0) return 0;
  for (let i = ESCALA_AHORRO.length - 1; i >= 0; i--) {
    const [desde, , acum, tipo] = ESCALA_AHORRO[i];
    if (ba >= desde) return +(acum + (ba - desde) * tipo).toFixed(2);
  }
  return 0;
}

export function calcCapInm(ingresos, gastos, esVivienda) {
  const rci = ingresos - gastos;
  if (rci <= 0) return 0;
  return esVivienda ? +(rci * 0.40).toFixed(2) : +rci.toFixed(2);
}

export function reduccionIrregular(importe, aplicaReduccion) {
  if (!aplicaReduccion || importe <= 0) return importe;
  return +(importe * 0.60).toFixed(2);
}

export function deducAlimentos(alimentosPagados, numHijosAlimentos) {
  if (alimentosPagados <= 0 || numHijosAlimentos <= 0) return 0;
  const limiteTotal = DEDUC_HIJOS.slice(0, Math.min(numHijosAlimentos, DEDUC_HIJOS.length))
    .reduce((sum, d) => sum + d * ALIMENTOS_LIMITE_PCT, 0);
  return Math.min(+(alimentosPagados * ALIMENTOS_PCT).toFixed(2), +limiteTotal.toFixed(2));
}

export function deducDiscapFamiliar(numFamiliares, grado) {
  if (numFamiliares <= 0 || !grado || grado === "ninguna") return 0;
  return +((DEDUC_DISCAP_CUOTA[grado] || 0) * numFamiliares).toFixed(2);
}

export function deducDonaciones(donaciones, baseLiquidable, esPrioritaria = false) {
  if (donaciones <= 0) return 0;
  const baseMaxima = baseLiquidable * DONACIONES_BASE_MAX_PCT;
  const baseDeduccion = Math.min(donaciones, baseMaxima);
  const pct = esPrioritaria ? DONACIONES_PRIORIT_PCT : DONACIONES_PCT;
  return +(baseDeduccion * pct).toFixed(2);
}

export function deducInversion(inversion) {
  if (inversion <= 0) return 0;
  return Math.min(+(inversion * INVERSION_NUEVA_PCT).toFixed(2), INVERSION_NUEVA_MAX);
}

// Cálculo individual de una persona
export function calcPersona({
  bruto, ret, redExtra, hijosShare,
  tipoContrato = "indefinido", rentasNoLab = 0, discapacidad = "ninguna",
  viudedad = false, cuidado = "ninguno", otrasDeducNF3 = 0,
  viviendaCompra = 0, viviendaPerfil = "general",
  alquilerAnual = 0, alquilerPerfil = "general",
  edad = "menor65", despoblacion = false, ascendientes = 0,
  ingresosCap_inm = 0, gastosCap_inm = 0, esViviendaInq = false,
  capMob = 0, retCapMob = 0, gananciasPatr = 0,
  retribEspecie = 0, stockOptions = 0, stockOptionsReduccion = false,
  rescatePension = 0, rescatePensionReduccion = false,
  anualidadesAlimentos = 0, numHijosAlimentos = 0,
  discapFamiliar = 0, discapFamiliarGrado = "ninguna",
  asistPersonal = 0,
  viviendaPrimerAnio = false,
  donaciones = 0, donacionesPrioritarias = false, inversionNuevaCreacion = 0,
}) {
  const ss       = calcSS(bruto, tipoContrato);
  const stockOptsNeto = reduccionIrregular(stockOptions, stockOptionsReduccion);
  const rescateNeto = reduccionIrregular(rescatePension, rescatePensionReduccion);
  const otrosRdtosTrabajo = retribEspecie + stockOptsNeto + rescateNeto;
  const brutoFiscal = bruto + otrosRdtosTrabajo;
  const dif      = Math.max(0, brutoFiscal - ss);
  const rciNeto  = calcCapInm(ingresosCap_inm, gastosCap_inm, esViviendaInq);
  const totalRentasNoLab = rentasNoLab + rciNeto + Math.max(0, capMob) + Math.max(0, gananciasPatr);
  const bonif    = bonificacionArt23(dif, discapacidad, totalRentasNoLab);
  const rnt      = Math.max(0, dif - bonif);
  const bi       = Math.max(0, rnt + rciNeto - redExtra);
  const bl       = bi;
  const ci_gral  = cuotaEscala(bl);
  const ba       = Math.max(0, capMob + gananciasPatr);
  const ci_ahorro = cuotaEscalaAhorro(ba);
  const ci       = +(ci_gral + ci_ahorro).toFixed(2);
  const minExtra = minoracionExtraordinaria(bl);
  const minTotal = MINORACION + (despoblacion ? MINORACION_DESPOBLACION : 0) + minExtra;
  const pm       = Math.max(0, ci - minTotal);
  const dedH     = +(hijosShare).toFixed(2);
  const biTotal  = bi + ba;
  const dedViudRaw  = viudedad ? deducViudedad(biTotal) : 0;
  const dedEdadRaw  = deducEdad(edad, biTotal);
  const dedViud  = viudedad && dedViudRaw >= dedEdadRaw ? dedViudRaw : 0;
  const dedEdad  = !viudedad || dedEdadRaw > dedViudRaw ? dedEdadRaw : 0;
  const dedDiscap = deducDiscapCuota(discapacidad);
  const dedCuid  = cuidado === "profesional" ? 500 : cuidado === "empleado_hogar" ? 250 : 0;
  const dedOtras = +otrasDeducNF3;
  const dedViv   = deducViviendaCompra(viviendaCompra, viviendaPerfil, viviendaPrimerAnio);
  const dedAlq   = deducAlquiler(alquilerAnual, alquilerPerfil);
  const dedAsc   = +(ascendientes * DEDUC_ASCENDIENTE).toFixed(2);
  const dedAlim      = deducAlimentos(anualidadesAlimentos, numHijosAlimentos);
  const dedDiscapFam = deducDiscapFamiliar(discapFamiliar, discapFamiliarGrado);
  const dedAsistPers = Math.min(Math.max(0, +asistPersonal) * 0.30, 900);
  const dedDon       = deducDonaciones(donaciones, bl, donacionesPrioritarias);
  const dedInv       = deducInversion(inversionNuevaCreacion);
  const cl       = Math.max(0, pm - dedH - dedViud - dedEdad - dedDiscap - dedCuid - dedOtras - dedViv - dedAlq - dedAsc - dedAlim - dedDiscapFam - dedAsistPers - dedDon - dedInv);
  const resultado = +(ret + retCapMob - cl).toFixed(2);
  const ingresosTotal = brutoFiscal + rciNeto + Math.max(0, capMob) + Math.max(0, gananciasPatr);
  const teReal   = ingresosTotal > 0 ? cl / ingresosTotal : 0;
  const teRet    = brutoFiscal > 0 ? (ret + retCapMob) / ingresosTotal : 0;
  return { bruto: brutoFiscal, brutoSalario: bruto, ret, ss, dif, bonif, rnt, rciNeto, bi, bl, ba, ci_gral, ci_ahorro, ci, minExtra, minTotal, pm, dedH, dedViud, dedEdad, dedDiscap, dedCuid, dedOtras, dedViv, dedAlq, dedAsc, dedAlim, dedDiscapFam, dedAsistPers, dedDon, dedInv, cl, resultado, teReal, teRet, redExtra, retCapMob, otrosRdtosTrabajo };
}

// Cálculo declaración conjunta
export function calcConjunta({
  brutoA, retA, redExtraA, brutoB, retB, redExtraB, hijosTotal,
  tipoContratoA = "indefinido", rentasNoLabA = 0, discapacidadA = "ninguna",
  viudedadA = false, cuidadoA = "ninguno", otrasDeducNF3A = 0,
  viviendaCompraA = 0, viviendaPerfilA = "general",
  alquilerAnualA = 0, alquilerPerfilA = "general",
  edadA = "menor65", despoblacionA = false, ascendientesA = 0,
  tipoContratoB = "indefinido", rentasNoLabB = 0, discapacidadB = "ninguna",
  viudedadB = false, cuidadoB = "ninguno", otrasDeducNF3B = 0,
  viviendaCompraB = 0, viviendaPerfilB = "general",
  alquilerAnualB = 0, alquilerPerfilB = "general",
  edadB = "menor65", despoblacionB = false, ascendientesB = 0,
  ingresosCap_inmA = 0, gastosCap_inmA = 0, esViviendaInqA = false,
  capMobA = 0, retCapMobA = 0, gananciasPatrA = 0,
  ingresosCap_inmB = 0, gastosCap_inmB = 0, esViviendaInqB = false,
  capMobB = 0, retCapMobB = 0, gananciasPatrB = 0,
  retribEspecieA = 0, stockOptionsA = 0, stockOptionsReduccionA = false,
  rescatePensionA = 0, rescatePensionReduccionA = false,
  retribEspecieB = 0, stockOptionsB = 0, stockOptionsReduccionB = false,
  rescatePensionB = 0, rescatePensionReduccionB = false,
  anualidadesAlimentosA = 0, numHijosAlimentosA = 0,
  anualidadesAlimentosB = 0, numHijosAlimentosB = 0,
  discapFamiliarA = 0, discapFamiliarGradoA = "ninguna",
  discapFamiliarB = 0, discapFamiliarGradoB = "ninguna",
  asistPersonalA = 0, asistPersonalB = 0,
  viviendaPrimerAnioA = false, viviendaPrimerAnioB = false,
  donacionesA = 0, donacionesPrioritariasA = false, inversionNuevaCreacionA = 0,
  donacionesB = 0, donacionesPrioritariasB = false, inversionNuevaCreacionB = 0,
}) {
  const ssA   = calcSS(brutoA, tipoContratoA);
  const ssB   = calcSS(brutoB, tipoContratoB);
  const otrosRdtosA = retribEspecieA + reduccionIrregular(stockOptionsA, stockOptionsReduccionA) + reduccionIrregular(rescatePensionA, rescatePensionReduccionA);
  const otrosRdtosB = retribEspecieB + reduccionIrregular(stockOptionsB, stockOptionsReduccionB) + reduccionIrregular(rescatePensionB, rescatePensionReduccionB);
  const brutoFiscalA = brutoA + otrosRdtosA;
  const brutoFiscalB = brutoB + otrosRdtosB;
  const difA  = Math.max(0, brutoFiscalA - ssA);
  const difB  = Math.max(0, brutoFiscalB - ssB);
  const rciNetoA = calcCapInm(ingresosCap_inmA, gastosCap_inmA, esViviendaInqA);
  const rciNetoB = calcCapInm(ingresosCap_inmB, gastosCap_inmB, esViviendaInqB);
  const totalRentasNoLabA = rentasNoLabA + rciNetoA + Math.max(0, capMobA) + Math.max(0, gananciasPatrA);
  const totalRentasNoLabB = rentasNoLabB + rciNetoB + Math.max(0, capMobB) + Math.max(0, gananciasPatrB);
  const bonA  = bonificacionArt23(difA, discapacidadA, totalRentasNoLabA);
  const bonB  = bonificacionArt23(difB, discapacidadB, totalRentasNoLabB);
  const rntA  = Math.max(0, difA - bonA);
  const rntB  = Math.max(0, difB - bonB);
  const biSum = Math.max(0, rntA + rciNetoA + rntB + rciNetoB - redExtraA - redExtraB);
  const bl    = Math.max(0, biSum - RED_CONJUNTA);
  const ci_gral = cuotaEscala(bl);
  const ba    = Math.max(0, capMobA + capMobB + gananciasPatrA + gananciasPatrB);
  const ci_ahorro = cuotaEscalaAhorro(ba);
  const ci    = +(ci_gral + ci_ahorro).toFixed(2);
  const minDesp = (despoblacionA || despoblacionB) ? MINORACION_DESPOBLACION : 0;
  const minExtra = minoracionExtraordinaria(bl);
  const minTotal = MINORACION + minDesp + minExtra;
  const pm    = Math.max(0, ci - minTotal);
  const dedH  = hijosTotal;
  const biA      = Math.max(0, rntA + rciNetoA - redExtraA);
  const biB      = Math.max(0, rntB + rciNetoB - redExtraB);
  const biTotalA = biA + Math.max(0, capMobA + gananciasPatrA);
  const biTotalB = biB + Math.max(0, capMobB + gananciasPatrB);
  const dedViudRawA = viudedadA ? deducViudedad(biTotalA) : 0;
  const dedEdadRawA = deducEdad(edadA, biTotalA);
  const dedViudA = viudedadA && dedViudRawA >= dedEdadRawA ? dedViudRawA : 0;
  const dedEdadA = !viudedadA || dedEdadRawA > dedViudRawA ? dedEdadRawA : 0;
  const dedViudRawB = viudedadB ? deducViudedad(biTotalB) : 0;
  const dedEdadRawB = deducEdad(edadB, biTotalB);
  const dedViudB = viudedadB && dedViudRawB >= dedEdadRawB ? dedViudRawB : 0;
  const dedEdadB = !viudedadB || dedEdadRawB > dedViudRawB ? dedEdadRawB : 0;
  const dedViud  = dedViudA + dedViudB;
  const dedEdad  = dedEdadA + dedEdadB;
  const dedDiscap = deducDiscapCuota(discapacidadA) + deducDiscapCuota(discapacidadB);
  const dedCuid  = (cuidadoA === "profesional" ? 500 : cuidadoA === "empleado_hogar" ? 250 : 0)
                 + (cuidadoB === "profesional" ? 500 : cuidadoB === "empleado_hogar" ? 250 : 0);
  const dedOtras = +otrasDeducNF3A + +otrasDeducNF3B;
  const dedViv   = deducViviendaCompra(viviendaCompraA, viviendaPerfilA, viviendaPrimerAnioA) + deducViviendaCompra(viviendaCompraB, viviendaPerfilB, viviendaPrimerAnioB);
  const dedAlq   = deducAlquiler(alquilerAnualA, alquilerPerfilA) + deducAlquiler(alquilerAnualB, alquilerPerfilB);
  const dedAsc   = +((ascendientesA + ascendientesB) * DEDUC_ASCENDIENTE).toFixed(2);
  const dedAlim      = deducAlimentos(anualidadesAlimentosA, numHijosAlimentosA) + deducAlimentos(anualidadesAlimentosB, numHijosAlimentosB);
  const dedDiscapFam = deducDiscapFamiliar(discapFamiliarA, discapFamiliarGradoA) + deducDiscapFamiliar(discapFamiliarB, discapFamiliarGradoB);
  const dedAsistPers = Math.min(Math.max(0, +asistPersonalA) * 0.30, 900) + Math.min(Math.max(0, +asistPersonalB) * 0.30, 900);
  const donBaseA = Math.max(0, donacionesA);
  const donBaseB = Math.max(0, donacionesB);
  const donBaseTotal = donBaseA + donBaseB;
  const donBaseMax = bl * DONACIONES_BASE_MAX_PCT;
  const donScale = donBaseTotal > donBaseMax && donBaseTotal > 0 ? donBaseMax / donBaseTotal : 1;
  const dedDon = donBaseTotal > 0
    ? +((donBaseA * donScale * (donacionesPrioritariasA ? DONACIONES_PRIORIT_PCT : DONACIONES_PCT))
      + (donBaseB * donScale * (donacionesPrioritariasB ? DONACIONES_PRIORIT_PCT : DONACIONES_PCT))).toFixed(2)
    : 0;
  const dedInv       = deducInversion(inversionNuevaCreacionA) + deducInversion(inversionNuevaCreacionB);
  const cl    = Math.max(0, pm - dedH - dedViud - dedEdad - dedDiscap - dedCuid - dedOtras - dedViv - dedAlq - dedAsc - dedAlim - dedDiscapFam - dedAsistPers - dedDon - dedInv);
  const retTotal = retA + retCapMobA + retB + retCapMobB;
  const resultado = +(retTotal - cl).toFixed(2);
  const ingresosTotal = brutoFiscalA + brutoFiscalB + rciNetoA + rciNetoB + Math.max(0, capMobA + capMobB) + Math.max(0, gananciasPatrA + gananciasPatrB);
  const teReal = ingresosTotal > 0 ? cl / ingresosTotal : 0;
  const otrosRdtosTotal = otrosRdtosA + otrosRdtosB;
  return {
    brutoA: brutoFiscalA, brutoB: brutoFiscalB, brutoSalarioA: brutoA, brutoSalarioB: brutoB,
    ssA, ssB, difA, difB, bonA, bonB, rntA, rntB,
    rciNetoA, rciNetoB, biSum, bl, ba, ci_gral, ci_ahorro, ci, minExtra, minTotal, pm,
    dedH, dedViud, dedEdad, dedDiscap, dedCuid, dedOtras, dedViv, dedAlq, dedAsc,
    dedAlim, dedDiscapFam, dedAsistPers, dedDon, dedInv,
    cl, resultado, retTotal, teReal, redExtraA, redExtraB, otrosRdtosTotal,
  };
}
