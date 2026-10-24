// Logo: geometria (area di rispetto derivata dalle barre), varianti di colore e file del kit.
import fs from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import { LOGO_FILE } from './paths.js';

/** Righe di barre del logo (viewBox 0 0 90 105): y di inizio e altezza della barra. */
export const LOGO = {
  width: 90,
  height: 105,
  barHeight: 8.2,
  rows: [0, 19.2, 38.5, 57.8, 77, 96.3],
};
/** Passo tra due righe (barra + interlinea): ≈ 19.26 unità. */
export const ROW_PITCH = (LOGO.rows.at(-1) - LOGO.rows[0]) / (LOGO.rows.length - 1);
/**
 * Area di rispetto X = una riga del logo (barra + interlinea) ≈ 18% dell'altezza:
 * attorno al logo nessun altro elemento entro X.
 */
export const CLEAR_SPACE = ROW_PITCH;
export const CLEAR_SPACE_RATIO = CLEAR_SPACE / LOGO.height;
/** Dimensioni minime (altezza): sotto, le interlinee tra le barre si chiudono. */
export const MIN_HEIGHT_PX = 24;
export const MIN_HEIGHT_MM = 8;

/** I tracciati del logo (dentro <svg>), dal file ufficiale. */
export function logoPaths(file = LOGO_FILE) {
  const svg = fs.readFileSync(file, 'utf8');
  const m = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  if (!m) throw new Error('assets/logo.svg: <svg> non trovato');
  return m[1].trim().replace(/\n\s*/g, '\n  ');
}

/**
 * SVG del logo in un colore. `margin` in unità del viewBox (es. CLEAR_SPACE); `background` facoltativo.
 * `title` rende l'SVG accessibile se usato come immagine.
 */
export function logoSvg({ color, margin = 0, title = 'Salento.dev', background } = {}) {
  const w = LOGO.width + margin * 2;
  const h = LOGO.height + margin * 2;
  const n = (v) => +v.toFixed(3);
  const bg = background ? `<rect x="${n(-margin)}" y="${n(-margin)}" width="${n(w)}" height="${n(h)}" fill="${background}"/>\n` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${n(-margin)} ${n(-margin)} ${n(w)} ${n(h)}" role="img" aria-label="${title}">
<title>${title}</title>
${bg}<g fill="${color}">
  ${logoPaths()}
</g>
</svg>
`;
}

/** Avatar quadrato (profili social, chat): logo centrato su fondo pieno, sicuro per il ritaglio a cerchio. */
export function avatarSvg({ color, background, size = 1024 }) {
  const logoH = size * 0.5; // mezza diagonale del logo ≈ 0.66 × altezza = 0.33 × lato < raggio 0.5
  const k = logoH / LOGO.height;
  const x = (size - LOGO.width * k) / 2;
  const y = (size - logoH) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Salento.dev">
<title>Salento.dev</title>
<rect width="${size}" height="${size}" fill="${background}"/>
<g fill="${color}" transform="translate(${+x.toFixed(3)} ${+y.toFixed(3)}) scale(${+k.toFixed(6)})">
  ${logoPaths()}
</g>
</svg>
`;
}

/** PNG da SVG all'altezza indicata (sfondo trasparente se l'SVG non ne ha uno). */
export const pngAtHeight = (svg, height) =>
  new Resvg(svg, { fitTo: { mode: 'height', value: height }, font: { loadSystemFonts: false } }).render().asPng();

/** Varianti di colore del logo nel kit: slug del file -> token brand.color.* */
export const LOGO_VARIANTS = [
  { slug: 'bianco', token: 'brand.color.bright-mist', label: 'Bright Mist', on: 'fondi scuri' },
  { slug: 'cyan', token: 'brand.color.signal-cyan', label: 'Signal Cyan', on: 'fondi scuri' },
  { slug: 'nero', token: 'brand.color.console-black', label: 'Console Black', on: 'fondi chiari (materiali di terzi)' },
];
export const LOGO_PNG_HEIGHTS = [512, 1024, 2048];
export const AVATAR_SIZES = [512, 1024];

/**
 * Tutti i file del logo per il kit: [{ path, data }], percorsi relativi alla radice del kit.
 * PNG trasparenti con l'area di rispetto inclusa, alti N px.
 */
export function logoFiles(tokens) {
  const files = [];
  for (const v of LOGO_VARIANTS) {
    const color = tokens[v.token];
    if (!color) throw new Error(`Token mancante: ${v.token}`);
    files.push({ path: `logo/svg/salento-dev-logo-${v.slug}.svg`, data: Buffer.from(logoSvg({ color })) });
    const padded = logoSvg({ color, margin: CLEAR_SPACE });
    for (const h of LOGO_PNG_HEIGHTS) files.push({ path: `logo/png/salento-dev-logo-${v.slug}-${h}.png`, data: pngAtHeight(padded, h) });
  }
  const avatar = avatarSvg({ color: tokens['brand.color.bright-mist'], background: tokens['brand.color.console-black'] });
  files.push({ path: 'logo/avatar/salento-dev-avatar.svg', data: Buffer.from(avatar) });
  for (const s of AVATAR_SIZES) files.push({ path: `logo/avatar/salento-dev-avatar-${s}.png`, data: pngAtHeight(avatar, s) });
  return files;
}
