// Conversioni di colore: OKLCH (come in Tailwind v4) <-> hex sRGB.
// Servono a derivare i token dai valori OKLCH del sito e a calcolare la pietra scura.

/** "oklch(74% 0.238 322.16)" -> [L%, C, H]. */
export function parseOklch(str) {
  const m = String(str).match(/oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!m) throw new Error(`OKLCH non valido: ${str}`);
  return m.slice(1).map(Number);
}

/** OKLCH [L%, C, H°] -> hex sRGB (ritaglio semplice al gamut). */
export function oklchToHex([L, Ch, H]) {
  const l = L / 100;
  const a = Ch * Math.cos((H * Math.PI) / 180);
  const b = Ch * Math.sin((H * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  const gamma = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
  return `#${lin.map((x) => Math.round(Math.min(1, Math.max(0, gamma(x))) * 255).toString(16).padStart(2, '0')).join('')}`;
}

/** hex sRGB -> OKLCH [L%, C, H°]. */
export function hexToOklch(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L * 100, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
}

/**
 * Tono scuro per le ombre piatte quando un accento non ha una scala (es. pietra):
 * luminosità −25 punti, croma ×0.95, tinta −8° (verso il bruno, come la pietra in ombra).
 */
export function darkShade(hex) {
  const [L, C, H] = hexToOklch(hex);
  return oklchToHex([L - 25, C * 0.95, (H - 8 + 360) % 360]);
}
