// Doodle a schizzo per il wallpaper delle icone: libreria SVG (assets/doodles), trattamento "a mano libera"
// (renderSketch), maschere di occupazione e impaccamento senza sovrapposizioni. Tutto deterministico dal seed.
import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { load as loadYaml } from 'js-yaml';
import { DOODLES_DIR, DOODLE_SETS_FILE } from './paths.js';

export const SIZE = 640;
export const C = SIZE / 2;
// ---------------------------------------------------------------- utilità

const hash = (s) => {
  let h = 2166136261;
  for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
};
const mulberry32 = (a) => () => {
  a = (a + 0x6d2b79f5) | 0;
  let x = Math.imul(a ^ (a >>> 15), 1 | a);
  x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
};
const f = (n) => Math.round(n * 100) / 100;
const shuffle = (rand, a) => {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
/** Rumore 1D liscio in [-1, 1], deterministico. */
const noise1 = (seed, x) => {
  const i = Math.floor(x);
  const u = x - i;
  const v = (k) => (mulberry32(hash(`${seed}:${k}`))() * 2 - 1);
  const s = u * u * (3 - 2 * u);
  return v(i) * (1 - s) + v(i + 1) * s;
};

// ---------------------------------------------------------------- matrici e geometria

const I = [1, 0, 0, 1, 0, 0];
const mul = (m, n) => [
  m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
];
const ap = (m, [x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
const T = (x, y = 0) => [1, 0, 0, 1, x, y];
const S = (a, b = a) => [a, 0, 0, b, 0, 0];
const R = (deg) => { const r = (deg * Math.PI) / 180; return [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0]; };
function parseTransform(str) {
  let m = I;
  for (const [, fn, args] of str.matchAll(/(\w+)\s*\(([^)]*)\)/g)) {
    const a = args.split(/[\s,]+/).filter(Boolean).map(Number);
    const tr = fn === 'translate' ? T(a[0], a[1] ?? 0)
      : fn === 'scale' ? S(a[0], a[1] ?? a[0])
      : fn === 'rotate' ? (a.length > 1 ? mul(mul(T(a[1], a[2]), R(a[0])), T(-a[1], -a[2])) : R(a[0]))
      : fn === 'matrix' ? a : null;
    if (!tr) throw new Error(`transform non supportata: ${fn}`);
    m = mul(m, tr);
  }
  return m;
}
const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

/** d di una path → sottopercorsi di cubiche [{ segs: [[p0,p1,p2,p3]], closed }]. Niente archi (A). */
function pathToSubpaths(d) {
  const toks = d.match(/[MmLlHhVvCcSsQqTtZz]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g);
  const subs = [];
  let i = 0, cmd = null, cur = [0, 0], start = [0, 0], prevC = null, prevQ = null, sp = null;
  const n = () => Number(toks[i++]);
  const pt = (rel) => { const x = n(), y = n(); return rel ? [cur[0] + x, cur[1] + y] : [x, y]; };
  const seg = (s) => { sp.segs.push(s); cur = s[3]; };
  const line = (p) => seg([cur, lerp(cur, p, 1 / 3), lerp(cur, p, 2 / 3), p]);
  while (i < toks.length) {
    if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
    else if (cmd === 'M') cmd = 'L';
    else if (cmd === 'm') cmd = 'l';
    const rel = cmd === cmd.toLowerCase();
    const C_ = cmd.toUpperCase();
    let nc = null, nq = null;
    if (C_ === 'M') { cur = pt(rel); start = cur; sp = { segs: [], closed: false }; subs.push(sp); }
    else if (C_ === 'L') line(pt(rel));
    else if (C_ === 'H') { const x = n(); line([rel ? cur[0] + x : x, cur[1]]); }
    else if (C_ === 'V') { const y = n(); line([cur[0], rel ? cur[1] + y : y]); }
    else if (C_ === 'C') { const a = pt(rel), b = pt(rel), p = pt(rel); seg([cur, a, b, p]); nc = b; }
    else if (C_ === 'S') { const a = prevC ? [2 * cur[0] - prevC[0], 2 * cur[1] - prevC[1]] : cur; const b = pt(rel), p = pt(rel); seg([cur, a, b, p]); nc = b; }
    else if (C_ === 'Q' || C_ === 'T') {
      const q = C_ === 'Q' ? pt(rel) : prevQ ? [2 * cur[0] - prevQ[0], 2 * cur[1] - prevQ[1]] : cur;
      const p = pt(rel);
      seg([cur, lerp(cur, q, 2 / 3), lerp(p, q, 2 / 3), p]); nq = q;
    } else if (C_ === 'Z') {
      if (Math.hypot(cur[0] - start[0], cur[1] - start[1]) > 0.01) line(start);
      sp.closed = true; cur = start;
      // un comando dopo Z senza M riparte da start
      sp = { segs: [], closed: false }; subs.push(sp);
    } else throw new Error(`comando path non supportato: ${cmd}`);
    prevC = nc; prevQ = nq;
  }
  return subs.filter((s) => s.segs.length);
}
const K = 0.5523;
const ellipseD = (cx, cy, rx, ry) =>
  `M${cx + rx} ${cy} C${cx + rx} ${cy + K * ry} ${cx + K * rx} ${cy + ry} ${cx} ${cy + ry} C${cx - K * rx} ${cy + ry} ${cx - rx} ${cy + K * ry} ${cx - rx} ${cy} C${cx - rx} ${cy - K * ry} ${cx - K * rx} ${cy - ry} ${cx} ${cy - ry} C${cx + K * rx} ${cy - ry} ${cx + rx} ${cy - K * ry} ${cx + rx} ${cy} Z`;
function rectD(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  const k = r * (1 - K);
  return `M${x + r} ${y} L${x + w - r} ${y} C${x + w - k} ${y} ${x + w} ${y + k} ${x + w} ${y + r} L${x + w} ${y + h - r} C${x + w} ${y + h - k} ${x + w - k} ${y + h} ${x + w - r} ${y + h} L${x + r} ${y + h} C${x + k} ${y + h} ${x} ${y + h - k} ${x} ${y + h - r} L${x} ${y + r} C${x} ${y + k} ${x + k} ${y} ${x + r} ${y} Z`;
}

/** Markup interno di un doodle → elementi con geometria (coordinate del viewBox) e stile ereditato. */
function parseShapes(inner) {
  const out = [];
  const stack = [{ m: I, fill: 'none', fop: 1, stroke: true, w: 1 }];
  for (const mt of inner.matchAll(/<!--[\s\S]*?-->|<(\/?)([a-zA-Z]+)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>/g)) {
    if (!mt[2]) continue;
    const [, close, tag, attrStr, selfClose] = mt;
    if (close) { stack.pop(); continue; }
    const a = Object.fromEntries([...attrStr.matchAll(/([\w:-]+)="([^"]*)"/g)].map((x) => [x[1], x[2]]));
    const p = stack.at(-1);
    const st = {
      m: a.transform ? mul(p.m, parseTransform(a.transform)) : p.m,
      fill: a.fill ?? p.fill,
      fop: a['fill-opacity'] != null ? Number(a['fill-opacity']) : p.fop,
      stroke: a.stroke ? a.stroke !== 'none' : p.stroke,
      w: a['data-w'] != null ? Number(a['data-w']) : p.w,
    };
    if (tag === 'g') { if (!selfClose) stack.push(st); continue; }
    const num = (k, d = 0) => (a[k] != null ? Number(a[k]) : d);
    let d;
    if (tag === 'path') d = a.d;
    else if (tag === 'circle') d = ellipseD(num('cx'), num('cy'), num('r'), num('r'));
    else if (tag === 'ellipse') d = ellipseD(num('cx'), num('cy'), num('rx'), num('ry'));
    else if (tag === 'rect') d = rectD(num('x'), num('y'), num('width'), num('height'), num('rx', num('ry')));
    else if (tag === 'line') d = `M${num('x1')} ${num('y1')} L${num('x2')} ${num('y2')}`;
    else if (tag === 'polyline' || tag === 'polygon') d = `M${a.points}${tag === 'polygon' ? 'Z' : ''}`;
    else continue;
    const subs = pathToSubpaths(d).map((s) => ({ closed: s.closed, segs: s.segs.map((sg) => sg.map((q) => ap(st.m, q))) }));
    out.push({ subs, fill: st.fill !== 'none', fop: st.fop, stroke: st.stroke, w: st.w });
    if (!selfClose && tag !== 'path') stack.push(st); // elementi non auto-chiusi (raro)
  }
  return out;
}

// ---------------------------------------------------------------- librerie

/** Carica una cartella di SVG come libreria: Map nome → { inner, vb, shapes }. `id` distingue le cache delle maschere. */
export function loadLibrary(dir, id = dir) {
  const lib = new Map();
  lib.id = id;
  for (const file of fs.readdirSync(dir).filter((n) => n.endsWith('.svg')).sort()) {
    const name = file.slice(0, -4);
    const src = fs.readFileSync(path.join(dir, file), 'utf8');
    const vb = src.match(/viewBox="([^"]+)"/)[1].split(/[\s,]+/).map(Number);
    const inner = src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '').trim();
    lib.set(name, { name, inner, vb: vb[2], shapes: parseShapes(inner) });
  }
  return lib;
}
// ---------------------------------------------------------------- rendering di un doodle

/** Spessore del tratto (px a 640) in funzione della dimensione: costante a vista, un filo più spesso per le scene. */
const strokeFor = (s) => 2.45 + 0.0045 * s;
const placeMatrix = (it, vb) => mul(mul(mul(T(it.x, it.y), R(it.rot)), S(it.s / vb)), T(-vb / 2, -vb / 2));

// trattamento a mano libera -------------------------------------------------

const cubicAt = ([a, b, c, d], u) => {
  const v = 1 - u;
  return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]];
};
const segLen = ([a, b, c, d]) => {
  const chord = Math.hypot(d[0] - a[0], d[1] - a[1]);
  const poly = Math.hypot(b[0] - a[0], b[1] - a[1]) + Math.hypot(c[0] - b[0], c[1] - b[1]) + Math.hypot(d[0] - c[0], d[1] - c[1]);
  return (chord + poly) / 2;
};
function sample(segs, step) {
  const pts = [segs[0][0]];
  for (const s of segs) {
    const n = Math.max(1, Math.ceil(segLen(s) / step));
    for (let i = 1; i <= n; i++) pts.push(cubicAt(s, i / n));
  }
  // rimuovi punti coincidenti
  return pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 0.05);
}
const ptsStr = (pts) => pts.map((p) => `${f(p[0])},${f(p[1])}`).join(' ');

