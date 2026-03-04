// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES FISCALES — NF 33/2013 + NF 19/2024 + NF 3/2025 — Álava 2025
// ═══════════════════════════════════════════════════════════════════════════════

export const SS_PCT_INDEF   = 0.0648;
export const SS_PCT_TEMP    = 0.0653;
export const SS_BASE_MAX    = 58914;
export const COMP_M6        = 424.60;
export const COMP_6A15      = 68.20;
export const MINORACION = 1583;
export const MINORACION_DESPOBLACION = 200;
export const RED_CONJUNTA = 4800;
export const SMI_2025 = 16576;
export const DEDUC_EDAD_65 = 385;
export const DEDUC_EDAD_75 = 700;
export const DEDUC_ASCENDIENTE = 423.72;
export const DEDUC_DISCAP_CUOTA = { "33-65": 1025.64, "65+": 1464.54, "gradoII": 1756.75, "gradoIII": 2191.03 };
export const DEDUC_HIJOS = [734.80, 909.70, 1532.30, 1811.70, 2366.10];
export const ALIMENTOS_PCT = 0.15;
export const ALIMENTOS_LIMITE_PCT = 0.30;
export const DONACIONES_PCT = 0.30;
export const DONACIONES_PRIORIT_PCT = 0.45;
export const DONACIONES_BASE_MAX_PCT = 0.30;
export const INVERSION_NUEVA_PCT = 0.10;
export const INVERSION_NUEVA_MAX = 6000;
export const PENSION_LIMIT_TOTAL = 13000;

export const ESCALA_GRAL = [
  [0,       17720,    0,        0.23],
  [17720,   35440,    4075.60,  0.28],
  [35440,   53160,    9037.20,  0.35],
  [53160,   75910,    15239.20, 0.40],
  [75910,   105130,   24339.20, 0.45],
  [105130,  140130,   37488.20, 0.46],
  [140130,  204270,   53588.20, 0.47],
  [204270,  Infinity, 83734.00, 0.49],
];

export const ESCALA_AHORRO = [
  [0,     2500,     0,     0.20],
  [2500,  10000,    500,   0.21],
  [10000, 15000,    2075,  0.22],
  [15000, 30000,    3175,  0.23],
  [30000, Infinity, 6625,  0.25],
];
