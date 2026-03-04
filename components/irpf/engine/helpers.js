// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS DE FORMATO Y PARSEO
// ═══════════════════════════════════════════════════════════════════════════════

export const n = (s) => { const v = parseFloat(String(s).replace(/\./g, "").replace(",", ".")); return isNaN(v) ? 0 : v; };
export const eur = (x, abs = false) => new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(abs ? Math.abs(x) : x) + " \u20ac";
export const pct = (x) => (x * 100).toFixed(1) + "%";
export const sign = (x) => x >= 0 ? "+" : "\u2212";
export const signedEur = (x) => sign(x) + eur(Math.abs(x));