/**
 * Tratto "a pennello": polilinea con piccola ondulazione lungo la normale, spessore che varia con un rumore
 * lento e si assottiglia alle estremità; i tracciati chiusi non si chiudono perfettamente (leggero sormonto).
 * Restituisce polilinee a spessore costante per tratti (spessore quantizzato), con estremi arrotondati.
 */
function brush(pts, { closed, w, seed, amp }) {
  if (pts.length < 2) return '';
  let P = pts.slice();
  if (closed) {
    // sormonto: prosegui oltre il punto di partenza per ~5px, spostandoti leggermente verso l'esterno
    let acc = 0;
    for (let i = 1; i < pts.length && acc < 7; i++) {
      acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      P.push(pts[i]);
    }
  }
  const n = P.length;
  const L = [0];
  for (let i = 1; i < n; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const total = L[n - 1];
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    let off = amp * noise1(seed, L[i] / 34);
    if (closed) off += (L[i] / total) * amp * 1.4; // il fine tratto non ricade sull'inizio
    out.push([P[i][0] - (dy / len) * off, P[i][1] + (dx / len) * off]);
  }
  const widths = L.map((l) => {
    let k = 0.74 + 0.48 * (noise1(seed + 7, l / 22) * 0.5 + 0.5);
    if (!closed) {
      const e = Math.min(l, total - l);
      k *= 0.55 + 0.45 * Math.min(1, e / 7);
    }
    return Math.max(0.6, Math.round(w * k * 4) / 4);
  });
  let svg = '';
  let runStart = 0;
  for (let i = 1; i <= n; i++) {
    if (i === n || widths[i] !== widths[runStart]) {
      const end = Math.min(i, n - 1);
      svg += `<polyline points="${ptsStr(out.slice(runStart, end + 1))}" stroke-width="${widths[runStart]}"/>`;
      runStart = end;
    }
  }
  return svg;
}
/** Opzioni: w = spessore del tratto (px), amp = ampiezza dell'ondulazione; di default dipendono dalla taglia. */
function renderSketch(lib, it, seed, { w = strokeFor(it.s), amp = Math.min(1.5, Math.max(0.45, it.s * 0.009)) } = {}) {
  const d = lib.get(it.name);
  const M = placeMatrix(it, d.vb);
  let strokes = '', fills = '';
  d.shapes.forEach((sh, si) => {
    sh.subs.forEach((sub, j) => {
      const segs = sub.segs.map((sg) => sg.map((q) => ap(M, q)));
      const pts = sample(segs, 1.6);
      const sd = `${seed}:${si}:${j}`;
      if (sh.fill) {
        // riempimento leggermente fuori registro rispetto al tratto, come colorato a mano
        const fp = pts.map((p, i) => [p[0] + 1.3 + 0.5 * noise1(sd + 'f', i / 9), p[1] + 1 + 0.5 * noise1(sd + 'g', i / 9)]);
        fills += `<polygon points="${ptsStr(fp)}" fill-opacity="${sh.fop}" stroke="none"/>`;
      }
      if (sh.stroke) strokes += brush(pts, { closed: sub.closed, w: w * sh.w, seed: sd, amp: amp * (sh.w < 1 ? 0.7 : 1) });
    });
  });
  return `<g fill="currentColor" stroke="none">${fills}</g><g fill="none" stroke="currentColor">${strokes}</g>`;
}

