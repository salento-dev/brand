// Crea out/index.html: galleria delle icone generate (640 ritagliata a cerchio, 96px, 48px, download),
// simulazione della lista chat di WhatsApp (tema scuro) con tutti i gruppi attivi, sezione archiviati.
import fs from 'node:fs';
import path from 'node:path';
import { loadFormats } from '../src/formats.js';
import { loadGroups } from '../src/groups.js';
import { loadTokens, themeFor, iconPalette } from '../src/tokens.js';
import { formatRange } from '../src/dates.js';
import { LOGO_FILE, OUT_DIR } from '../src/paths.js';

const COLLECTIONS = { groups: loadGroups };
const KIND_LABEL = { permanent: 'permanente', temporary: 'temporaneo' };

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const tokens = loadTokens();
const theme = themeFor(tokens);
const formats = await loadFormats();
const logo = fs.readFileSync(LOGO_FILE, 'utf8');

const files = (item, format) => {
  const file = format.output(item);
  const small = path.join(path.dirname(file), String(format.previews?.[0] ?? ''), path.basename(file));
  return {
    file,
    small: format.previews?.length && fs.existsSync(path.join(OUT_DIR, small)) ? small : file,
    exists: fs.existsSync(path.join(OUT_DIR, file)),
  };
};

function card(item, format) {
  const { file, small, exists } = files(item, format);
  const pal = iconPalette(tokens, item);
  const colorTag = item.kind === 'temporary' ? 'pietra' : item.accent;
  const tags = [
    `<span class="tag">${KIND_LABEL[item.kind]}</span>`,
    `<span class="tag"><i style="background:${pal.accent}"></i><i style="background:${pal['accent-dark']}"></i>${esc(colorTag)}</span>`,
    item.kind === 'temporary' && `<span class="tag">${esc(formatRange(item.starts, item.ends))}</span>`,
    item.example && '<span class="tag">esempio</span>',
  ].filter(Boolean).join('');
  const alt = `Icona del gruppo ${item.shortName}`;
  const images = exists
    ? `<div class="views">
        <img class="round big" src="${file}" width="256" height="256" alt="${esc(alt)}">
        <div class="smalls">
          <figure><img class="round" src="${small}" width="96" height="96" alt=""><figcaption>96px</figcaption></figure>
          <figure><img class="round" src="${small}" width="48" height="48" alt=""><figcaption>48px</figcaption></figure>
        </div>
      </div>
      <p class="downloads">Scarica: <a href="${file}" download="${item.slug}.png">PNG ${format.width}×${format.height}</a>
        ${small !== file ? ` · <a href="${small}" download="${item.slug}-${format.previews[0]}.png">PNG ${format.previews[0]}px</a>` : ''}</p>`
    : `<p class="missing">Immagine non generata (npm run generate${item.status === 'archived' ? ' -- --include-archived' : ''}).</p>`;
  return `<article>
    <header><h3>${esc(item.shortName)}</h3><code>${esc(item.slug)}</code></header>
    <p class="name">${esc(item.name)} · soggetto <code>${esc(item.subject)}</code></p>
    <div class="tags">${tags}</div>
    ${images}
    ${item.description ? `<p class="desc">${esc(item.description)}</p>` : ''}
  </article>`;
}

/** Lista chat in stile WhatsApp (tema scuro), con i gruppi attivi. Messaggi e orari sono finti. */
function chatList(items, format) {
  const times = ['15:52', '14:22', '11:28', 'Ieri', '18/10/26', '17/10/26', '16/10/26', '15/10/26'];
  const rows = items.map((item, i) => {
    const { small, exists } = files(item, format);
    const avatar = exists ? `<img src="${small}" width="52" height="52" alt="Icona del gruppo ${esc(item.shortName)}">` : '<span class="ph"></span>';
    return `<li>${avatar}<div class="body"><div class="top"><b>${esc(item.name)}</b><time>${times[i % times.length]}</time></div>
      <p>${esc(item.description ?? 'Nuovo messaggio')}</p></div></li>`;
  }).join('');
  return `<div class="wa"><div class="wa-head">Gruppi di cui fai parte</div><ul>${rows}</ul></div>`;
}

