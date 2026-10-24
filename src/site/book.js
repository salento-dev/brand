// Brand book (out/index.html): una pagina in italiano generata da content/brand/brand.yaml e dai token.
// Il logo si mostra e si scarica solo dai file ufficiali del logo pack (ADR-0013), mai ricostruito.
import { hexToOklch } from '../color.js';
import { contrastRatio } from '../contrast.js';
import { FORMATS, PADDINGS, AVATAR_SIZES, AVATAR_SVG, avatarPng, moduleRatio, readOfficialSvg, svgParts, LOGO_PACK_ZIP } from '../logo.js';
import { KIT_ZIP, KIT_ROOT } from '../kit.js';
import { itemFiles } from './gallery.js';
import { esc, inline, logo, logoHref, corners, telemetry, cta, btn, sectionHead, module, page } from './html.js';

const REPO = 'https://github.com/salento-dev/brand';
const blob = (p) => `${REPO}/blob/main/${p}`;

export const SECTIONS = [
  ['essenza', 'Essenza'],
  ['descrizioni', 'Descrizioni'],
  ['logo', 'Logo'],
  ['colori', 'Colori'],
  ['tipografia', 'Tipografia'],
  ['forme', 'Forme'],
  ['community', 'Community'],
  ['regole', "Do & don't"],
  ['partner', 'Partner'],
  ['download', 'Download'],
];

const COLOR_GROUPS = [
  ['marchio', 'Colori del marchio', 'I colori del logo ufficiale, dal media kit. **Salento Cyan** è il colore primario del brand: l\'unica luce accesa, solo su fondi scuri ([ADR-0014](' + blob('docs/04_decisioni_architetturali/0014_palette_del_marchio_salento_cyan_e_dark.md') + ')).'],
  ['neutri', 'Neutri', 'Grafite fredda appena tinta di blu (scala `mist`): telaio, pannelli, bordi e testo. Profondità solo per gradini tonali.'],
  ['primario', 'Interfaccia del sito: cyan attuale', 'Signal Cyan (`cyan-500`) è il colore **attuale** dell\'interfaccia del sito, da migrare a Salento Cyan. Le varianti Deep, Pale e Wash restano per hover e usi minori.'],
  ['riserva', 'Riserva', 'Token presenti ma non attivi nell\'interfaccia: servono una decisione esplicita (Reserve Rule).'],
  ['funzionali', 'Funzionali', 'Prestiti da marchi e stati, non accenti di marca (Brand-Borrow Rule).'],
];