// ---------------------------------------------------------------- impaccamento

const CELL = 2;
const GMIN = -80;
const GN = (SIZE - 2 * GMIN) / CELL;
const VISIBLE_R = 316;

/** Maschera di occupazione del doodle (silhouette piena, dilatata di gap/2) a CELL px per cella. */
const maskCache = new Map();
function maskFor(lib, name, s, rot, gap) {
  const key = `${lib.id}|${name}|${f(s)}|${f(rot)}|${gap}`;
  if (maskCache.has(key)) return maskCache.get(key);
  const d = lib.get(name);
  const k = s / d.vb;
  const hb = Math.ceil(s * 0.75 + gap);
  const W = Math.ceil((2 * hb) / CELL);
  const sw = (strokeFor(s) + gap) / k;
  const inner = d.inner
    .replace(/data-w="[\d.]+"/g, '')
    .replace(/stroke="none"/g, '')
    .replace(/fill-opacity="[\d.]+"/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="${-hb} ${-hb} ${2 * hb} ${2 * hb}"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${f(rot)}) scale(${f(k)}) translate(${-d.vb / 2} ${-d.vb / 2})" stroke-width="${f(sw)}">${inner.replace(/currentColor/g, '#000')}</g></svg>`;
  const img = new Resvg(svg, { font: { loadSystemFonts: false } }).render();
  const px = img.pixels;
  const occ = new Uint8Array(W * W);
  for (let i = 0; i < W * W; i++) occ[i] = px[i * 4 + 3] > 16 ? 1 : 0;
  // riempi i buchi: tutto ciò che non è raggiungibile dal bordo è interno
  const outside = new Uint8Array(W * W);
  const q = [];
  for (let i = 0; i < W; i++) for (const c of [i, (W - 1) * W + i, i * W, i * W + W - 1]) if (!occ[c] && !outside[c]) { outside[c] = 1; q.push(c); }
  while (q.length) {
    const c = q.pop();
    const x = c % W, y = (c / W) | 0;
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (nx < 0 || ny < 0 || nx >= W || ny >= W) continue;
      const nc = ny * W + nx;
      if (!occ[nc] && !outside[nc]) { outside[nc] = 1; q.push(nc); }
    }
  }
  const cells = [];
  for (let i = 0; i < W * W; i++) if (!outside[i]) cells.push(i % W, (i / W) | 0);
  const m = { cells: Int16Array.from(cells), W, hb };
  maskCache.set(key, m);
  return m;
}

