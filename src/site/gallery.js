// Galleria delle icone dei gruppi (out/icone/index.html): lista chat simulata di WhatsApp,
// 640 ritagliata a cerchio, 96/48px, download, archiviati.
import fs from 'node:fs';
import path from 'node:path';
import { iconPalette } from '../tokens.js';
import { formatRange } from '../dates.js';
import { OUT_DIR } from '../paths.js';
import { esc, module, sectionHead, telemetry, page, corners } from './html.js';

const KIND_LABEL = { permanent: 'permanente', temporary: 'temporaneo' };

/** Percorsi (relativi a out/) del PNG pieno e dell'anteprima ridotta di un elemento. */
export function itemFiles(item, format) {
  const file = format.output(item);
  const small = path.join(path.dirname(file), String(format.previews?.[0] ?? ''), path.basename(file));
  return {
    file,
    small: format.previews?.length && fs.existsSync(path.join(OUT_DIR, small)) ? small : file,
    exists: fs.existsSync(path.join(OUT_DIR, file)),
  };
}

function card(item, format, tokens, base) {
  const { file, small, exists } = itemFiles(item, format);
  const pal = iconPalette(tokens, item);
  const colorTag = item.kind === 'temporary' ? 'pietra' : item.accent;
  const tags = [
    telemetry(KIND_LABEL[item.kind], 'chip'),
    `<span class="telemetry chip"><i class="dot" style="background:${pal.accent}"></i><i class="dot" style="background:${pal['accent-dark']}"></i>${esc(colorTag)}</span>`,
    item.kind === 'temporary' && telemetry(esc(formatRange(item.starts, item.ends)), 'chip'),
    item.example && telemetry('esempio', 'chip'),
  ].filter(Boolean).join('');
  const alt = `Icona del gruppo ${item.shortName}`;
  const images = exists
    ? `<div class="views">
        <img class="round big" src="${base}${file}" width="256" height="256" alt="${esc(alt)}" loading="lazy">
        <div class="smalls">
          <figure><img class="round" src="${base}${small}" width="96" height="96" alt="" loading="lazy"><figcaption class="telemetry">96px</figcaption></figure>
          <figure><img class="round" src="${base}${small}" width="48" height="48" alt="" loading="lazy"><figcaption class="telemetry">48px</figcaption></figure>
        </div>
      </div>
      <p class="downloads">Scarica: <a href="${base}${file}" download="${item.slug}.png">PNG ${format.width}×${format.height}</a>${small !== file ? ` · <a href="${base}${small}" download="${item.slug}-${format.previews[0]}.png">PNG ${format.previews[0]}px</a>` : ''}</p>`
    : `<p class="missing">Immagine non generata (<code>npm run generate${item.status === 'archived' ? ' -- --include-archived' : ''}</code>).</p>`;
  return `<article class="card icon-card">
    ${corners()}
    <header><h3>${esc(item.shortName)}</h3><code>${esc(item.slug)}</code></header>
    <p class="name">${esc(item.name)} · soggetto <code>${esc(item.subject)}</code></p>
    <div class="tags">${tags}</div>
    ${images}
    ${item.description ? `<p class="desc">${esc(item.description)}</p>` : ''}
  </article>`;
}

/** Lista chat in stile WhatsApp (tema scuro), con i gruppi attivi. Messaggi e orari sono finti. */
export function chatList(items, format, base) {
  const times = ['15:52', '14:22', '11:28', 'Ieri', '18/10/26', '17/10/26', '16/10/26', '15/10/26'];
  const rows = items.map((item, i) => {
    const { small, exists } = itemFiles(item, format);
    const avatar = exists ? `<img src="${base}${small}" width="52" height="52" alt="Icona del gruppo ${esc(item.shortName)}">` : '<span class="ph"></span>';
    return `<li>${avatar}<div class="body"><div class="top"><b>${esc(item.name)}</b><time>${times[i % times.length]}</time></div>
      <p>${esc(item.description ?? 'Nuovo messaggio')}</p></div></li>`;
  }).join('');
  return `<div class="wa" role="img" aria-label="Simulazione della lista chat di WhatsApp con le icone dei gruppi attivi"><div class="wa-head">Gruppi di cui fai parte</div><ul>${rows}</ul></div>`;
}

/** Corpo della galleria: un modulo per formato. `collections`: { groups: () => items }. */
export function gallerySections({ formats, collections, tokens, base }) {
  return formats.map((format) => {
    const items = collections[format.collection]();
    const active = items.filter((i) => i.status !== 'archived');
    const archived = items.filter((i) => i.status === 'archived');
    const grid = (list) => list.map((i) => card(i, format, tokens, base)).join('\n');
    return [
      module({
        id: `${format.id}-chat`,
        body: `${sectionHead({ id: `${format.id}-chat`, n: '01', eyebrow: 'Anteprima', title: 'Nella lista chat di *WhatsApp*', desc: 'Come appaiono le icone dei gruppi attivi a 52px, su tema scuro. Messaggi e orari sono finti.', tag: `${active.length} attivi` })}
        ${chatList(active, format, base)}`,
      }),
      module({
        id: `${format.id}-grid`,
        body: `${sectionHead({ id: `${format.id}-grid`, n: '02', eyebrow: `${format.collection} // ${format.id}`, title: 'Icone dei *gruppi*', desc: `${format.width}×${format.height}, ritagliate da WhatsApp in un cerchio. Qui a 256px, 96px e 48px, con i download.`, tag: `${format.width}×${format.height}` })}
        <div class="grid icons">${grid(active)}</div>`,
      }),
      archived.length && module({
        id: `${format.id}-archived`,
        body: `${sectionHead({ id: `${format.id}-archived`, n: '03', eyebrow: 'Archivio', title: '*Archiviati*', desc: 'Gruppi chiusi: restano scaricabili.', tag: `${archived.length}` })}
        <div class="grid icons archived">${grid(archived)}</div>`,
      }),
    ].filter(Boolean).join('\n');
  }).join('\n');
}

export function galleryPage({ formats, collections, tokens, build, footer }) {
  const base = '../';
  return page({
    title: 'Icone dei gruppi · Salento.dev Brand',
    description: 'Le icone dei gruppi della WhatsApp Community di Salento.dev: anteprime e download.',
    base,
    navLabel: 'Navigazione',
    nav: [['../', '← Brand book'], ['#icon-chat', 'Lista chat'], ['#icon-grid', 'Icone'], ['#icon-archived', 'Archiviati'], ['../brand-kit.zip', 'Kit .zip']],
    main: `<section class="module hero hero-small" aria-labelledby="gallery-title">
      <p class="eyebrow">Grafiche della community</p>
      <h1 id="gallery-title" class="display-page">Icone dei <span class="signal">gruppi</span></h1>
      <p class="lead">Generate da <code>content/groups/*.yaml</code> a ogni push su <code>main</code>. Regole: <a href="../#community">grafiche della community</a>.</p>
      <p class="meta">${telemetry(`Aggiornato: ${esc(build.dateLabel)}`)} ${telemetry(`commit ${esc(build.commit)}`)}</p>
    </section>
${gallerySections({ formats, collections, tokens, base })}`,
    footer,
  });
}
