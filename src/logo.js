// Logo ufficiale (ADR-0013): i file del logo pack del media kit, vendorizzati in assets/logo/official/.
// Il logo non si ricostruisce: qui si elencano, si verificano (presenza, sicurezza degli SVG, checksum)
// e si impacchettano i file ufficiali. L'unico file generato è l'avatar quadrato, che incorpora
// il pittogramma ufficiale senza toccarne la geometria.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Resvg } from '@resvg/resvg-js';
import { OFFICIAL_LOGO_DIR } from './paths.js';

/** Famiglie, varianti di colore, padding e formati del logo pack (nomi dei file ufficiali). */
export const FAMILIES = ['stacked-symbol', 'horizontal', 'compact-stacked', 'pictogram'];
export const VARIANTS = ['dark-on-light', 'white-on-dark', 'cyan-on-dark'];
export const PADDINGS = ['padded', 'no-padding'];
export const FORMATS = ['svg', 'png', 'webp'];

/** Colori ammessi negli SVG ufficiali, per variante (token brand.color.*). */
export const VARIANT_TOKENS = {
  'dark-on-light': { ink: 'brand.color.salento-dark', background: 'brand.color.white' },
  'white-on-dark': { ink: 'brand.color.white', background: 'brand.color.black' },
  'cyan-on-dark': { ink: 'brand.color.salento-cyan', background: 'brand.color.black' },
};

export const MANIFEST = 'SHA256SUMS';
export const UPSTREAM_MANIFEST = 'SHA256SUMS.upstream';
export const PACK_README = 'README.md';
export const LOGO_PACK_ROOT = 'salentodev-logo-pack';
export const LOGO_PACK_ZIP = 'salentodev-logo-pack.zip';

/** Percorso relativo (alla cartella del pack) di un file ufficiale. */
export const logoFile = (family, variant, padding, format = 'svg') =>
  `logos/${format}/${padding}/salentodev-${family}-${variant}-${padding}.${format}`;

/** I 72 file attesi: 4 famiglie × 3 varianti × 2 padding × 3 formati. */
export function expectedFiles() {
  const out = [];
  for (const format of FORMATS) for (const padding of PADDINGS) for (const family of FAMILIES) for (const variant of VARIANTS) {
    out.push(logoFile(family, variant, padding, format));
  }
  return out;
}

export const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

/** Legge un manifest in formato `sha256sum` ("<hash>  <percorso>"): Map percorso -> hash. */
export function readManifest(text) {
  const map = new Map();
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    const m = line.match(/^([0-9a-f]{64}) [ *](.+)$/);
    if (!m) throw new Error(`riga del manifest non valida: ${line}`);
    map.set(m[2], m[1]);
  }
  return map;
}

export const writeManifest = (entries) => entries.map(([p, h]) => `${h}  ${p}`).join('\n') + '\n';

const SVG_ELEMENTS = new Set(['svg', 'title', 'g', 'path']);
const SVG_ATTRIBUTES = new Set(['xmlns', 'width', 'height', 'viewBox', 'role', 'aria-label', 'transform', 'fill', 'fill-rule', 'd']);

/**
 * Controlli di sicurezza e conformità di un SVG ufficiale (dati non fidati):
 * solo svg/title/g/path, attributi noti, niente script, riferimenti esterni, entità o stili;
 * tracciati solo con comandi M/L/C/Z; colori solo quelli della variante.
 * `ink`: colore atteso (hex). Restituisce un elenco di errori.
 */
