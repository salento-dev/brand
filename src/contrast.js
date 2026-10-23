// Rapporto di contrasto WCAG 2.x tra due colori esadecimali.
export function normalizeHex(hex) {
  let h = String(hex).trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(h)) h = '#' + [...h.slice(1)].map((c) => c + c).join('');
  return /^#[0-9a-f]{6}$/.test(h) ? h : null;
}

function luminance(hex) {
  const h = normalizeHex(hex);
  if (!h) throw new Error(`Colore non esadecimale: ${hex}`);
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Regole sui ruoli semantic (galleria), verificate da `npm run validate`. */
export const THEME_RULES = [
  { fg: 'text', bg: 'bg', min: 4.5, why: 'testo normale (WCAG 1.4.3)' },
  { fg: 'text-muted', bg: 'bg', min: 4.5, why: 'testo secondario (WCAG 1.4.3)' },
  { fg: 'accent', bg: 'bg', min: 4.5, why: 'link in accento' },
];

/** Regole per ogni palette di icona (ogni accento e i temporanei): chiavi di iconPalette(). */
export const ICON_RULES = [
  { fg: 'accent', bg: 'bg', min: 4.5, why: 'soggetto e doodle sullo sfondo; logo stampato (colore sfondo) sull\'accento' },
  { fg: 'accent-dark', bg: 'bg', min: 2, why: 'ombre e parti secondarie distinguibili dallo sfondo (decorative)' },
  { fg: 'accent', bg: 'accent-dark', min: 2, why: 'ombra piatta distinguibile dalla parte in luce' },
];