const fmtNum = (n, d) => String(+n.toFixed(d));
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ');
const bytes = (n) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} KB`);

/** OKLCH di un token colore: valore di DESIGN.md o dell'alias primitivo, altrimenti calcolato dall'hex. */
function oklchOf(described, name) {
  let t = described[name];
  if (t.ext.designMd?.startsWith('oklch')) return t.ext.designMd;
  for (let i = 0; i < 5 && t; i++) {
    if (t.ext.oklch) return t.ext.oklch;
    const m = typeof t.raw === 'string' && t.raw.match(/^\{(.+)\}$/);
    t = m ? described[m[1]] : null;
  }
  const [L, C, H] = hexToOklch(described[name].value);
  return `oklch(${fmtNum(L, 1)}% ${fmtNum(C, 3)} ${C < 0.001 ? 0 : fmtNum(H, 1)})`;
}

const copyBtn = (label, value) =>
  `<button type="button" class="copy" data-copy="${esc(value)}" aria-label="Copia ${esc(label)} ${esc(value)}"><span class="k">${esc(label)}</span><span class="v">${esc(value)}</span></button>`;

function swatch(described, tokens, { name, title, role, tokenName, extra = '' }) {
  const hex = tokens[name].toUpperCase();
  const onDark = contrastRatio(tokens[name], tokens['brand.color.console-black']);
  const ink = onDark >= contrastRatio(tokens[name], tokens['brand.color.bright-mist']) ? 'var(--brand-color-console-black)' : 'var(--brand-color-bright-mist)';
  return `<article class="swatch">
    <div class="chip-color" style="background:${tokens[name]};color:${ink}">${telemetry(esc(tokenName ?? name.replace(/^brand\.color\./, '')))}</div>
    <div class="swatch-body">
      <h4>${esc(title)}</h4>
      ${extra}
      <p>${inline(role)}</p>
      <div class="codes">${copyBtn('HEX', hex)}${copyBtn('RGB', `rgb(${rgb(tokens[name])})`)}${copyBtn('OKLCH', oklchOf(described, name))}</div>
    </div>
  </article>`;
}

function rulesList(brand, section) {
  const scopeLabel = (s) => brand.scopes[s].label;
  return `<ul class="rules">${brand.rules.filter((r) => r.section === section).map((r) => `<li class="rule">
      ${corners()}
      <p class="rule-head"><b>${esc(r.name)}</b>${telemetry(esc(scopeLabel(r.scope)), `scope scope-${r.scope}`)}</p>
      <p>${inline(r.text)}</p>
    </li>`).join('')}</ul>`;
}

const doList = (items, kind) =>
  `<ul class="dd ${kind}">${items.map((i) => `<li><span class="dd-mark" aria-hidden="true">${kind === 'do' ? '+' : '×'}</span><span><span class="sr-only">${kind === 'do' ? 'Sì: ' : 'No: '}</span>${inline(i)}</span></li>`).join('')}</ul>`;

/** Sfondo corretto per una variante del logo: chiaro (White) o scuro (Black). */
const stageClass = (variant) => (variant.background === 'brand.color.white' ? 'stage-light' : 'stage-dark');

// ---------------------------------------------------------------- sezioni

function hero({ brand, build, kit }) {
  return `<section class="module hero" aria-labelledby="hero-title">
    <div class="hero-text">
      <p class="eyebrow">Brand book // ${esc(brand.identity.domain)}</p>
      <h1 id="hero-title" class="display">Salento.dev <span class="dash">—</span> <span class="signal">Brand</span></h1>
      <p class="lead">${inline(brand.identity.tagline)} Qui trovi logo ufficiale, descrizioni, colori, font e regole per usarli: per chi fa parte della community, per i partner e per i soci.</p>
      <p class="meta">${telemetry(`Aggiornato: ${esc(build.dateLabel)}`)} ${telemetry(`commit <a href="${REPO}/commit/${esc(build.sha)}">${esc(build.commit)}</a>`)}</p>
      <div class="actions">
        ${cta(KIT_ZIP, 'Scarica il kit', `download aria-label="Scarica il kit del brand (zip, ${bytes(kit.zipSize)})"`)}
        <a class="btn" href="${LOGO_PACK_ZIP}" download aria-label="Scarica il logo pack (zip, ${bytes(kit.packSize)})">Logo pack</a>
        ${btn('icone/', 'Icone dei gruppi')}
        ${btn(esc(brand.identity.site), 'Sito', { externalLink: true })}
        ${btn(REPO, 'Repo', { externalLink: true })}
      </div>
    </div>
    <div class="hero-logo">
      ${corners()}
      ${logo({ family: 'stacked-symbol', alt: 'Logo di Salento.dev', cls: 'logo big' })}
      ${telemetry('logo // stacked + simbolo · white on dark', 'caption')}
    </div>
  </section>`;
}

function essence({ brand }) {
  const id = brand.identity;
  const facts = [
    ['Nome', `<strong>${esc(id.name)}</strong>`],
    ['Dominio', `<a href="${esc(id.site)}">${esc(id.domain)}</a>`],
    ['Lingua', esc(id.language)],
    ['Contatti', `<a href="mailto:${esc(id.email)}">${esc(id.email)}</a>`],
    ['Canali', id.channels.map((c) => `<a href="${esc(c.url)}">${esc(c.label)}</a> <span class="muted">· ${esc(c.note)}</span>`).join('<br>')],
  ];
  return module({
    id: 'essenza',
    body: `${sectionHead({ id: 'essenza', n: '01', eyebrow: 'Chi siamo', title: brand.northStar.name.replace(/(\S+)$/, '*$1*'), desc: 'L\'idea che guida tutto il resto: il brand è una console accesa di notte.', tag: 'north star' })}
    <div class="cols-2">
      <div class="prose">
        ${brand.northStar.text.map((p) => `<p>${inline(p)}</p>`).join('\n')}
        <ul class="traits">${brand.northStar.traits.map((t) => `<li>${inline(t)}</li>`).join('')}</ul>
      </div>
      <div class="stack">
        <dl class="facts card">${corners()}${facts.map(([k, v]) => `<div><dt class="telemetry">${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
        <div class="card naming" id="nome">
          <h3>Come si scrive il nome</h3>
          ${doList(id.naming.do, 'do')}
          <p class="telemetry label-dont">Da evitare</p>
          ${doList(id.naming.dont, 'dont')}
        </div>
      </div>
    </div>`,
  });
}

function descriptionsSection({ brand }) {
  const items = brand.descriptions.items.map((d) => `<article class="card desc-card">
      ${corners()}
      <p class="telemetry">${esc(d.label)} // ${esc(d.use)}</p>
      <p class="desc-text">${inline(d.text)}</p>
      <button type="button" class="copy copy-text" data-copy="${esc(d.text)}" aria-label="Copia la descrizione ${esc(d.label.toLowerCase())}"><span class="k">Copia</span><span class="v">${d.text.length} caratteri</span></button>
    </article>`).join('');
  return module({
    id: 'descrizioni',
    body: `${sectionHead({ id: 'descrizioni', n: '02', eyebrow: 'Copy ufficiali', title: 'Descrizioni *ufficiali*', desc: 'Testi pronti da usare in pagine evento, comunicati, newsletter, post social e presentazioni partner. Clicca su «Copia» per copiarli.', tag: 'dal media kit' })}
    <div class="cols-3">${items}</div>`,
  });
}

function variantTile(family, variant) {
  const links = FORMATS.map((f) => `<div><dt class="telemetry">${f.toUpperCase()}</dt><dd>${PADDINGS.map((p) =>
    `<a href="${logoHref(family.id, variant.id, p, f)}" download>${p === 'padded' ? 'con padding' : 'senza padding'}<span class="sr-only"> (${esc(family.name)}, ${esc(variant.name)}, ${f.toUpperCase()})</span></a>`).join('')}</dd></div>`).join('');
  return `<figure class="variant-tile">
      <div class="logo-stage ${stageClass(variant)} fam-${family.id}">${logo({ family: family.id, variant: variant.id, padding: 'padded', alt: `${family.name}, ${variant.name}` })}</div>
      <figcaption><b>${esc(variant.name)}</b> ${telemetry(esc(variant.on))}<br><span class="muted">${esc(variant.description)}</span></figcaption>
      <dl class="dl-links">${links}</dl>
    </figure>`;
}