class Packer {
  constructor() { this.grid = new Uint8Array(GN * GN); }
  origin(m, x, y) { return [Math.round((x - m.hb - GMIN) / CELL), Math.round((y - m.hb - GMIN) / CELL)]; }
  fits(m, x, y) {
    const [ox, oy] = this.origin(m, x, y);
    const c = m.cells;
    for (let i = 0; i < c.length; i += 2) {
      const gx = ox + c[i], gy = oy + c[i + 1];
      if (gx < 0 || gy < 0 || gx >= GN || gy >= GN) continue;
      if (this.grid[gy * GN + gx]) return false;
    }
    return true;
  }
  visible(m, x, y) {
    const [ox, oy] = this.origin(m, x, y);
    const c = m.cells;
    let v = 0;
    for (let i = 0; i < c.length; i += 2) {
      const px = GMIN + (ox + c[i] + 0.5) * CELL - C, py = GMIN + (oy + c[i + 1] + 0.5) * CELL - C;
      if (px * px + py * py < VISIBLE_R * VISIBLE_R) v++;
    }
    return v / (c.length / 2);
  }
  add(m, x, y) {
    const [ox, oy] = this.origin(m, x, y);
    const c = m.cells;
    for (let i = 0; i < c.length; i += 2) {
      const gx = ox + c[i], gy = oy + c[i + 1];
      if (gx >= 0 && gy >= 0 && gx < GN && gy < GN) this.grid[gy * GN + gx] = 1;
    }
  }
}

