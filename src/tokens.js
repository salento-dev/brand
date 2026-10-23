// Resolver minimale per token W3C DTCG: appiattisce l'albero e risolve gli alias {a.b.c}.
import fs from 'node:fs';
import { TOKENS_FILE } from './paths.js';

const ALIAS = /^\{([^}]+)\}$/;

/** Appiattisce l'albero: { 'color.cyan.500': { value, type } }. $type si eredita dai gruppi. */
function flatten(node, prefix = '', inheritedType, out = {}) {
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$') || child === null || typeof child !== 'object') continue;
    const name = prefix ? `${prefix}.${key}` : key;
    const type = child.$type ?? inheritedType;
    if ('$value' in child) out[name] = { value: child.$value, type };
    else flatten(child, name, type, out);
  }
  return out;
}

/** Restituisce una mappa piatta nome -> valore risolto. Lancia errore su alias mancanti o cicli. */
export function resolveTokens(tree) {
  const flat = flatten(tree);
  const resolved = {};
  const resolve = (name, stack = []) => {
    if (name in resolved) return resolved[name];
    if (!(name in flat)) throw new Error(`Token sconosciuto: {${name}}${stack.length ? ` (da ${stack.at(-1)})` : ''}`);
    if (stack.includes(name)) throw new Error(`Alias circolare: ${[...stack, name].join(' -> ')}`);
    const { value } = flat[name];
    const match = typeof value === 'string' && value.match(ALIAS);
    resolved[name] = match ? resolve(match[1], [...stack, name]) : value;
    return resolved[name];
  };
  for (const name of Object.keys(flat)) resolve(name);
  return resolved;
}

export function loadTokens(file = TOKENS_FILE) {
  return resolveTokens(JSON.parse(fs.readFileSync(file, 'utf8')));
}

/** Converte una dimensione DTCG ({value, unit} o "4px") in numero di pixel. */
export const px = (dim) => (typeof dim === 'number' ? dim : typeof dim === 'string' ? parseFloat(dim) : dim.value);

/** Ruoli `semantic.*` (galleria, formati futuri): { bg, surface, text, accent, ... }. */
export function themeFor(tokens) {
  const prefix = 'semantic.';
  return Object.fromEntries(
    Object.entries(tokens).filter(([name]) => name.startsWith(prefix)).map(([name, value]) => [name.slice(prefix.length), value]),
  );
}

/** Nomi degli accenti ammessi per i gruppi permanenti (`group.accents.<nome>`), es. ['cyan', 'violet', …]. */
export const accentNames = (tokens) =>
  [...new Set(Object.keys(tokens).filter((n) => n.startsWith('group.accents.')).map((n) => n.split('.')[2]))];

/** Colori segnaposto dei soggetti: { accent, 'accent-dark', highlight, bg }. */
export const placeholders = (tokens) => ({
  accent: tokens['placeholder.accent'],
  'accent-dark': tokens['placeholder.accent-dark'],
  highlight: tokens['placeholder.highlight'],
  bg: tokens['placeholder.bg'],
});

/**
 * Palette dell'icona di un gruppo: { bg, highlight, accent, 'accent-dark' }.
 * Temporanei: sempre pietra; permanenti: l'accento scelto nel YAML.
 */
export function iconPalette(tokens, group) {
  const base = group.kind === 'temporary' ? 'group.temporary' : `group.accents.${group.accent}`;
  const accent = tokens[`${base}.accent`];
  if (!accent) throw new Error(`Accento sconosciuto: ${group.accent}`);
  return {
    bg: tokens['group.icon.bg'],
    highlight: tokens['group.icon.highlight'],
    accent,
    'accent-dark': tokens[`${base}.accent-dark`],
  };
}