function clearSpaceDemo() {
  const { viewBox } = svgParts(readOfficialSvg('horizontal', 'white-on-dark', 'no-padding'));
  const [, , w, h] = viewBox;
  const x = moduleRatio() * h; // un modulo = altezza di una barra del pittogramma
  const n = (v) => fmtNum(v, 2);
  const pad = x * 2.2;
  return `<svg class="clearspace" viewBox="${n(-pad)} ${n(-pad)} ${n(w + pad * 2)} ${n(h + pad * 2)}" role="img" aria-labelledby="cs-title">
      <title id="cs-title">Area di rispetto: almeno un modulo del pittogramma (X, l'altezza di una barra) attorno al logo</title>
      <rect x="${n(-x)}" y="${n(-x)}" width="${n(w + 2 * x)}" height="${n(h + 2 * x)}" class="cs-area"/>
      <image href="${logoHref('horizontal', 'white-on-dark')}" x="0" y="0" width="${n(w)}" height="${n(h)}"/>
      <rect x="0" y="0" width="${n(w)}" height="${n(h)}" class="cs-box"/>
      <path class="cs-measure" d="M${n(-x * 1.6)} 0H${n(-x * 0.2)}M${n(-x * 1.6)} ${n(x)}H${n(-x * 0.2)}M${n(-x * 0.9)} 0V${n(x)}"/>
      <g class="cs-x"><path d="M${n(-x)} ${n(h / 2)}H0M${n(w)} ${n(h / 2)}H${n(w + x)}M${n(w / 2)} ${n(-x)}V0M${n(w / 2)} ${n(h)}V${n(h + x)}"/></g>
      <g class="cs-label"><text x="${n(-x * 1.9)}" y="${n(x * 0.75)}" class="row-x">X</text><text x="${n(w + x * 0.5)}" y="${n(h / 2 - 1.2)}">X</text><text x="${n(w / 2 + 2.5)}" y="${n(-x * 0.3)}">X</text><text x="${n(w / 2 + 2.5)}" y="${n(h + x * 0.85)}">X</text></g>
    </svg>`;
}

