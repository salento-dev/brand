// Mattoni HTML condivisi dalla pagina brand e dalla galleria: escape, testo inline, layout "Night Console".
import { logoFile, AVATAR_SVG } from '../logo.js';

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Testo con **grassetto**, `codice` e [link](https://…) (unica formattazione ammessa in brand.yaml). */
export const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');

/** Percorso (relativo a out/) di un file del logo pack ufficiale pubblicato nel kit. */
export const logoHref = (family, variant, padding = 'no-padding', format = 'svg') => `kit/logo-pack/${logoFile(family, variant, padding, format)}`;

/** Logo ufficiale come immagine (mai ricostruito): `alt` vuoto = decorativo. */
export const logo = ({ family = 'pictogram', variant = 'white-on-dark', padding = 'no-padding', base = '', alt = '', cls = 'logo' } = {}) =>
  `<img class="${cls}" src="${base}${logoHref(family, variant, padding)}" alt="${esc(alt)}">`;

/** Le quattro staffe d'angolo (SVG a L 11×11, tratto 1px arrotondato), come <x-ui.corners> del sito. */
export const corners = () =>
  ['tl', 'tr', 'bl', 'br'].map((p) => `<svg class="corner ${p}" viewBox="0 0 11 11" fill="none" aria-hidden="true" focusable="false"><path d="M9.5 0.5H0.5V9.5" stroke="currentColor" stroke-linecap="round"/></svg>`).join('');

export const telemetry = (s, cls = '') => `<span class="telemetry${cls ? ` ${cls}` : ''}">${s}</span>`;

const arrow = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const external = '<svg class="ext" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M7 5h8v8M15 5 5 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** CTA pill (Bright Mist + cerchio Signal Cyan Wash con freccia). */
export const cta = (href, label, attrs = '') => `<a class="cta" href="${href}" ${attrs}><span>${label}</span><i>${arrow}</i></a>`;
/** Bottone utility (rettangolo grafite, angoli 0.125rem). */
export const btn = (href, label, { externalLink = false } = {}) =>
  `<a class="btn" href="${href}"${externalLink ? ' rel="noopener"' : ''}>${label}${externalLink ? `${external}<span class="sr-only"> (sito esterno)</span>` : ''}</a>`;

/**
 * Header di sezione: eyebrow cyan, titolo con una parola in cyan, descrizione in Muted Mist, tag telemetria a destra.
 * `title` può contenere `*parola*` per l'accento.
 */
export function sectionHead({ id, n, eyebrow, title, desc, tag }) {
  const t = esc(title).replace(/\*(.+?)\*/, '<span class="signal">$1</span>');
  return `<div class="section-head">
    <div>
      <p class="eyebrow">${n ? `${n} // ` : ''}${esc(eyebrow)}</p>
      <h2 id="${id}-title">${t}</h2>
      ${desc ? `<p class="section-desc">${inline(desc)}</p>` : ''}
    </div>
    ${tag ? `<span class="tag-bordered telemetry">${esc(tag)}</span>` : ''}
  </div>`;
}

/** Modulo del pannello: sezione separata da bordi 1px con giunzioni triangolari. */
export const module = ({ id, cls = '', body }) =>
  `<section class="module ${cls}" id="${id}" aria-labelledby="${id}-title">${body}</section>`;

/**
 * Pagina completa: telaio a puntini + pannello. `base` è il prefisso verso la radice di out/ ("" o "../").
 */
export function page({ title, description, base = '', nav = [], navLabel = 'Sezioni', main, footer, current = '' }) {
  const links = nav.map(([href, label]) => `<a href="${href}"${href === current ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('');
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#000000">
<link rel="icon" href="${base}kit/${AVATAR_SVG}" type="image/svg+xml">
<link rel="stylesheet" href="${base}fonts/fonts.css">
<link rel="stylesheet" href="${base}assets/tokens.css">
<link rel="stylesheet" href="${base}assets/brand.css">
</head>
<body>
<a class="skip" href="#contenuto">Vai al contenuto</a>
<div class="panel">
  <header class="topbar">
    <a class="brandmark" href="${base || './'}">${logo({ family: 'horizontal', base, alt: 'Salento.dev' })}<span><span class="slash">/</span>Brand</span></a>
    <nav class="topnav" aria-label="${esc(navLabel)}">${links}</nav>
    ${telemetry('root@salento.dev:~/brand', 'prompt')}
  </header>
  <main id="contenuto">
${main}
  </main>
  <footer class="footer">${footer}</footer>
</div>
<script>
// Copia negli appunti (unico JavaScript della pagina).
document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-copy]');
  if (!b) return;
  try {
    await navigator.clipboard.writeText(b.dataset.copy);
    b.dataset.state = 'ok';
  } catch {
    b.dataset.state = 'err';
  }
  const live = document.getElementById('copy-status');
  if (live) live.textContent = b.dataset.state === 'ok' ? 'Copiato: ' + b.dataset.copy : 'Copia non riuscita';
  setTimeout(() => { delete b.dataset.state; }, 1400);
});
</script>
<p id="copy-status" class="sr-only" aria-live="polite"></p>
</body>
</html>
`;
}