export function lintOfficialSvg(text, ink) {
  const errors = [];
  if (!text.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')) errors.push('deve iniziare con <svg xmlns="http://www.w3.org/2000/svg"');
  if (/<[!?]/.test(text)) errors.push('dichiarazioni, DOCTYPE, entità o istruzioni non ammesse');
  if (/script|href|url\(|@import|javascript:|data:/i.test(text)) errors.push('script o riferimenti esterni non ammessi');
  for (const [, name] of text.matchAll(/<\/?([^\s>/]+)/g)) {
    if (!SVG_ELEMENTS.has(name)) errors.push(`elemento non ammesso: <${name}>`);
  }
  for (const [, attr] of text.matchAll(/\s([^\s=<>"]+)="/g)) {
    if (!SVG_ATTRIBUTES.has(attr)) errors.push(`attributo non ammesso: ${attr}`);
  }
  for (const [, d] of text.matchAll(/\sd="([^"]*)"/g)) {
    if (!/^[MLCZ0-9.\s-]+$/.test(d)) errors.push('tracciato con comandi non previsti');
  }
  for (const [, t] of text.matchAll(/\stransform="([^"]*)"/g)) {
    if (!/^translate\(-?[\d.]+ -?[\d.]+\)$/.test(t)) errors.push(`transform non previsto: ${t}`);
  }
  const fills = new Set([...text.matchAll(/\sfill="([^"]*)"/g)].map((m) => m[1].toLowerCase()));
  if (ink && (fills.size !== 1 || !fills.has(ink.toLowerCase()))) errors.push(`colori ${[...fills].join(', ')}: atteso solo ${ink}`);
  return [...new Set(errors)];
}

const MAGIC = {
  png: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  webp: (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP',
};

/**
 * Verifica il logo pack vendorizzato: 72 file attesi e nessun altro, manifest SHA256SUMS identico ai file,
 * SVG sicuri e nei colori della variante, PNG/WEBP con la firma giusta. Restituisce gli errori.
 */
export function checkOfficialPack(tokens, dir = OFFICIAL_LOGO_DIR) {
  const errors = [];
  const expected = expectedFiles();
  const present = fs.existsSync(path.join(dir, 'logos'))
    ? fs.readdirSync(path.join(dir, 'logos'), { recursive: true }).map((p) => `logos/${p.split(path.sep).join('/')}`).filter((p) => fs.statSync(path.join(dir, p)).isFile())
    : [];
  for (const f of expected) if (!present.includes(f)) errors.push(`manca ${f}`);
  for (const f of present) if (!expected.includes(f)) errors.push(`file non previsto: ${f}`);
  for (const f of [MANIFEST, PACK_README]) if (!fs.existsSync(path.join(dir, f))) errors.push(`manca ${f}`);
  if (errors.length) return errors;

  const manifest = readManifest(fs.readFileSync(path.join(dir, MANIFEST), 'utf8'));
  if (manifest.size !== expected.length || expected.some((f) => !manifest.has(f))) errors.push(`${MANIFEST}: deve elencare esattamente i ${expected.length} file`);
  for (const f of expected) {
    const buf = fs.readFileSync(path.join(dir, f));
    if (manifest.has(f) && manifest.get(f) !== sha256(buf)) errors.push(`${f}: checksum diverso da ${MANIFEST}`);
    const ext = f.split('.').pop();
    if (ext === 'svg') {
      const variant = VARIANTS.find((v) => f.includes(`-${v}-`));
      lintOfficialSvg(buf.toString('utf8'), tokens?.[VARIANT_TOKENS[variant].ink]).forEach((e) => errors.push(`${f}: ${e}`));
    } else if (!MAGIC[ext](buf)) errors.push(`${f}: non è un ${ext.toUpperCase()} valido`);
  }
  return errors;
}

/** File del logo pack per gli zip e per out/: [{ path, data }] relativi alla radice del pack. */
export function logoPackFiles(dir = OFFICIAL_LOGO_DIR) {
  return [PACK_README, MANIFEST, ...expectedFiles()].map((p) => ({ path: p, data: fs.readFileSync(path.join(dir, p)) }));
}

export const readOfficialSvg = (family, variant, padding, dir = OFFICIAL_LOGO_DIR) =>
  fs.readFileSync(path.join(dir, logoFile(family, variant, padding, 'svg')), 'utf8');

/** viewBox (numeri e testo originale) e contenuto (dentro <svg>) di un SVG ufficiale. */
export function svgParts(svg) {
  const viewBoxText = svg.match(/viewBox="([^"]+)"/)?.[1];
  const inner = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1];
  if (!viewBoxText || inner === undefined) throw new Error('SVG senza viewBox o <svg>');
  return { viewBox: viewBoxText.split(/\s+/).map(Number), viewBoxText, inner: inner.replace(/<title>[\s\S]*?<\/title>/, '').trim() };
}

/**
 * Rettangoli delle barre del pittogramma, normalizzati: origine in alto a sinistra e altezza `height`.
 * Legge tracciati assoluti (M/L/H/V/Z) con un eventuale translate sul gruppo. Serve a confrontare
 * assets/logo.svg (usato nelle icone dei gruppi) con il pittogramma ufficiale.
 */
export function barBoxes(svg, height = 104.5) {
  const t = svg.match(/translate\((-?[\d.]+)[ ,](-?[\d.]+)\)/);
  const [tx, ty] = t ? [+t[1], +t[2]] : [0, 0];
  const boxes = [...svg.matchAll(/\sd="([^"]+)"/g)].map(([, d]) => {
    const xs = [];
    const ys = [];
    let cmd = '';
    const tokens = d.match(/[MLHVZ]|-?[\d.]+/gi);
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (/[A-Z]/i.test(tok)) { cmd = tok.toUpperCase(); continue; }
      if (cmd === 'M' || cmd === 'L') { xs.push(+tok + tx); ys.push(+tokens[++i] + ty); }
      else if (cmd === 'H') xs.push(+tok + tx);
      else if (cmd === 'V') ys.push(+tok + ty);
    }
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  });
  const [x0, y0] = [Math.min(...boxes.map((b) => b[0])), Math.min(...boxes.map((b) => b[1]))];
  const k = height / (Math.max(...boxes.map((b) => b[3])) - y0);
  return boxes.map(([a, b, c, d]) => [(a - x0) * k, (b - y0) * k, (c - x0) * k, (d - y0) * k])
    .sort((p, q) => p[1] - q[1] || p[0] - q[0]);
}