function logoSection({ brand }) {
  const lg = brand.logo;
  const fam = (id) => lg.families.find((f) => f.id === id);
  const variant = (id) => lg.variants.find((v) => v.id === id);
  const families = lg.families.map((f, i) => `<article class="logo-family" id="logo-${f.id}" aria-labelledby="logo-${f.id}-title">
      <div class="family-head">
        <div>
          <p class="telemetry">${String(i + 1).padStart(2, '0')} // ${esc(f.id)}</p>
          <h3 id="logo-${f.id}-title">${esc(f.name)}</h3>
          <p class="muted">${inline(f.description)}</p>
        </div>
        <p class="family-use">${telemetry('Dove si usa')}<br>${inline(f.use)}</p>
      </div>
      <div class="variant-grid">${lg.variants.map((v) => variantTile(f, v)).join('')}</div>
    </article>`).join('');
  const where = lg.whereToUse.map((w) => {
    const v = variant(w.variant ?? 'white-on-dark');
    return `<tr>
      <th scope="row">${esc(w.where)}</th>
      <td><a href="#logo-${w.family}">${esc(fam(w.family).name)}</a>${w.variant ? ` · ${esc(v.name)}` : ''}</td>
      <td><span class="where-thumb ${stageClass(v)}">${logo({ family: w.family, variant: v.id, padding: 'padded' })}</span></td>
    </tr>`;
  }).join('');
  const guide = lg.guidelines.map((g) => `<div class="card">${corners()}<h3>${esc(g.title)}</h3>${doList(g.items, 'do')}</div>`).join('');
  const dontImg = (cls, v = 'white-on-dark') => logo({ family: 'horizontal', variant: v, padding: 'padded', cls: `logo ${cls}` });
  const donts = [
    ['Deformato', 'stage-dark', dontImg('dont-stretch')],
    ['Inclinato', 'stage-dark', dontImg('dont-skew')],
    ['Con effetti', 'stage-dark', dontImg('dont-glow')],
    ['Ricolorato', 'stage-dark', dontImg('dont-recolor', 'cyan-on-dark')],
    ['Cyan su chiaro', 'stage-light', dontImg('', 'cyan-on-dark')],
    ['Su fondo confuso', 'stage-busy', dontImg('')],
  ].map(([label, stage, img]) => `<figure class="dont-tile" role="listitem"><div class="logo-stage ${stage}">${img}</div><figcaption><span class="dd-mark" aria-hidden="true">×</span> ${label}</figcaption></figure>`).join('');
  return module({
    id: 'logo',
    body: `${sectionHead({ id: 'logo', n: '03', eyebrow: 'Logo', title: 'Il *logo* ufficiale', desc: lg.description, tag: '4 famiglie · 3 varianti · svg png webp' })}
    <p class="note">${corners()}<b>Solo file ufficiali.</b> Tutti i file vengono dal logo pack del <a href="${esc(lg.provenance.url)}">media kit</a> (${esc(lg.provenance.imported)}), con checksum verificati: scaricali da qui, uno per uno o tutti insieme (<a href="${LOGO_PACK_ZIP}" download>${LOGO_PACK_ZIP}</a>). Con padding = piccolo margine incluso; senza padding = taglio stretto.</p>
    <div class="logo-families">${families}</div>
    <h3>Quale logo usare dove</h3>
    <div class="table-wrap"><table class="where">
      <caption class="sr-only">Quale famiglia e variante del logo usare in ciascun contesto</caption>
      <thead><tr><th scope="col">Dove</th><th scope="col">Logo</th><th scope="col">Anteprima</th></tr></thead>
      <tbody>${where}</tbody>
    </table></div>
    <h3>Linee guida</h3>
    <div class="cols-2 guide">${guide}</div>
    <p class="note">${corners()}<b>Fondi chiari.</b> ${inline(lg.lightRule)}</p>
    <div class="cols-2 logo-rules">
      <div class="card">
        ${corners()}
        <h3>Area di rispetto</h3>
        ${clearSpaceDemo()}
        <p><b>X = un modulo del pittogramma</b> (l'altezza di una barra, circa ${Math.round(moduleRatio() * 100)}% dell'altezza del pittogramma): è il minimo. Nessun testo, icona, bordo o altro marchio dentro X; dove puoi, lascia di più. Il padding dei file «con padding» è più piccolo di X.</p>
      </div>
      <div class="card">
        ${corners()}
        <h3>Dimensioni piccole</h3>
        <div class="minsizes">
          ${[['horizontal', 40], ['horizontal', 28], ['pictogram', 24], ['pictogram', 16]].map(([f, h]) => `<figure><div style="height:${h}px">${logo({ family: f })}</div><figcaption class="telemetry">${h}px</figcaption></figure>`).join('')}
        </div>
        <p>Il nome non va ridotto fino a diventare illeggibile: quando non si legge più, usa il <b>pittogramma</b>. Il pittogramma resta riconoscibile fino a circa <b>24px</b> di altezza su schermo (8mm in stampa); più in piccolo, solo come favicon.</p>
        <h3>Avatar</h3>
        <div class="avatar-row">
          <img src="kit/${avatarPng(512)}" width="96" height="96" alt="Avatar: pittogramma ufficiale bianco su nero, ritagliato a cerchio" class="round">
          <img src="kit/${avatarPng(512)}" width="48" height="48" alt="" class="round">
          <p class="muted">Il pittogramma ufficiale white-on-dark su nero, alto metà del lato: resta intero nel ritaglio circolare dei social. È anche la favicon di questa pagina.</p>
        </div>
      </div>
    </div>
    <div class="cols-2 tight">
      <div><h3>Sì</h3>${doList(lg.do, 'do')}</div>
      <div><h3>No</h3>${doList(lg.dont, 'dont')}</div>
    </div>
    <div class="dont-grid" role="list" aria-label="Esempi di usi sbagliati del logo">${donts}</div>
    <div class="card rights" id="diritti">
      ${corners()}
      <h3>Diritti e autorizzazioni</h3>
      ${lg.rights.map((r) => `<p>${inline(r)}</p>`).join('')}
      <p class="muted">Per chiedere l'autorizzazione: <a href="mailto:${esc(brand.identity.email)}">${esc(brand.identity.email)}</a>. Il resto del brand (soggetti, doodle, icone dei gruppi, token, testi) è sotto CC BY 4.0: vedi <a href="#partner">Partner</a>.</p>
    </div>`,
  });
}

/** Contrasto di un colore del marchio su scuro (Console Black) e su bianco. */
function contrastNote(tokens, name) {
  const r = (bg) => fmtNum(contrastRatio(tokens[name], tokens[bg]), 1);
  return `contrasto ${r('brand.color.console-black')}:1 su scuro · ${r('brand.color.white')}:1 su bianco`;
}

