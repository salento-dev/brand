// Esporta i token come custom properties CSS (tokens.css): usato dalla pagina brand e incluso nel kit.
// Nomi: il percorso del token con "-" al posto di "." (es. brand.color.signal-cyan -> --brand-color-signal-cyan).

const SKIP = /^placeholder\./; // segnaposto dei soggetti: non sono colori del brand

const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const dim = (v) => (typeof v === 'object' && v && 'unit' in v ? `${v.value}${v.unit}` : String(v));
const family = (v) => (Array.isArray(v) ? v.map((f) => (/^[\w-]+$/.test(f) && !/\s/.test(f) ? f : `"${f}"`)).join(', ') : v);

function cssValue(value, type) {
  if (type === 'fontFamily') return family(value);
  if (type === 'dimension') return dim(value);
  return String(value);
}

/** Restituisce le righe `--nome: valore;` per i token risolti (`describeTokens`). */
export function tokenDeclarations(described) {
  const lines = [];
  for (const [name, t] of Object.entries(described)) {
    if (SKIP.test(name)) continue;
    const prop = `--${name.replace(/\./g, '-')}`;
    if (t.type === 'typography') {
      for (const [k, v] of Object.entries(t.value)) {
        lines.push(`${prop}-${kebab(k)}: ${k === 'fontFamily' ? family(v) : dim(v)};`);
      }
      if (t.ext.textTransform) lines.push(`${prop}-text-transform: ${t.ext.textTransform};`);
    } else {
      lines.push(`${prop}: ${cssValue(t.value, t.type)};`);
    }
  }
  return lines;
}

export function tokensCss(described, { header = '' } = {}) {
  return `/* ${header || 'Token Salento.dev'} — generato da tokens/tokens.json, non modificare a mano. */\n:root {\n  ${tokenDeclarations(described).join('\n  ')}\n}\n`;
}