/**
 * Modulo del pittogramma: altezza di una barra rispetto all'altezza del pittogramma (≈ 7.8%).
 * È il riferimento minimo dell'area di rispetto (media kit).
 */
export function moduleRatio(dir = OFFICIAL_LOGO_DIR) {
  const bars = barBoxes(readOfficialSvg('pictogram', 'white-on-dark', 'no-padding', dir), 1);
  return bars[0][3] - bars[0][1];
}

/**
 * Avatar quadrato (profili social, chat, favicon): il pittogramma ufficiale bianco, incorporato così com'è
 * (stesso viewBox e tracciati), centrato su nero e alto metà del lato, quindi intero anche nel ritaglio a cerchio.
 */
export function avatarSvg(tokens, { size = 1024 } = {}) {
  const { viewBox, viewBoxText, inner } = svgParts(readOfficialSvg('pictogram', 'white-on-dark', 'no-padding'));
  const h = size * 0.5;
  const w = (h * viewBox[2]) / viewBox[3];
  const n = (v) => +v.toFixed(3);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Salento.dev">
<title>Salento.dev</title>
<rect width="${size}" height="${size}" fill="${tokens['brand.color.black']}"/>
<svg x="${n((size - w) / 2)}" y="${n((size - h) / 2)}" width="${n(w)}" height="${n(h)}" viewBox="${viewBoxText}">
${inner}
</svg>
</svg>
`;
}

/** PNG da SVG all'altezza indicata. */
export const pngAtHeight = (svg, height) =>
  new Resvg(svg, { fitTo: { mode: 'height', value: height }, font: { loadSystemFonts: false } }).render().asPng();

export const AVATAR_SIZES = [512, 1024];
export const AVATAR_SVG = 'avatar/salentodev-avatar.svg';
export const avatarPng = (s) => `avatar/salentodev-avatar-${s}.png`;

/** File dell'avatar per il kit: [{ path, data }]. */
export function avatarFiles(tokens) {
  const svg = avatarSvg(tokens);
  return [{ path: AVATAR_SVG, data: Buffer.from(svg) }, ...AVATAR_SIZES.map((s) => ({ path: avatarPng(s), data: pngAtHeight(svg, s) }))];
}