function colorsSection({ brand, tokens, described, groups }) {
  const named = Object.entries(described).filter(([n]) => n.startsWith('brand.color.'));
  const groupBlocks = COLOR_GROUPS.map(([cat, label, desc]) => {
    const items = named.filter(([, t]) => t.ext.category === cat);
    return `<div class="color-group">
      <h3>${label}</h3><p class="muted">${inline(desc)}</p>
      <div class="swatches">${items.map(([n, t]) => swatch(described, tokens, { name: n, title: t.ext.name, role: t.description, extra: telemetry(esc(cat === 'marchio' ? contrastNote(tokens, n) : t.ext.siteToken ?? ''), 'site-token') })).join('')}</div>
    </div>`;
  }).join('');
  // grafiche della community: accenti dei gruppi + pietra
  const accentNamesList = [...new Set(Object.keys(tokens).filter((n) => n.startsWith('group.accents.')).map((n) => n.split('.')[2]))];
  const usedBy = (accent) => groups.filter((g) => g.kind === 'permanent' && g.accent === accent && g.status !== 'archived').map((g) => g.shortName);
  const pair = (title, light, dark, role, uses) => `<article class="swatch pair">
      <div class="chip-color split"><span style="background:${tokens[light]}"></span><span style="background:${tokens[dark]}"></span></div>
      <div class="swatch-body">
        <h4>${esc(title)}</h4>
        ${uses ? telemetry(esc(uses), 'site-token') : ''}
        <p>${inline(role)}</p>
        <div class="codes">${copyBtn('ACCENTO', tokens[light].toUpperCase())}${copyBtn('SCURO', tokens[dark].toUpperCase())}${copyBtn('OKLCH', oklchOf(described, light))}</div>
      </div>
    </article>`;
  const community = [
    ...accentNamesList.map((a) => pair(`Accento ${a}`, `group.accents.${a}.accent`, `group.accents.${a}.accent-dark`, `Volumi in luce e doodle (\`${described[`group.accents.${a}.accent`].raw.slice(7, -1)}\`) + ombre piatte (\`${described[`group.accents.${a}.accent-dark`].raw.slice(7, -1)}\`).`, usedBy(a).join(', ') || 'libero')),
    pair('Pietra', 'brand.color.pietra', 'brand.color.pietra-dark', described['brand.color.pietra'].description, 'gruppi temporanei'),
  ].join('');
  const yes = '<span class="yes">sì</span>';
  const no = '<span class="no">no</span>';
  const scopeRows = [
    ['Neutri (mist, Void Black)', `${yes} telaio, pannelli, testo`, `${yes} sfondo mist-900, luce mist-50`],
    ['Salento Cyan (sul sito oggi Signal Cyan)', `${yes} unico accento attivo, solo su scuro`, `${yes} come accento di un gruppo (cyan-400, ADR-0008)`],
    ['Salento Dark, White, Black', `${yes} logo e marchio`, `${no} (il logo stampato è in colore sfondo)`],
    ['Violet, fuchsia', `${no} riserva, serve un ADR`, `${yes} accenti di gruppo (ADR-0008)`],
    ['Emerald, lime', no, `${yes} accenti di gruppo (ADR-0008)`],
    ['Pietra', no, `${yes} solo gruppi temporanei`],
    ['WhatsApp Green, WIP Amber', `${yes} solo WhatsApp/live e WIP`, no],
  ];
  return module({
    id: 'colori',
    body: `${sectionHead({ id: 'colori', n: '04', eyebrow: 'Colori', title: 'Grafite, nebbia e una *spia*', desc: 'Valori dai token (`tokens/tokens.json`): colori del marchio dal media kit, neutri e ruoli dal design system del sito. Clicca su un valore per copiarlo.', tag: `${named.length} colori con nome` })}
    ${groupBlocks}
    <div class="color-group" id="colori-community">
      <h3>Grafiche della community</h3>
      <p class="muted">Solo dentro le icone dei gruppi WhatsApp: un accento per gruppo permanente, la pietra per i temporanei. Sfondo mist-900, luce mist-50.</p>
      <div class="swatches">${community}</div>
    </div>
    <div class="scope card" id="ambiti">
      ${corners()}
      <h3>Due ambiti, una palette</h3>
      <p>Le regole del sito e le icone dei gruppi non sono in conflitto: valgono in <b>ambiti diversi</b> (<a href="${blob('docs/04_decisioni_architetturali/0012_ambiti_interfaccia_e_grafiche_community.md')}">ADR-0012</a>).</p>
      <dl class="scope-defs">${['interfaccia', 'community'].map((s) => `<div><dt>${telemetry(esc(brand.scopes[s].label), `scope scope-${s}`)}</dt><dd>${inline(brand.scopes[s].text)}</dd></div>`).join('')}</dl>
      <div class="table-wrap"><table>
        <caption class="sr-only">Quali colori si usano in ciascun ambito</caption>
        <thead><tr><th scope="col">Colore</th><th scope="col">Interfaccia</th><th scope="col">Grafiche della community</th></tr></thead>
        <tbody>${scopeRows.map(([c, a, b]) => `<tr><th scope="row">${c}</th><td>${a}</td><td>${b}</td></tr>`).join('')}</tbody>
      </table></div>
    </div>
    <h3 class="rules-title">Named rules</h3>
    ${rulesList(brand, 'colori')}`,
  });
}

