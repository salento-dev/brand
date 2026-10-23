// Intervallo di date compatto in italiano (galleria, check-expired), es. "18–19 NOV 26".
const MONTHS = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];

const parts = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m: MONTHS[m - 1], d };
};

/**
 * - stesso giorno         -> "12 NOV 26"
 * - stesso mese           -> "12–14 NOV 26"
 * - mesi diversi          -> "30 OTT–2 NOV 26"
 * - anni diversi          -> "30 DIC 26–2 GEN 27"
 */
export function formatRange(starts, ends) {
  const a = parts(starts);
  const b = parts(ends);
  const yy = (y) => String(y % 100).padStart(2, '0');
  if (a.y === b.y && a.m === b.m) return a.d === b.d ? `${a.d} ${a.m} ${yy(a.y)}` : `${a.d}–${b.d} ${a.m} ${yy(a.y)}`;
  if (a.y === b.y) return `${a.d} ${a.m}–${b.d} ${b.m} ${yy(b.y)}`;
  return `${a.d} ${a.m} ${yy(a.y)}–${b.d} ${b.m} ${yy(b.y)}`;
}