const sections = formats.map((format) => {
  const items = COLLECTIONS[format.collection]();
  const grid = (list) => list.map((i) => card(i, format)).join('\n');
  const active = items.filter((i) => i.status !== 'archived');
  const archived = items.filter((i) => i.status === 'archived');
  return `<section>
    <h2>Anteprima nella lista chat di WhatsApp</h2>
    ${chatList(active, format)}
    <h2>${esc(format.collection)} · <code>${esc(format.id)}</code> <small>${format.width}×${format.height}, ritaglio circolare</small></h2>
    <div class="grid">${grid(active)}</div>
    ${archived.length ? `<h2 class="archived-title">Archiviati</h2><div class="grid archived">${grid(archived)}</div>` : ''}
  </section>`;
}).join('\n');

const page = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Salento.dev · Brand gallery</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; background: ${theme.bg}; color: ${theme.text}; font: 15px/1.5 system-ui, sans-serif; }
  main { max-width: 1200px; margin: 0 auto; padding: 32px 16px 64px; }
  .brand { display: flex; align-items: center; gap: 14px; }
  .brand svg { height: 40px; width: auto; color: ${theme.accent}; }
  h1 { margin: 0; font-size: 24px; } h2 { margin: 40px 0 16px; font-size: 18px; color: ${theme['text-muted']}; }
  h2 small { font-weight: 400; } .archived-title { margin-top: 48px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; }
  article { background: ${theme.surface}; border: 1px solid ${theme.border}; border-radius: 4px; padding: 16px; }
  article header { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
  h3 { margin: 0; font-size: 16px; } code { color: ${theme['text-muted']}; font-size: 12px; }
  .name { margin: 2px 0 0; color: ${theme['text-muted']}; font-size: 13px; }
  .tags { margin: 8px 0 12px; display: flex; gap: 6px; flex-wrap: wrap; }
  .tag { display: inline-flex; align-items: center; gap: 4px; font: 600 11px/1 ui-monospace, monospace; text-transform: uppercase; padding: 4px 8px; border-radius: 999px; border: 1px solid ${theme.border}; color: ${theme['text-muted']}; }
  .tag i { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
  .views { display: flex; gap: 16px; align-items: center; }
  .smalls { display: flex; flex-direction: column; align-items: center; gap: 12px; }
  figure { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  figcaption { font-size: 11px; color: ${theme['text-muted']}; }
  img { display: block; } img.round { border-radius: 50%; } img.big { width: 256px; height: 256px; }
  .downloads { margin: 12px 0 0; font-size: 13px; color: ${theme['text-muted']}; } .downloads a { color: ${theme.accent}; }
  .desc { color: ${theme['text-muted']}; font-size: 13px; margin: 12px 0 0; }
  .missing { color: ${theme['text-muted']}; font-style: italic; }
  .archived article { opacity: .6; }
  /* simulazione WhatsApp (tema scuro, iOS) */
  .wa { max-width: 460px; background: #0b0b0b; border-radius: 16px; padding: 8px 0 4px; font-family: -apple-system, system-ui, sans-serif; }
  .wa-head { color: #8d8d92; font-size: 14px; padding: 6px 16px 4px; }
  .wa ul { list-style: none; margin: 0; padding: 0; }
  .wa li { display: flex; gap: 12px; padding: 10px 16px 0; }
  .wa li img, .wa .ph { width: 52px; height: 52px; border-radius: 50%; flex: none; background: #222; }
  .wa .body { flex: 1; min-width: 0; border-bottom: 1px solid #262626; padding-bottom: 10px; }
  .wa li:last-child .body { border-bottom: 0; }
  .wa .top { display: flex; justify-content: space-between; gap: 8px; }
  .wa b { color: #fff; font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .wa time { color: #8d8d92; font-size: 13px; flex: none; }
  .wa p { margin: 2px 0 0; color: #8d8d92; font-size: 14px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
</head>
<body><main>
  <div class="brand">${logo}<div><h1>Salento.dev · Brand gallery</h1><code>Generata il ${new Date().toISOString().slice(0, 10)}</code></div></div>
  ${sections}
</main></body>
</html>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'index.html'), page);
console.log('Scritto out/index.html');