function typographySection({ brand, described }) {
  const fonts = [
    ['Outfit', 'var(--font-outfit)', 'Titoli: display, headline, title. Geometrico e compatto.', '400 · 500 · 700 · 900', 'https://fonts.google.com/specimen/Outfit'],
    ['Albert Sans', 'var(--font-albert-sans)', 'Testo di lettura, lead, eyebrow. Morbido e leggibile.', '300 · 400 · 600', 'https://fonts.google.com/specimen/Albert+Sans'],
    ['Roboto Mono', 'var(--font-roboto-mono)', 'Solo etichette di telemetria, maiuscolo spaziato.', '400', 'https://fonts.google.com/specimen/Roboto+Mono'],
  ];
  const samples = {
    display: '<span class="signal">Codice e caffè</span><br>nel Salento',
    'display-page': '<span class="signal">Eventi</span> live',
    headline: 'Prossimi incontri',
    title: 'Meetup #7 · Lightning talk a Lecce',
    body: 'Ogni mese un incontro in un comune diverso del Salento: talk brevi, codice dal vivo e tempo per conoscersi.',
    'body-lead': 'Una community di sviluppatori che si ritrova dal vivo, condivide quello che impara e costruisce strumenti aperti.',
    eyebrow: 'Prossimi eventi',
    telemetry: 'Upcoming: 3 // root@salento.dev',
  };
  const rows = Object.entries(described).filter(([n]) => n.startsWith('typography.')).map(([n, t]) => {
    const key = n.split('.')[1];
    const v = t.value;
    const family = v.fontFamily[0];
    const size = `${v.fontSize.value}${v.fontSize.unit}`;
    const spec = [family, v.fontWeight, `${t.ext.responsive ?? size} / ${v.lineHeight}`, v.letterSpacing.value ? `${v.letterSpacing.value}em` : null, t.ext.textTransform ? 'maiuscolo' : null].filter(Boolean).join(' · ');
    return `<tr>
      <th scope="row"><b>${esc(t.ext.name)}</b><br>${telemetry(esc(spec), 'spec')}<br><span class="muted">${esc(t.ext.use ?? '')}</span></th>
      <td><p class="specimen t-${key}" style="--ff:var(--typography-${key}-font-family);--fs:var(--typography-${key}-font-size);--fw:var(--typography-${key}-font-weight);--lh:var(--typography-${key}-line-height);--ls:var(--typography-${key}-letter-spacing)">${samples[key] ?? 'Salento.dev'}</p></td>
    </tr>`;
  }).join('');
  return module({
    id: 'tipografia',
    body: `${sectionHead({ id: 'tipografia', n: '05', eyebrow: 'Tipografia', title: 'Tre famiglie, *una voce*', desc: 'Outfit per i titoli, Albert Sans per leggere, Roboto Mono per la voce «di sistema». Font open source (OFL 1.1), serviti da questa pagina.', tag: 'outfit / albert sans / roboto mono' })}
    <div class="font-cards">${fonts.map(([name, ff, role, weights, url]) => `<article class="card font-card">
      ${corners()}
      <p class="aa" style="font-family:${ff}" aria-hidden="true">Aa</p>
      <h3 style="font-family:${ff}">${name}</h3>
      <p class="muted">${role}</p>
      <p class="glyphs" style="font-family:${ff}" aria-hidden="true">ABCDEFGHIJKLM abcdefghijklm 0123456789 àèéìòù &amp;@#{}</p>
      <p>${telemetry(`pesi: ${weights}`)}</p>
      <p><a href="${url}" rel="noopener">Scarica da Google Fonts<span class="sr-only"> (sito esterno)</span></a></p>
    </article>`).join('')}</div>
    <h3>Gerarchia</h3>
    <div class="table-wrap"><table class="type-table">
      <caption class="sr-only">Gerarchia tipografica: stile, specifiche ed esempio</caption>
      <thead><tr><th scope="col">Stile</th><th scope="col">Esempio</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <h3 class="rules-title">Named rules</h3>
    ${rulesList(brand, 'tipografia')}`,
  });
}

function shapesSection({ brand, tokens }) {
  const steps = [['void-black', 'Void Black'], ['console-black', 'Console Black'], ['panel-graphite', 'Panel Graphite'], ['control-graphite', 'Control Graphite'], ['raised-graphite', 'Raised Graphite']];
  const spacing = [['bracket', '0.625rem'], ['card', '1.25rem'], ['control', '2.5rem'], ['page-x', '4rem'], ['section', '5rem']];
  return module({
    id: 'forme',
    body: `${sectionHead({ id: 'forme', n: '06', eyebrow: 'Forme e layout', title: 'Angoli vivi, *niente ombre*', desc: 'Gli elementi firma del sistema, costruiti qui con gli stessi token.', tag: 'radius 0.125rem' })}
    <div class="demos">
      <figure class="demo">
        <div class="demo-stage radii">
          <span class="r r-xs">xs</span><span class="r r-sm">sm</span><span class="r r-full">full</span>
        </div>
        <figcaption><b>Raggi.</b> <code>0.125rem</code> di default (card, input, tag, bottoni); <code>0.25rem</code> raro; pill solo per CTA, badge e stati.</figcaption>
      </figure>
      <figure class="demo">
        <div class="demo-stage tonal">${steps.map(([k, l]) => `<span style="background:var(--brand-color-${k})">${telemetry(l)}</span>`).join('')}</div>
        <figcaption><b>Profondità tonale.</b> Si sale di un gradino grafite o si aggiunge un bordo 1px Control Graphite. Mai box-shadow.</figcaption>
      </figure>
      <figure class="demo">
        <div class="demo-stage"><a class="bracket-demo" href="#forme">${corners()}<span class="telemetry">hover / focus</span><b>Staffe d'angolo</b></a></div>
        <figcaption><b>Staffe d'angolo.</b> L 11×11, tratto 1px arrotondato. Bracket Grey a riposo, cyan in evidenza; all'hover si allargano.</figcaption>
      </figure>
      <figure class="demo">
        <div class="demo-stage pills">
          <span class="status up"><i></i>Upcoming</span>
          <span class="status live"><i></i>In corso</span>
          <span class="status wip"><i></i>WIP</span>
          <span class="status past">Passato</span>
          <span class="tag-bordered telemetry">Upcoming: 3</span>
          <span class="cat telemetry">Workshop</span>
        </div>
        <figcaption><b>Etichette di telemetria.</b> Roboto Mono 0.625rem, maiuscolo, tracking 0.1em. Verde e ambra solo come stati.</figcaption>
      </figure>
      <figure class="demo">
        <div class="demo-stage dots"><div class="mini-panel">${telemetry('pannello')}</div></div>
        <figcaption><b>Telaio a puntini.</b> Nero puro con puntini chiari a bassa opacità; sopra, il pannello Console Black con bordi 1px.</figcaption>
      </figure>
      <figure class="demo">
        <div class="demo-stage joints"><div class="joint-line"></div><div class="joint-line"></div></div>
        <figcaption><b>Giunzioni triangolari.</b> Triangoli di 5px in Control Graphite alle estremità dei bordi tra i moduli.</figcaption>
      </figure>
    </div>
    <h3>Spaziature con nome</h3>
    <div class="spacing">${spacing.map(([k, r]) => `<div><span class="bar" style="width:var(--spacing-${k})"></span>${telemetry(`${k} · ${r}`)}</div>`).join('')}</div>
    <p class="muted">Pannello largo al massimo 87.5rem; moduli separati da bordi 1px; padding orizzontale 1.5rem → 2rem → 4rem; sezioni a 5rem l'una dall'altra; griglie di card in auto-fill da 20rem.</p>
    <h3 class="rules-title">Named rules</h3>
    ${rulesList(brand, 'forme')}`,
  });
}

