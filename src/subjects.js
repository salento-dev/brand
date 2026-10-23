// Soggetti delle icone: file SVG in assets/subjects/<nome>.svg disegnati con 4 colori segnaposto
// (token `placeholder.*`) che il generatore sostituisce con i colori del gruppo. Vedi docs/02_icone_gruppi.
import fs from 'node:fs';
import path from 'node:path';
import { SUBJECTS_DIR } from './paths.js';
import { normalizeHex } from './contrast.js';

export const SUBJECT_MAX_BYTES = 30 * 1024;
export const SUBJECT_VIEWBOX = 160;

const FORBIDDEN_TAGS = new Set([
  'image', 'text', 'tspan', 'textpath', 'script', 'style', 'foreignobject', 'a', 'iframe', 'use',
  'video', 'audio', 'animate', 'animatetransform', 'animatemotion', 'set', 'font', 'font-face', 'filter',
  'lineargradient', 'radialgradient', 'pattern', 'mask',
]);
const COLOR_PROPS = new Set(['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color', 'color']);
const COLOR_ATTR = /\b(fill|stroke)="([^"]*)"/g;

export const subjectPath = (name, dir = SUBJECTS_DIR) => path.join(dir, `${name}.svg`);
export const subjectExists = (name, dir = SUBJECTS_DIR) => fs.existsSync(subjectPath(name, dir));
export const subjectNames = (dir = SUBJECTS_DIR) =>
  fs.readdirSync(dir).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4)).sort();

/**
 * Controlla l'SVG di un soggetto. `placeholders` = { accent, 'accent-dark', highlight, bg } (hex).
 * Restituisce un array di messaggi d'errore (vuoto = ok).
 */
export function lintSubject(svg, placeholders) {
  const errors = [];
  const allowed = new Set(Object.values(placeholders).map(normalizeHex));
  if (Buffer.byteLength(svg) > SUBJECT_MAX_BYTES) errors.push(`file oltre ${SUBJECT_MAX_BYTES / 1024}KB`);
  if (/<!DOCTYPE|<!ENTITY/i.test(svg)) errors.push('DOCTYPE/ENTITY non ammessi');

  const body = svg.replace(/<!--[\s\S]*?-->/g, '');
  const tags = [...body.matchAll(/<\s*([a-zA-Z][\w:.-]*)([^>]*)>/g)];
  const root = tags.find(([, name]) => name.toLowerCase() === 'svg');
  if (!root) return [...errors, 'elemento <svg> mancante'];

  const vb = root[2].match(/viewBox\s*=\s*["']([^"']+)["']/);
  const [x, y, w, h] = vb ? vb[1].trim().split(/[\s,]+/).map(Number) : [];
  if (!vb) errors.push('viewBox mancante');
  else if (x !== 0 || y !== 0 || w !== SUBJECT_VIEWBOX || h !== SUBJECT_VIEWBOX) {
    errors.push(`viewBox deve essere "0 0 ${SUBJECT_VIEWBOX} ${SUBJECT_VIEWBOX}" (trovato "${vb[1]}")`);
  }

  const checkColor = (value, where) => {
    const v = value.trim().toLowerCase();
    if (v === 'none' || /^url\(#[\w-]+\)$/.test(v)) return;
    if (v === 'currentcolor') return errors.push(`${where}: currentColor non ammesso, usa un colore segnaposto`);
    const hex = normalizeHex(v);
    if (!hex || !allowed.has(hex)) errors.push(`${where}: colore "${value}" non è un segnaposto (${[...allowed].join(', ')})`);
  };

  for (const [, rawName, attrs] of tags) {
    const tag = rawName.toLowerCase().replace(/^svg:/, '');
    if (FORBIDDEN_TAGS.has(tag)) errors.push(`elemento <${tag}> non ammesso`);
    for (const [, rawAttr, , dq, sq] of attrs.matchAll(/([\w:.-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
      const attr = rawAttr.toLowerCase();
      const value = dq ?? sq ?? '';
      const where = `<${tag} ${attr}>`;
      if (attr.startsWith('on')) errors.push(`${where}: script non ammessi`);
      if (attr === 'style' || attr === 'class') errors.push(`${where}: usa attributi (fill, stroke…), non ${attr}`);
      if ((attr === 'href' || attr === 'xlink:href') && !value.startsWith('#')) errors.push(`${where}: riferimento esterno non ammesso`);
      if (/url\(\s*['"]?(?!#)/i.test(value)) errors.push(`${where}: url() esterno non ammesso`);
      if (COLOR_PROPS.has(attr)) checkColor(value, where);
    }
  }
  return [...new Set(errors)];
}

/** Markup interno (senza <svg>) del soggetto. */
export const subjectInner = (svg) =>
  svg.replace(/<!--[\s\S]*?-->/g, '').replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '').trim();

/**
 * Sostituisce i segnaposto con i colori reali. `placeholders` e `palette` hanno le stesse chiavi
 * (accent, accent-dark, highlight, bg). Gli id interni (clipPath) ricevono il prefisso `idPrefix`.
 */
export function colorizeSubject(inner, placeholders, palette, idPrefix = 's') {
  const map = new Map(Object.entries(placeholders).map(([k, hex]) => [normalizeHex(hex), palette[k]]));
  return inner
    .replace(COLOR_ATTR, (m, prop, value) => {
      const to = map.get(normalizeHex(value));
      return to ? `${prop}="${to}"` : m;
    })
    .replace(/\bid="([\w-]+)"/g, `id="${idPrefix}-$1"`)
    .replace(/url\(#([\w-]+)\)/g, `url(#${idPrefix}-$1)`);
}