// ---------------------------------------------------------------- regole della libreria

/** Ruolo dal prefisso del nome: `filler-*` riempitivi, `hero-*` scene (non usate nelle icone), altrimenti doodle. */
export const doodleRole = (name) => (name.startsWith('filler-') ? 'filler' : name.startsWith('hero-') ? 'scene' : 'doodle');

export const doodleExists = (name, dir = DOODLES_DIR) => fs.existsSync(path.join(dir, `${name}.svg`));

/** Set comuni da assets/doodles/sets.yaml: { base: [...], fillers: [...] }. */
export function loadDoodleSets(file = DOODLE_SETS_FILE) {
  const sets = loadYaml(fs.readFileSync(file, 'utf8')) ?? {};
  return { base: sets.base ?? [], fillers: sets.fillers ?? [] };
}

/** Errori di sets.yaml: nomi inesistenti o del tipo sbagliato. */
export function checkDoodleSets(sets, exists = doodleExists) {
  const errors = [];
  for (const [key, role] of [['base', 'doodle'], ['fillers', 'filler']]) {
    if (!Array.isArray(sets[key]) || !sets[key].length) errors.push(`${key}: elenco obbligatorio e non vuoto`);
    for (const n of sets[key] ?? []) {
      if (!exists(n)) errors.push(`${key}: assets/doodles/${n}.svg non esiste`);
      else if (doodleRole(n) !== role) errors.push(`${key}: "${n}" non è un ${role === 'filler' ? 'riempitivo (filler-*)' : 'doodle'}`);
    }
  }
  return errors;
}

const DOODLE_TAGS = new Set(['svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon']);

/** Controlla l'SVG di un doodle (vedi assets/doodles/README.md). Restituisce i messaggi d'errore. */
export function lintDoodle(svg) {
  const errors = [];
  if (Buffer.byteLength(svg) > 12 * 1024) errors.push('file oltre 12KB');
  const body = svg.replace(/<!--[\s\S]*?-->/g, '');
  const tags = [...body.matchAll(/<\s*([a-zA-Z][\w:.-]*)([^>]*)>/g)];
  const root = tags.find(([, n]) => n === 'svg');
  if (!root) return ['elemento <svg> mancante'];
  const vb = root[2].match(/viewBox="([^"]+)"/);
  const [x, y, w, h] = vb ? vb[1].trim().split(/[\s,]+/).map(Number) : [];
  if (!vb || x !== 0 || y !== 0 || !(w > 0) || w !== h) errors.push(`viewBox quadrato "0 0 N N" obbligatorio (trovato "${vb?.[1] ?? ''}")`);
  if (!/stroke="currentColor"/.test(root[2])) errors.push('<svg> deve avere stroke="currentColor"');
  if (!/stroke-linecap="round"/.test(root[2]) || !/stroke-linejoin="round"/.test(root[2])) errors.push('<svg> deve avere stroke-linecap="round" e stroke-linejoin="round"');
  for (const [, tag, attrs] of tags) {
    if (!DOODLE_TAGS.has(tag)) errors.push(`elemento <${tag}> non ammesso`);
    for (const [, attr, value] of attrs.matchAll(/([\w:.-]+)="([^"]*)"/g)) {
      if ((attr === 'fill' || attr === 'stroke') && !['none', 'currentColor'].includes(value)) {
        errors.push(`<${tag} ${attr}="${value}">: solo currentColor o none`);
      }
      if (attr === 'style' || attr === 'class' || attr.startsWith('on') || attr.includes('href')) errors.push(`<${tag} ${attr}> non ammesso`);
      if (attr === 'd' && /[Aa]/.test(value)) errors.push('archi "A" nelle path non supportati dal tratto a mano libera: usa curve C/Q');
    }
  }
  if (!errors.length) {
    try {
      parseShapes(svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, ''));
    } catch (e) {
      errors.push(`geometria non supportata dal tratto a mano libera: ${e.message}`);
    }
  }
  return [...new Set(errors)];
}

export {
  hash, mulberry32, f, shuffle, parseShapes, renderSketch, maskFor, Packer, strokeFor, CELL, GMIN, GN, VISIBLE_R,
};