function communitySection({ groups, format }) {
  const active = groups.filter((g) => g.status !== 'archived');
  const icons = format
    ? active.map((g) => {
      const { small, exists } = itemFiles(g, format);
      return exists
        ? `<li><a href="icone/#icon-grid"><img src="${small}" width="72" height="72" alt="" class="round"><span>${esc(g.shortName)}</span></a></li>`
        : `<li><span class="ph round"></span><span>${esc(g.shortName)}</span></li>`;
    }).join('')
    : '';
  const docs = [
    ['Icona di gruppo', 'docs/02_icone_gruppi/01_formato_icona.md'],
    ['Soggetti', 'docs/02_icone_gruppi/02_soggetti.md'],
    ['Doodle e wallpaper', 'docs/02_icone_gruppi/03_doodle.md'],
    ['Aggiungere un gruppo', 'docs/03_contribuire/01_aggiungere_un_gruppo.md'],
  ];
  return module({
    id: 'community',
    body: `${sectionHead({ id: 'community', n: '07', eyebrow: 'Grafiche della community', title: 'Icone dei *gruppi*', desc: 'Le icone della WhatsApp Community sono generate da questo repo: un file YAML per gruppo, stesse regole per tutti.', tag: `${active.length} gruppi attivi` })}
    <ul class="icon-strip" aria-label="Icone dei gruppi attivi">${icons}</ul>
    <p class="actions">${cta('icone/', 'Tutte le icone e i download')}</p>
    <div class="anatomy">
      <div class="card">${corners()}<p class="telemetry">01 // sfondo</p><h3>Mist-900 pieno</h3><p>640×640, WhatsApp lo ritaglia a cerchio. Nessun testo: il nome è già accanto all'icona.</p></div>
      <div class="card">${corners()}<p class="telemetry">02 // wallpaper</p><h3>Doodle a schizzo</h3><p>Disegni del tema del gruppo, in accento al 50%, sparsi su tutta l'icona. Disposizione riproducibile.</p></div>
      <div class="card">${corners()}<p class="telemetry">03 // soggetto</p><h3>Flat, al centro</h3><p>Un'illustrazione a forme piene (accento, accento scuro, mist-50) entro il cerchio sicuro, ~69% del diametro.</p></div>
      <div class="card">${corners()}<p class="telemetry">04 // logo</p><h3>Stampato sopra</h3><p>Le barre del logo sono stampate sul soggetto in colore sfondo: tazza, tavolo, petto del robot.</p></div>
    </div>
    <p class="muted">Colori: un accento per gruppo permanente, pietra per i temporanei (vedi <a href="#colori-community">palette</a>). Guide complete: ${docs.map(([l, p]) => `<a href="${blob(p)}">${l}</a>`).join(' · ')}.</p>`,
  });
}

function rulesSection({ brand }) {
  const blocks = brand.dosAndDonts.map((b) => `<div class="card dd-card">
      ${corners()}
      <h3>${telemetry(esc(brand.scopes[b.scope].label), `scope scope-${b.scope}`)}</h3>
      <p class="telemetry label-do">Da fare</p>${doList(b.do, 'do')}
      <p class="telemetry label-dont">Da evitare</p>${doList(b.dont, 'dont')}
    </div>`).join('');
  return module({
    id: 'regole',
    body: `${sectionHead({ id: 'regole', n: '08', eyebrow: "Do's and don'ts", title: 'Da fare, da *evitare*', desc: 'Raggruppati per ambito. Per il logo vedi la sezione dedicata.', tag: 'ambiti: interfaccia / community' })}
    <div class="cols-2">${blocks}</div>`,
  });
}

