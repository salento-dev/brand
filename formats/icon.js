// Icona di gruppo WhatsApp: 640×640, ritagliata da WhatsApp in un cerchio. Nessun testo (ADR-0007).
// Livelli: sfondo mist-900 → wallpaper di doodle a schizzo (accento, opacità 0.5) → soggetto flat al centro.
import fs from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import { loadTokens, iconPalette, placeholders } from '../src/tokens.js';
import { subjectPath, subjectInner, colorizeSubject, SUBJECT_VIEWBOX } from '../src/subjects.js';
import { loadLibrary, loadDoodleSets, f } from '../src/doodles.js';
import { composeWallpaper, wallpaperSvg } from '../src/wallpaper.js';
import { DOODLES_DIR } from '../src/paths.js';

const SIZE = 640;
const C = SIZE / 2;
/** Area sicura: il soggetto deve stare tutto entro questo cerchio (il wallpaper no). */
export const SAFE_RADIUS = 280; // 87.5% del diametro (≈ 86 unità del viewBox dei soggetti): WhatsApp ritaglia a 320

/**
 * Scala dei soggetti (viewBox 160): l'ingombro di progetto di 136 unità occupa il 69% del diametro
 * dell'icona (0.69 × 640 / 136 ≈ 3.25). Stessa scala per tutti, così i soggetti hanno lo stesso "peso".
 */
export const SUBJECT_SCALE = 3.25;

let lib;
const doodleLibrary = () => (lib ??= loadLibrary(DOODLES_DIR, 'doodles'));

/** Soggetto colorato e posizionato al centro dell'icona (markup SVG). */
export function subjectLayer(name, palette, tokens = loadTokens()) {
  const inner = colorizeSubject(subjectInner(fs.readFileSync(subjectPath(name), 'utf8')), placeholders(tokens), palette, `s-${name}`);
  const k = SUBJECT_SCALE;
  const o = C - (SUBJECT_VIEWBOX / 2) * k;
  return `<g transform="translate(${f(o)} ${f(o)}) scale(${f(k)})">${inner}</g>`;
}

/**
 * Distanza massima (px) dal centro dell'icona di un pixel del soggetto: deve essere ≤ SAFE_RADIUS.
 * Conta anche gli stacchi in colore sfondo (coprono il wallpaper).
 */
export function subjectMaxRadius(name, tokens = loadTokens()) {
  const pal = { bg: '#000000', highlight: '#000000', accent: '#000000', 'accent-dark': '#000000' };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">${subjectLayer(name, pal, tokens)}</svg>`;
  const px = new Resvg(svg, { font: { loadSystemFonts: false } }).render().pixels;
  let max = 0;
  for (let i = 0; i < SIZE * SIZE; i++) {
    if (px[i * 4 + 3] > 8) max = Math.max(max, Math.hypot((i % SIZE) + 0.5 - C, Math.floor(i / SIZE) + 0.5 - C));
  }
  return max;
}

/** SVG completo dell'icona di un gruppo. */
export function iconSvg(group, { tokens = loadTokens(), sets = loadDoodleSets() } = {}) {
  const palette = iconPalette(tokens, group);
  const layout = composeWallpaper({
    seed: group.slug, lib: doodleLibrary(), extras: group.doodles ?? [], base: sets.base, fillers: sets.fillers,
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">`
    + `<rect width="${SIZE}" height="${SIZE}" fill="${palette.bg}"/>`
    + wallpaperSvg({ seed: group.slug, lib: doodleLibrary(), layout, color: palette.accent })
    + subjectLayer(group.subject, palette, tokens)
    + '</svg>';
}

export default {
  id: 'icon',
  collection: 'groups',
  width: SIZE,
  height: SIZE,
  safeArea: { shape: 'circle', radius: SAFE_RADIUS },
  previews: [96],
  output: (group) => `groups/${group.slug}.png`,
  render: (group, ctx) => iconSvg(group, ctx),
};
