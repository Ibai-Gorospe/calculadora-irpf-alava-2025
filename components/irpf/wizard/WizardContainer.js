"use client";

import { useReducer, useMemo, useState, useEffect, useCallback } from "react";
import { reducer } from "../state/reducer.js";
import { initialState } from "../state/initialState.js";
import { useAutoSave, loadSavedState, clearSavedState } from "../state/useLocalStorage.js";
import { n, eur, signedEur } from "../engine/helpers.js";
import { calcPersona, calcConjunta, deducHijosTotal } from "../engine/calcFunctions.js";
import { RED_CONJUNTA } from "../engine/constants.js";
import { T } from "../ui/tokens.js";
import { ProgressBar } from "../ui/ProgressBar.js";
import StepBasico from "./StepBasico.js";
import StepPersonal from "./StepPersonal.js";
import StepVivienda from "./StepVivienda.js";
import StepOtrasRentas from "./StepOtrasRentas.js";
import StepDeducciones from "./StepDeducciones.js";
import StepResultado from "./StepResultado.js";

export default function WizardContainer() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const [showPersonB, setShowPersonB] = useState(false);
  const [restored, setRestored] = useState(false);

  // localStorage restore on mount
  useEffect(() => {
    const saved = loadSavedState();
    if (saved) {
      dispatch({ type: "RESTORE", payload: saved });
      if (saved._showPersonB) setShowPersonB(true);
      setRestored(true);
    }
  }, []);

  // Auto-save state
  useAutoSave({ ...state, _showPersonB: showPersonB });

  // Dismiss restored banner
  const dismissRestored = useCallback(() => setRestored(false), []);

  // Step navigation
  const goToStep = useCallback((step) => {
    setCurrentStep(step);
    setMaxVisited(prev => Math.max(prev, step));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goNext = useCallback(() => {
    const next = Math.min(currentStep + 1, 5);
    goToStep(next);
  }, [currentStep, goToStep]);

  const goPrev = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Extract values
  const aB    = n(state.personA.bruto);
  const aR    = n(state.personA.ret);
  const aRe   = n(state.personA.redExtra);
  const aTc   = state.personA.tipoContrato;
  const aRnl  = n(state.personA.rentasNoLab);
  const aDisc = state.personA.discapacidad;
  const aViu  = state.personA.viudedad;
  const aCuid = state.personA.cuidado;
  const aOt   = n(state.personA.otrasDeducNF3);
  const aVivC = n(state.personA.viviendaCompra);
  const aVivP = state.personA.viviendaPerfil;
  const aAlq  = n(state.personA.alquilerAnual);
  const aAlqP = state.personA.alquilerPerfil;
  const aEdad = state.personA.edad;
  const aDesp = state.personA.despoblacion;
  const aAsc  = state.personA.ascendientes;
  const aCapInmI = n(state.personA.ingresosCap_inm);
  const aCapInmG = n(state.personA.gastosCap_inm);
  const aEsVivInq = state.personA.esViviendaInq;
  const aCapMob  = n(state.personA.capMob);
  const aRetCapMob = n(state.personA.retCapMob);
  const aGanPatr = n(state.personA.gananciasPatr);
  const aRetribEsp = n(state.personA.retribEspecie);
  const aStockOpts = n(state.personA.stockOptions);
  const aStockOptsRed = state.personA.stockOptionsReduccion;
  const aRescPen = n(state.personA.rescatePension);
  const aRescPenRed = state.personA.rescatePensionReduccion;
  const aAlimentos = n(state.personA.anualidadesAlimentos);
  const aNumHijosAlim = state.personA.numHijosAlimentos;
  const aDiscFam = state.personA.discapFamiliar;
  const aDiscFamGrado = state.personA.discapFamiliarGrado;
  const aAsistPers = n(state.personA.asistPersonal);
  const aVivPrim = state.personA.viviendaPrimerAnio;
  const aDonac = n(state.personA.donaciones);
  const aDonacPrior = state.personA.donacionesPrioritarias;
  const aInvNueva = n(state.personA.inversionNuevaCreacion);

  const bB    = n(state.personB.bruto);
  const bR    = n(state.personB.ret);
  const bRe   = n(state.personB.redExtra);
  const bTc   = state.personB.tipoContrato;
  const bRnl  = n(state.personB.rentasNoLab);
  const bDisc = state.personB.discapacidad;
  const bViu  = state.personB.viudedad;
  const bCuid = state.personB.cuidado;
  const bOt   = n(state.personB.otrasDeducNF3);
  const bVivC = n(state.personB.viviendaCompra);
  const bVivP = state.personB.viviendaPerfil;
  const bAlq  = n(state.personB.alquilerAnual);
  const bAlqP = state.personB.alquilerPerfil;
  const bEdad = state.personB.edad;
  const bDesp = state.personB.despoblacion;
  const bAsc  = state.personB.ascendientes;
  const bCapInmI = n(state.personB.ingresosCap_inm);
  const bCapInmG = n(state.personB.gastosCap_inm);
  const bEsVivInq = state.personB.esViviendaInq;
  const bCapMob  = n(state.personB.capMob);
  const bRetCapMob = n(state.personB.retCapMob);
  const bGanPatr = n(state.personB.gananciasPatr);
  const bRetribEsp = n(state.personB.retribEspecie);
  const bStockOpts = n(state.personB.stockOptions);
  const bStockOptsRed = state.personB.stockOptionsReduccion;
  const bRescPen = n(state.personB.rescatePension);
  const bRescPenRed = state.personB.rescatePensionReduccion;
  const bAlimentos = n(state.personB.anualidadesAlimentos);
  const bNumHijosAlim = state.personB.numHijosAlimentos;
  const bDiscFam = state.personB.discapFamiliar;
  const bDiscFamGrado = state.personB.discapFamiliarGrado;
  const bAsistPers = n(state.personB.asistPersonal);
  const bVivPrim = state.personB.viviendaPrimerAnio;
  const bDonac = n(state.personB.donaciones);
  const bDonacPrior = state.personB.donacionesPrioritarias;
  const bInvNueva = n(state.personB.inversionNuevaCreacion);

  const hj      = state.hijos;
  const hjM6    = state.hijosM6;
  const hj6a15  = state.hijos6a15;
  const ready   = aB > 0;
  const hasPairData = showPersonB && bB > 0;

  // Calculations
  const calc = useMemo(() => {
    if (!ready) return null;
    const dedHTotal = deducHijosTotal(hj, hjM6, hj6a15);
    const commonA = { tipoContrato: aTc, rentasNoLab: aRnl, discapacidad: aDisc, viudedad: aViu, cuidado: aCuid, otrasDeducNF3: aOt, viviendaCompra: aVivC, viviendaPerfil: aVivP, alquilerAnual: aAlq, alquilerPerfil: aAlqP, edad: aEdad, despoblacion: aDesp, ascendientes: aAsc, ingresosCap_inm: aCapInmI, gastosCap_inm: aCapInmG, esViviendaInq: aEsVivInq, capMob: aCapMob, retCapMob: aRetCapMob, gananciasPatr: aGanPatr, retribEspecie: aRetribEsp, stockOptions: aStockOpts, stockOptionsReduccion: aStockOptsRed, rescatePension: aRescPen, rescatePensionReduccion: aRescPenRed, anualidadesAlimentos: aAlimentos, numHijosAlimentos: aNumHijosAlim, discapFamiliar: aDiscFam, discapFamiliarGrado: aDiscFamGrado, asistPersonal: aAsistPers, viviendaPrimerAnio: aVivPrim, donaciones: aDonac, donacionesPrioritarias: aDonacPrior, inversionNuevaCreacion: aInvNueva };

    const a_sh = calcPersona({ bruto: aB, ret: aR, redExtra: aRe, hijosShare: 0, ...commonA });
    const hijosShareA = hasPairData ? dedHTotal / 2 : dedHTotal;
    const a_ch = calcPersona({ bruto: aB, ret: aR, redExtra: aRe, hijosShare: hijosShareA, ...commonA });

    if (!hasPairData) {
      return { a_sh, a_ch, solo: true };
    }

    const commonB = { tipoContrato: bTc, rentasNoLab: bRnl, discapacidad: bDisc, viudedad: bViu, cuidado: bCuid, otrasDeducNF3: bOt, viviendaCompra: bVivC, viviendaPerfil: bVivP, alquilerAnual: bAlq, alquilerPerfil: bAlqP, edad: bEdad, despoblacion: bDesp, ascendientes: bAsc, ingresosCap_inm: bCapInmI, gastosCap_inm: bCapInmG, esViviendaInq: bEsVivInq, capMob: bCapMob, retCapMob: bRetCapMob, gananciasPatr: bGanPatr, retribEspecie: bRetribEsp, stockOptions: bStockOpts, stockOptionsReduccion: bStockOptsRed, rescatePension: bRescPen, rescatePensionReduccion: bRescPenRed, anualidadesAlimentos: bAlimentos, numHijosAlimentos: bNumHijosAlim, discapFamiliar: bDiscFam, discapFamiliarGrado: bDiscFamGrado, asistPersonal: bAsistPers, viviendaPrimerAnio: bVivPrim, donaciones: bDonac, donacionesPrioritarias: bDonacPrior, inversionNuevaCreacion: bInvNueva };
    const b_sh = calcPersona({ bruto: bB, ret: bR, redExtra: bRe, hijosShare: 0, ...commonB });
    const b_ch = calcPersona({ bruto: bB, ret: bR, redExtra: bRe, hijosShare: dedHTotal / 2, ...commonB });

    const conjParams = {
      brutoA: aB, retA: aR, redExtraA: aRe, brutoB: bB, retB: bR, redExtraB: bRe,
      tipoContratoA: aTc, rentasNoLabA: aRnl, discapacidadA: aDisc, viudedadA: aViu, cuidadoA: aCuid, otrasDeducNF3A: aOt,
      viviendaCompraA: aVivC, viviendaPerfilA: aVivP, alquilerAnualA: aAlq, alquilerPerfilA: aAlqP,
      edadA: aEdad, despoblacionA: aDesp, ascendientesA: aAsc,
      ingresosCap_inmA: aCapInmI, gastosCap_inmA: aCapInmG, esViviendaInqA: aEsVivInq,
      capMobA: aCapMob, retCapMobA: aRetCapMob, gananciasPatrA: aGanPatr,
      tipoContratoB: bTc, rentasNoLabB: bRnl, discapacidadB: bDisc, viudedadB: bViu, cuidadoB: bCuid, otrasDeducNF3B: bOt,
      viviendaCompraB: bVivC, viviendaPerfilB: bVivP, alquilerAnualB: bAlq, alquilerPerfilB: bAlqP,
      edadB: bEdad, despoblacionB: bDesp, ascendientesB: bAsc,
      ingresosCap_inmB: bCapInmI, gastosCap_inmB: bCapInmG, esViviendaInqB: bEsVivInq,
      capMobB: bCapMob, retCapMobB: bRetCapMob, gananciasPatrB: bGanPatr,
      retribEspecieA: aRetribEsp, stockOptionsA: aStockOpts, stockOptionsReduccionA: aStockOptsRed,
      rescatePensionA: aRescPen, rescatePensionReduccionA: aRescPenRed,
      anualidadesAlimentosA: aAlimentos, numHijosAlimentosA: aNumHijosAlim,
      discapFamiliarA: aDiscFam, discapFamiliarGradoA: aDiscFamGrado,
      asistPersonalA: aAsistPers, viviendaPrimerAnioA: aVivPrim,
      donacionesA: aDonac, donacionesPrioritariasA: aDonacPrior, inversionNuevaCreacionA: aInvNueva,
      retribEspecieB: bRetribEsp, stockOptionsB: bStockOpts, stockOptionsReduccionB: bStockOptsRed,
      rescatePensionB: bRescPen, rescatePensionReduccionB: bRescPenRed,
      anualidadesAlimentosB: bAlimentos, numHijosAlimentosB: bNumHijosAlim,
      discapFamiliarB: bDiscFam, discapFamiliarGradoB: bDiscFamGrado,
      asistPersonalB: bAsistPers, viviendaPrimerAnioB: bVivPrim,
      donacionesB: bDonac, donacionesPrioritariasB: bDonacPrior, inversionNuevaCreacionB: bInvNueva,
    };
    const c_sh = calcConjunta({ ...conjParams, hijosTotal: 0 });
    const c_ch = calcConjunta({ ...conjParams, hijosTotal: dedHTotal });

    return { a_sh, b_sh, a_ch, b_ch, c_sh, c_ch, solo: false };
  }, [aB, aR, aRe, aTc, aRnl, aDisc, aViu, aCuid, aOt, aVivC, aVivP, aAlq, aAlqP, aEdad, aDesp, aAsc,
      aCapInmI, aCapInmG, aEsVivInq, aCapMob, aRetCapMob, aGanPatr,
      aRetribEsp, aStockOpts, aStockOptsRed, aRescPen, aRescPenRed,
      aAlimentos, aNumHijosAlim, aDiscFam, aDiscFamGrado, aAsistPers, aVivPrim, aDonac, aDonacPrior, aInvNueva,
      bB, bR, bRe, bTc, bRnl, bDisc, bViu, bCuid, bOt, bVivC, bVivP, bAlq, bAlqP, bEdad, bDesp, bAsc,
      bCapInmI, bCapInmG, bEsVivInq, bCapMob, bRetCapMob, bGanPatr,
      bRetribEsp, bStockOpts, bStockOptsRed, bRescPen, bRescPenRed,
      bAlimentos, bNumHijosAlim, bDiscFam, bDiscFamGrado, bAsistPers, bVivPrim, bDonac, bDonacPrior, bInvNueva,
      hj, hjM6, hj6a15, ready, hasPairData]);

  // Scenarios
  const scenarios = useMemo(() => {
    if (!calc) return [];
    const hasH    = hj > 0;
    const dedHTxt = eur(deducHijosTotal(hj, hjM6, hj6a15));

    if (calc.solo) {
      const { a_sh, a_ch } = calc;
      const list = [
        {
          id: "IND-NOHIJOS", modalidad: "Individual", label: "Individual · Sin hijos",
          sublabel: "Declaración individual, sin deducción de descendientes",
          accentColor: T.cobalt,
          resultado: a_sh.resultado,
          brutoTotal: aB, ssTotal: a_sh.ss,
          bonifTotal: a_sh.bonif, rntTotal: a_sh.rnt,
          rciTotal: a_sh.rciNeto,
          redTotal: aRe, redConj: 0, bl: a_sh.bl,
          ba: a_sh.ba, ci_gral: a_sh.ci_gral, ci_ahorro: a_sh.ci_ahorro,
          ci: a_sh.ci, minoracion: a_sh.minTotal, minExtra: a_sh.minExtra,
          dedH: 0, dedViud: a_sh.dedViud, dedEdad: a_sh.dedEdad, dedDiscap: a_sh.dedDiscap,
          dedCuid: a_sh.dedCuid, dedAsc: a_sh.dedAsc, dedOtras: a_sh.dedOtras,
          dedViv: a_sh.dedViv, dedAlq: a_sh.dedAlq,
          dedAlim: a_sh.dedAlim, dedDiscapFam: a_sh.dedDiscapFam, dedAsistPers: a_sh.dedAsistPers,
          dedDon: a_sh.dedDon, dedInv: a_sh.dedInv, otrosRdtosTotal: a_sh.otrosRdtosTrabajo,
          cl: a_sh.cl, retTotal: aR + aRetCapMob,
          warning: hasH ? `No aprovechas la deducción de hijos de ${dedHTxt}` : null,
          _calcA: a_sh,
        },
        ...(hasH ? [{
          id: "IND-HIJOS", modalidad: "Individual", label: "Individual · Con hijos",
          sublabel: "Declaración individual, 100% deducción de descendientes",
          accentColor: T.cobalt,
          resultado: a_ch.resultado,
          brutoTotal: aB, ssTotal: a_ch.ss,
          bonifTotal: a_ch.bonif, rntTotal: a_ch.rnt,
          rciTotal: a_ch.rciNeto,
          redTotal: aRe, redConj: 0, bl: a_ch.bl,
          ba: a_ch.ba, ci_gral: a_ch.ci_gral, ci_ahorro: a_ch.ci_ahorro,
          ci: a_ch.ci, minoracion: a_ch.minTotal, minExtra: a_ch.minExtra,
          dedH: a_ch.dedH, dedViud: a_ch.dedViud, dedEdad: a_ch.dedEdad, dedDiscap: a_ch.dedDiscap,
          dedCuid: a_ch.dedCuid, dedAsc: a_ch.dedAsc, dedOtras: a_ch.dedOtras,
          dedViv: a_ch.dedViv, dedAlq: a_ch.dedAlq,
          dedAlim: a_ch.dedAlim, dedDiscapFam: a_ch.dedDiscapFam, dedAsistPers: a_ch.dedAsistPers,
          dedDon: a_ch.dedDon, dedInv: a_ch.dedInv, otrosRdtosTotal: a_ch.otrosRdtosTrabajo,
          cl: a_ch.cl, retTotal: aR + aRetCapMob,
          _calcA: a_ch,
        }] : []),
      ];
      return list.sort((a, b) => b.resultado - a.resultado);
    }

    const { a_sh, b_sh, a_ch, b_ch, c_sh, c_ch } = calc;
    const list = [
      {
        id: "IND-NOHIJOS", modalidad: "Individual", label: "Individual · Sin hijos",
        sublabel: "Dos declaraciones separadas, sin deducción de descendientes",
        accentColor: T.cobalt,
        resultado:  +(a_sh.resultado + b_sh.resultado).toFixed(2),
        brutoTotal: aB + bB, ssTotal: a_sh.ss + b_sh.ss,
        bonifTotal: a_sh.bonif + b_sh.bonif, rntTotal: a_sh.rnt + b_sh.rnt,
        rciTotal: a_sh.rciNeto + b_sh.rciNeto,
        redTotal: aRe + bRe, redConj: 0, bl: a_sh.bl + b_sh.bl,
        ba: a_sh.ba + b_sh.ba, ci_gral: a_sh.ci_gral + b_sh.ci_gral, ci_ahorro: a_sh.ci_ahorro + b_sh.ci_ahorro,
        ci: a_sh.ci + b_sh.ci, minoracion: a_sh.minTotal + b_sh.minTotal, minExtra: a_sh.minExtra + b_sh.minExtra,
        dedH: 0, dedViud: a_sh.dedViud + b_sh.dedViud, dedEdad: a_sh.dedEdad + b_sh.dedEdad, dedDiscap: a_sh.dedDiscap + b_sh.dedDiscap,
        dedCuid: a_sh.dedCuid + b_sh.dedCuid, dedAsc: a_sh.dedAsc + b_sh.dedAsc, dedOtras: a_sh.dedOtras + b_sh.dedOtras,
        dedViv: a_sh.dedViv + b_sh.dedViv, dedAlq: a_sh.dedAlq + b_sh.dedAlq,
        dedAlim: a_sh.dedAlim + b_sh.dedAlim, dedDiscapFam: a_sh.dedDiscapFam + b_sh.dedDiscapFam, dedAsistPers: a_sh.dedAsistPers + b_sh.dedAsistPers,
        dedDon: a_sh.dedDon + b_sh.dedDon, dedInv: a_sh.dedInv + b_sh.dedInv, otrosRdtosTotal: a_sh.otrosRdtosTrabajo + b_sh.otrosRdtosTrabajo,
        cl: a_sh.cl + b_sh.cl, retTotal: aR + aRetCapMob + bR + bRetCapMob,
        warning: hasH ? `No aprovechas la deducción de hijos de ${dedHTxt}` : null,
        _calcA: a_sh, _calcB: b_sh,
      },
      ...(hasH ? [{
        id: "IND-HIJOS", modalidad: "Individual", label: "Individual · Con hijos",
        sublabel: "Dos declaraciones, 50% de deducción de descendientes cada uno",
        accentColor: T.cobalt,
        resultado:  +(a_ch.resultado + b_ch.resultado).toFixed(2),
        brutoTotal: aB + bB, ssTotal: a_ch.ss + b_ch.ss,
        bonifTotal: a_ch.bonif + b_ch.bonif, rntTotal: a_ch.rnt + b_ch.rnt,
        rciTotal: a_ch.rciNeto + b_ch.rciNeto,
        redTotal: aRe + bRe, redConj: 0, bl: a_ch.bl + b_ch.bl,
        ba: a_ch.ba + b_ch.ba, ci_gral: a_ch.ci_gral + b_ch.ci_gral, ci_ahorro: a_ch.ci_ahorro + b_ch.ci_ahorro,
        ci: a_ch.ci + b_ch.ci, minoracion: a_ch.minTotal + b_ch.minTotal, minExtra: a_ch.minExtra + b_ch.minExtra,
        dedH: a_ch.dedH + b_ch.dedH, dedViud: a_ch.dedViud + b_ch.dedViud, dedEdad: a_ch.dedEdad + b_ch.dedEdad, dedDiscap: a_ch.dedDiscap + b_ch.dedDiscap,
        dedCuid: a_ch.dedCuid + b_ch.dedCuid, dedAsc: a_ch.dedAsc + b_ch.dedAsc, dedOtras: a_ch.dedOtras + b_ch.dedOtras,
        dedViv: a_ch.dedViv + b_ch.dedViv, dedAlq: a_ch.dedAlq + b_ch.dedAlq,
        dedAlim: a_ch.dedAlim + b_ch.dedAlim, dedDiscapFam: a_ch.dedDiscapFam + b_ch.dedDiscapFam, dedAsistPers: a_ch.dedAsistPers + b_ch.dedAsistPers,
        dedDon: a_ch.dedDon + b_ch.dedDon, dedInv: a_ch.dedInv + b_ch.dedInv, otrosRdtosTotal: a_ch.otrosRdtosTrabajo + b_ch.otrosRdtosTrabajo,
        cl: a_ch.cl + b_ch.cl, retTotal: aR + aRetCapMob + bR + bRetCapMob,
        warning: "El hijo NO debe presentar declaración voluntaria (art. 79.3.c NF 33/2013)",
        _calcA: a_ch, _calcB: b_ch,
      }] : []),
      {
        id: "CONJ-NOHIJOS", modalidad: "Conjunta", label: "Conjunta · Sin hijos",
        sublabel: "Una declaración · −4.800 € reducción base (art. 73 NF 3/2025)",
        accentColor: T.gold,
        resultado:  c_sh.resultado,
        brutoTotal: aB + bB, ssTotal: c_sh.ssA + c_sh.ssB,
        bonifTotal: c_sh.bonA + c_sh.bonB, rntTotal: c_sh.rntA + c_sh.rntB,
        rciTotal: c_sh.rciNetoA + c_sh.rciNetoB,
        redTotal: aRe + bRe, redConj: RED_CONJUNTA, bl: c_sh.bl,
        ba: c_sh.ba, ci_gral: c_sh.ci_gral, ci_ahorro: c_sh.ci_ahorro,
        ci: c_sh.ci, minoracion: c_sh.minTotal, minExtra: c_sh.minExtra,
        dedH: 0, dedViud: c_sh.dedViud, dedEdad: c_sh.dedEdad, dedDiscap: c_sh.dedDiscap,
        dedCuid: c_sh.dedCuid, dedAsc: c_sh.dedAsc, dedOtras: c_sh.dedOtras,
        dedViv: c_sh.dedViv, dedAlq: c_sh.dedAlq,
        dedAlim: c_sh.dedAlim, dedDiscapFam: c_sh.dedDiscapFam, dedAsistPers: c_sh.dedAsistPers,
        dedDon: c_sh.dedDon, dedInv: c_sh.dedInv, otrosRdtosTotal: c_sh.otrosRdtosTotal,
        cl: c_sh.cl, retTotal: c_sh.retTotal,
        warning: hasH ? `Deducción de hijos no aplicada: te pierdes ${dedHTxt}` : null,
        _calcConj: c_sh,
      },
      ...(hasH ? [{
        id: "CONJ-HIJOS", modalidad: "Conjunta", label: "Conjunta · Con hijos",
        sublabel: "Una declaración · −4.800 € base · deducción hijos 100%",
        accentColor: T.gold,
        resultado:  c_ch.resultado,
        brutoTotal: aB + bB, ssTotal: c_ch.ssA + c_ch.ssB,
        bonifTotal: c_ch.bonA + c_ch.bonB, rntTotal: c_ch.rntA + c_ch.rntB,
        rciTotal: c_ch.rciNetoA + c_ch.rciNetoB,
        redTotal: aRe + bRe, redConj: RED_CONJUNTA, bl: c_ch.bl,
        ba: c_ch.ba, ci_gral: c_ch.ci_gral, ci_ahorro: c_ch.ci_ahorro,
        ci: c_ch.ci, minoracion: c_ch.minTotal, minExtra: c_ch.minExtra,
        dedH: c_ch.dedH, dedViud: c_ch.dedViud, dedEdad: c_ch.dedEdad, dedDiscap: c_ch.dedDiscap,
        dedCuid: c_ch.dedCuid, dedAsc: c_ch.dedAsc, dedOtras: c_ch.dedOtras,
        dedViv: c_ch.dedViv, dedAlq: c_ch.dedAlq,
        dedAlim: c_ch.dedAlim, dedDiscapFam: c_ch.dedDiscapFam, dedAsistPers: c_ch.dedAsistPers,
        dedDon: c_ch.dedDon, dedInv: c_ch.dedInv, otrosRdtosTotal: c_ch.otrosRdtosTotal,
        cl: c_ch.cl, retTotal: c_ch.retTotal,
        warning: "El hijo NO debe presentar declaración voluntaria (art. 79.3.c NF 33/2013)",
        _calcConj: c_ch,
      }] : []),
    ];
    return list.sort((a, b) => b.resultado - a.resultado);
  }, [calc, hj, hjM6, hj6a15, aB, aR, aRe, aRetCapMob, bB, bR, bRe, bRetCapMob]);

  const optimo = scenarios[0];
  const peor   = scenarios[scenarios.length - 1];
  const diferencia = optimo && peor ? optimo.resultado - peor.resultado : 0;

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
    setShowPersonB(false);
    setCurrentStep(0);
    setMaxVisited(0);
    clearSavedState();
    setRestored(false);
  }, []);

  const isOptionalStep = currentStep >= 2 && currentStep <= 4;
  const contentWidth = showPersonB ? "max-w-5xl" : "max-w-2xl";

  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      {/* Gradient accent line */}
      <div className="h-1 bg-gradient-to-r from-cobalt via-teal to-positive" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 gap-4">
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-ink">
                Calculadora IRPF Alava 2025
              </h1>
              <div className="text-[11px] mt-0.5 text-ink-faint">
                Ejercicio 2025 &middot; NF 33/2013 &middot; NF 3/2025 &middot; DF 23/2025
              </div>
            </div>
            {ready && optimo && currentStep < 5 && (
              <div className="text-right shrink-0">
                <div className="text-[11px] font-medium text-ink-faint">
                  {optimo.label}
                </div>
                <div
                  className="text-xl font-bold font-mono tracking-tight"
                  style={{ color: optimo.resultado >= 0 ? T.green : T.redAcc }}
                >
                  {signedEur(optimo.resultado)}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <ProgressBar currentStep={currentStep} onStepClick={goToStep} maxVisited={maxVisited} />
        </div>
      </div>

      {/* Restored Banner */}
      {restored && (
        <div className="bg-cobalt-light border-b border-cobalt/20">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 py-3 flex items-center justify-between">
            <span className="text-sm text-cobalt font-medium">Datos restaurados de tu sesion anterior</span>
            <button onClick={dismissRestored} className="text-sm text-cobalt/60 hover:text-cobalt underline cursor-pointer">Cerrar</button>
          </div>
        </div>
      )}

      {/* Body */}
      {currentStep < 5 ? (
        <div className={`${contentWidth} mx-auto px-6 lg:px-8 py-10 pb-28 lg:pb-10`}>
          {/* Step content */}
          <div className="animate-[slideUp_300ms_ease-out]">
            {currentStep === 0 && <StepBasico state={state} dispatch={dispatch} showPersonB={showPersonB} setShowPersonB={setShowPersonB} />}
            {currentStep === 1 && <StepPersonal state={state} dispatch={dispatch} showPersonB={showPersonB} />}
            {currentStep === 2 && <StepVivienda state={state} dispatch={dispatch} showPersonB={showPersonB} />}
            {currentStep === 3 && <StepOtrasRentas state={state} dispatch={dispatch} showPersonB={showPersonB} />}
            {currentStep === 4 && <StepDeducciones state={state} dispatch={dispatch} showPersonB={showPersonB} />}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-12 gap-4">
            {currentStep > 0 ? (
              <button
                onClick={goPrev}
                className="px-6 py-3 rounded-xl border border-border text-ink-mid font-medium text-sm
                           hover:bg-surface-alt hover:border-ink-faint/40 transition-all duration-200 cursor-pointer"
              >
                &larr; Anterior
              </button>
            ) : <div />}
            <div className="flex items-center gap-3">
              {isOptionalStep && (
                <button
                  onClick={goNext}
                  className="px-5 py-3 rounded-xl text-ink-faint text-sm font-medium
                             hover:text-ink-mid hover:bg-surface-alt transition-all duration-200 cursor-pointer"
                >
                  Saltar
                </button>
              )}
              <button
                onClick={goNext}
                className="px-8 py-3.5 rounded-xl bg-cobalt text-white font-semibold text-sm
                           hover:bg-cobalt/90 transition-all duration-200 cursor-pointer
                           shadow-lg shadow-cobalt/20"
              >
                {currentStep === 4 ? "Ver resultados →" : "Siguiente →"}
              </button>
            </div>
          </div>

          {/* Reset button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleReset}
              className="text-sm text-ink-faint hover:text-ink-mid transition-colors cursor-pointer"
            >
              Limpiar todos los datos
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">
          <StepResultado
            calc={calc}
            scenarios={scenarios}
            optimo={optimo}
            diferencia={diferencia}
            hijos={hj}
            hijosM6={hjM6}
            hijos6a15={hj6a15}
            onEditData={() => goToStep(0)}
            state={state}
            showPersonB={showPersonB}
          />
        </div>
      )}

      {/* Mobile Sticky Result */}
      {ready && optimo && currentStep < 5 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden
                        bg-white/90 backdrop-blur-xl border-t border-border
                        px-5 py-4 shadow-[0_-4px_20px_rgba(0,0,0,.08)]">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-[10px] text-ink-faint tracking-widest uppercase font-medium">Mejor opcion</div>
              <div className="text-sm font-bold text-ink">{optimo.label}</div>
            </div>
            <div
              className="text-2xl font-bold font-mono"
              style={{ color: optimo.resultado >= 0 ? T.green : T.redAcc }}
            >
              {signedEur(optimo.resultado)}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center px-6 lg:px-8 py-8 text-[11px] text-ink-faint border-t border-border/50 leading-relaxed">
        <div>Normativa aplicada: NF 33/2013 &middot; NF 19/2024 &middot; NF 3/2025 &middot; DF 23/2025 &middot; Orden PJC/178/2025</div>
        <div className="mt-2 max-w-2xl mx-auto">
          Los resultados de esta calculadora tienen caracter meramente informativo y orientativo.
          No constituyen asesoramiento fiscal y no tienen efectos vinculantes. Para su situacion particular, consulte con un profesional o utilice Rentafacil (Hacienda Foral de Alava).
        </div>
        <div className="mt-2 opacity-60">Ejercicio fiscal 2025 &middot; Trabajo, capital y patrimonio &middot; Actualizado a marzo 2026</div>
      </footer>
    </div>
  );
}