function partnersSection({ brand }) {
  const id = brand.identity;
  const p = brand.partners;
  return module({
    id: 'partner',
    body: `${sectionHead({ id: 'partner', n: '09', eyebrow: 'Kit per partner e soci', title: 'Usare il *nome* e il logo', desc: p.intro, tag: p.status })}
    <div class="cols-3">
      <div class="card">${corners()}<h3>Citare Salento.dev</h3>${doList(p.naming, 'do')}<p class="muted">Regole di scrittura: <a href="#nome">come si scrive il nome</a>.</p></div>
      <div class="card">${corners()}<h3>Co-branding ${telemetry(esc(p.status), 'chip')}</h3>${doList(p.cobranding, 'do')}</div>
      <div class="card">${corners()}<h3>Diritti e licenza</h3>${doList(p.licence, 'do')}<p class="muted">Attribuzione per gli asset CC BY 4.0: «Grafiche di Salento.dev (https://salento.dev), CC BY 4.0». Testi completi: <a href="#diritti">diritti sul logo</a> · <a href="${blob('LICENSE-ASSETS.md')}">LICENSE-ASSETS.md</a>.</p></div>
    </div>
    <div class="contact card">${corners()}<p class="telemetry">contatti</p><p class="contact-line"><a href="mailto:${esc(id.email)}">${esc(id.email)}</a></p><p class="muted">Per co-branding, eventi insieme e richieste di materiali. Canali: ${id.channels.map((c) => `<a href="${esc(c.url)}">${esc(c.label)}</a>`).join(' · ')}.</p></div>`,
  });
}

function downloadSection({ brand, kit }) {
  const rows = [
    ['Logo pack ufficiale', `${brand.logo.families.length} famiglie × ${brand.logo.variants.length} varianti, SVG/PNG/WEBP, con e senza padding`, [[`ZIP · ${bytes(kit.packSize)}`, LOGO_PACK_ZIP]]],
    ['Avatar', 'profili social, chat e favicon: pittogramma ufficiale su nero', [['SVG', `kit/${AVATAR_SVG}`], ...AVATAR_SIZES.map((s) => [`PNG ${s}`, `kit/${avatarPng(s)}`])]],
    ['Token', 'colori, font, raggi, spaziature', [['tokens.json', 'kit/token/tokens.json'], ['tokens.css', 'kit/token/tokens.css']]],
  ];
  const tree = kit.tree.map((l) => esc(l)).join('\n');
  return module({
    id: 'download',
    body: `${sectionHead({ id: 'download', n: '10', eyebrow: 'Download', title: 'Il *kit* completo', desc: 'Un archivio con il logo pack ufficiale, l\'avatar, le icone dei gruppi, i token e un LEGGIMI con le regole essenziali e la licenza. Generato a ogni aggiornamento. I singoli file del logo sono nella sezione Logo.', tag: `zip · ${bytes(kit.zipSize)}` })}
    <div class="cols-2">
      <div class="card kit">
        ${corners()}
        <p class="telemetry">${esc(KIT_ROOT)}/ · ${kit.count} file</p>
        <pre class="tree" aria-label="Contenuto del kit">${tree}</pre>
        <div class="actions tight-actions">
          ${cta(KIT_ZIP, `Scarica ${KIT_ZIP}`, `download aria-label="Scarica ${KIT_ZIP} (${bytes(kit.zipSize)})"`)}
          <a class="btn" href="${LOGO_PACK_ZIP}" download aria-label="Scarica ${LOGO_PACK_ZIP} (${bytes(kit.packSize)})">Solo il logo pack</a>
        </div>
      </div>
      <div class="table-wrap"><table class="files">
        <caption class="sr-only">File singoli</caption>
        <thead><tr><th scope="col">File</th><th scope="col">Uso</th><th scope="col">Formati</th></tr></thead>
        <tbody>${rows.map(([name, use, links]) => `<tr><th scope="row">${esc(name)}</th><td class="muted">${esc(use)}</td><td class="links">${links.map(([l, h]) => `<a href="${h}" download>${l}</a>`).join(' ')}</td></tr>`).join('')}</tbody>
      </table></div>
    </div>`,
  });
}

/** Footer comune; `base` è il prefisso verso la radice di out/ ("" o "../"). */
export function footerHtml({ brand, build }, base = '') {
  const pv = brand.provenance;
  return `<div class="footer-inner">
    <p>${logo({ base, cls: 'logo tiny' })} <b>Salento.dev</b> · Brand book generato da <a href="${REPO}">salento-dev/brand</a> @ <a href="${REPO}/commit/${esc(build.sha)}"><code>${esc(build.commit)}</code></a> il ${esc(build.dateLabel)}.</p>
    <p class="muted">Fonte di verità: questo repo (<a href="${blob('docs/04_decisioni_architetturali/0011_repo_brand_fonte_di_verita.md')}">ADR-0011</a>). Logo dal <a href="${esc(brand.logo.provenance.url)}">media kit</a> (${esc(brand.logo.provenance.imported)}); regole importate da ${esc(pv.source)}, ${esc(pv.ref)}, ${esc(pv.imported)}. Logo, wordmark e nome: tutti i diritti riservati · altri asset CC BY 4.0 · codice MIT.</p>
  </div>`;
}

export function bookPage(ctx) {
  return page({
    title: 'Salento.dev — Brand',
    description: `Brand book di Salento.dev: logo ufficiale, descrizioni, colori, tipografia, regole e kit per community, partner e soci.`,
    base: '',
    nav: SECTIONS.map(([id, label]) => [`#${id}`, label]),
    main: [hero(ctx), essence(ctx), descriptionsSection(ctx), logoSection(ctx), colorsSection(ctx), typographySection(ctx), shapesSection(ctx), communitySection(ctx), rulesSection(ctx), partnersSection(ctx), downloadSection(ctx)].join('\n'),
    footer: footerHtml(ctx),
  });
}
