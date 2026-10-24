// Brand book (out/index.html): una pagina in italiano generata da content/brand/brand.yaml e dai token.
import { hexToOklch } from '../color.js';
import { contrastRatio } from '../contrast.js';
import { CLEAR_SPACE, CLEAR_SPACE_RATIO, LOGO, MIN_HEIGHT_MM, MIN_HEIGHT_PX, LOGO_VARIANTS, LOGO_PNG_HEIGHTS, AVATAR_SIZES, logoPaths } from '../logo.js';
import { KIT_ZIP, KIT_ROOT } from '../kit.js';
import { itemFiles } from './gallery.js';
import { esc, inline, logo, corners, telemetry, cta, btn, sectionHead, module, page } from './html.js';

const REPO = 'https://github.com/salento-dev/brand';
const blob = (p) => `${REPO}/blob/main/${p}`;

export const SECTIONS = [
  ['essenza', 'Essenza'],
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
  ['neutri', 'Neutri', 'Grafite fredda appena tinta di blu (scala `mist`): telaio, pannelli, bordi e testo. Profondità solo per gradini tonali.'],
  ['primario', 'Primario', 'Signal Cyan è la spia accesa: l\'unico accento attivo dell\'interfaccia.'],
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

// ---------------------------------------------------------------- sezioni

function hero({ brand, build, kit }) {
  return `<section class="module hero" aria-labelledby="hero-title">
    <div class="hero-text">
      <p class="eyebrow">Brand book // ${esc(brand.identity.domain)}</p>
      <h1 id="hero-title" class="display">Salento.dev <span class="dash">—</span> <span class="signal">Brand</span></h1>
      <p class="lead">${inline(brand.identity.tagline)} Qui trovi logo, colori, font e regole per usarli: per chi fa parte della community, per i partner e per i soci.</p>
      <p class="meta">${telemetry(`Aggiornato: ${esc(build.dateLabel)}`)} ${telemetry(`commit <a href="${REPO}/commit/${esc(build.sha)}">${esc(build.commit)}</a>`)}</p>
      <div class="actions">
        ${cta(KIT_ZIP, 'Scarica il kit', `download aria-label="Scarica il kit del brand (zip, ${bytes(kit.zipSize)})"`)}
        ${btn('icone/', 'Icone dei gruppi')}
        ${btn(esc(brand.identity.site), 'Sito', { externalLink: true })}
        ${btn(REPO, 'Repo', { externalLink: true })}
      </div>
    </div>
    <div class="hero-logo">
      ${corners()}
      ${logo({ label: 'Logo di Salento.dev', cls: 'logo big' })}
      ${telemetry('logo // bright mist su console black', 'caption')}
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

function logoSection({ brand, tokens, kit }) {
  const pathsOnly = logoPaths();
  const x = CLEAR_SPACE;
  const vb = `${-x * 1.6} ${-x * 1.6} ${LOGO.width + x * 3.2} ${LOGO.height + x * 3.2}`;
  const clear = `<svg class="clearspace" viewBox="${vb}" role="img" aria-labelledby="cs-title">
      <title id="cs-title">Area di rispetto: X attorno al logo, X uguale a una riga di barre</title>
      <rect x="${-x}" y="${-x}" width="${LOGO.width + 2 * x}" height="${LOGO.height + 2 * x}" class="cs-area"/>
      <rect x="0" y="0" width="${LOGO.width}" height="${LOGO.height}" class="cs-box"/>
      <g class="cs-logo">${pathsOnly}</g>
      <rect x="${LOGO.width + x * 0.25}" y="${LOGO.rows[1]}" width="${x * 0.5}" height="${x}" class="cs-row"/>
      <path class="cs-measure" d="M${LOGO.width + 1} ${LOGO.rows[1]}H${LOGO.width + x * 0.85}M${LOGO.width + 1} ${LOGO.rows[2]}H${LOGO.width + x * 0.85}M${LOGO.width + x * 0.5} ${LOGO.rows[1]}V${LOGO.rows[2]}"/>
      <g class="cs-x"><path d="M${-x} ${LOGO.height / 2}H0M${LOGO.width} ${LOGO.height / 2}H${LOGO.width + x}M${LOGO.width / 2} ${-x}V0M${LOGO.width / 2} ${LOGO.height}V${LOGO.height + x}"/></g>
      <g class="cs-label"><text x="${-x / 2}" y="${LOGO.height / 2 - 3}">X</text><text x="${LOGO.width + x / 2}" y="${LOGO.height / 2 - 3}">X</text><text x="${LOGO.width / 2 + 4}" y="${-x / 2 + 2}">X</text><text x="${LOGO.width / 2 + 4}" y="${LOGO.height + x / 2 + 2}">X</text><text x="${LOGO.width + x * 0.95}" y="${LOGO.rows[1] + x / 2 + 2}" class="row-x">X</text></g>
    </svg>`;
  const variants = LOGO_VARIANTS.map((v) => {
    const light = v.slug === 'nero';
    return `<figure class="logo-tile ${light ? 'on-light' : ''}">
      <div class="logo-stage" style="color:${tokens[v.token]}">${logo({ label: `Logo ${v.label}` })}</div>
      <figcaption><b>${esc(v.label)}</b> ${telemetry(esc(tokens[v.token].toUpperCase()))}<br><span class="muted">${esc(brand.logo.colors.find((c) => c.token === v.token)?.use ?? v.on)}</span></figcaption>
    </figure>`;
  }).join('');
  const donts = [
    ['Deformato', `<svg viewBox="0 0 90 105" preserveAspectRatio="none" class="dont-stretch" fill="currentColor" aria-hidden="true">${pathsOnly}</svg>`],
    ['Ruotato', `<svg viewBox="0 0 90 105" fill="currentColor" aria-hidden="true"><g transform="rotate(-18 45 52)">${pathsOnly}</g></svg>`],
    ['Con effetti', `<svg viewBox="0 0 90 105" fill="currentColor" class="dont-glow" aria-hidden="true">${pathsOnly}</svg>`],
    ['Solo contorno', `<svg viewBox="-2 -2 94 109" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">${pathsOnly}</svg>`],
    ['Ricolorato', `<svg viewBox="0 0 90 105" aria-hidden="true"><defs><linearGradient id="dg" x1="0" x2="1"><stop offset="0" stop-color="${tokens['color.amber.500']}"/><stop offset="1" stop-color="${tokens['color.fuchsia.500']}"/></linearGradient></defs><g fill="url(#dg)">${pathsOnly}</g></svg>`],
  ].map(([label, svg]) => `<figure class="dont-tile"><div class="logo-stage">${svg}</div><figcaption><span class="dd-mark" aria-hidden="true">×</span> ${label}</figcaption></figure>`).join('');
  return module({
    id: 'logo',
    body: `${sectionHead({ id: 'logo', n: '02', eyebrow: 'Logo', title: 'Il *logo*', desc: brand.logo.description, tag: 'svg · png · avatar' })}
    <div class="logo-grid">${variants}</div>
    <p class="note">${corners()}<b>Fondi chiari.</b> ${inline(brand.logo.lightRule)}</p>
    <div class="cols-2 logo-rules">
      <div class="card">
        <h3>Area di rispetto</h3>
        ${clear}
        <p><b>X = una riga di barre</b> (barra + interlinea, ${fmtNum(x, 2)} unità su ${LOGO.height}, circa ${Math.round(CLEAR_SPACE_RATIO * 100)}% dell'altezza). Nessun testo, bordo o altro logo dentro X. I PNG del kit includono già questo margine.</p>
      </div>
      <div class="card">
        <h3>Dimensione minima</h3>
        <div class="minsizes">
          ${[64, 32, MIN_HEIGHT_PX].map((h) => `<figure><div style="height:${h}px">${logo({ cls: 'logo' })}</div><figcaption class="telemetry">${h}px</figcaption></figure>`).join('')}
        </div>
        <p>Almeno <b>${MIN_HEIGHT_PX}px</b> di altezza su schermo e <b>${MIN_HEIGHT_MM}mm</b> in stampa: sotto, le interlinee tra le barre si chiudono. Per avatar e favicon usa l'avatar del kit.</p>
        <h3>Avatar</h3>
        <div class="avatar-row">
          <img src="kit/logo/avatar/salento-dev-avatar-512.png" width="96" height="96" alt="Avatar: logo Bright Mist su Console Black, ritagliato a cerchio" class="round">
          <img src="kit/logo/avatar/salento-dev-avatar-512.png" width="48" height="48" alt="" class="round">
          <p class="muted">Quadrato, logo al 50% dell'altezza: resta intero anche nel ritaglio circolare dei social.</p>
        </div>
      </div>
    </div>
    <div class="cols-2 tight">
      <div><h3>Sì</h3>${doList(brand.logo.do, 'do')}</div>
      <div><h3>No</h3>${doList(brand.logo.dont, 'dont')}</div>
    </div>
    <div class="dont-grid" role="list" aria-label="Esempi di usi sbagliati del logo">${donts.replace(/<figure class="dont-tile">/g, '<figure class="dont-tile" role="listitem">')}</div>`,
  });
}

function colorsSection({ brand, tokens, described, groups }) {
  const named = Object.entries(described).filter(([n]) => n.startsWith('brand.color.'));
  const groupBlocks = COLOR_GROUPS.map(([cat, label, desc]) => {
    const items = named.filter(([, t]) => t.ext.category === cat);
    return `<div class="color-group">
      <h3>${label}</h3><p class="muted">${inline(desc)}</p>
      <div class="swatches">${items.map(([n, t]) => swatch(described, tokens, { name: n, title: t.ext.name, role: t.description, extra: telemetry(esc(t.ext.siteToken ?? ''), 'site-token') })).join('')}</div>
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
    ['Signal Cyan', `${yes} unico accento attivo`, `${yes} come accento di un gruppo (cyan-400)`],
    ['Violet, fuchsia', `${no} riserva, serve un ADR`, `${yes} accenti di gruppo (ADR-0008)`],
    ['Emerald, lime', no, `${yes} accenti di gruppo (ADR-0008)`],
    ['Pietra', no, `${yes} solo gruppi temporanei`],
    ['WhatsApp Green, WIP Amber', `${yes} solo WhatsApp/live e WIP`, no],
  ];
  return module({
    id: 'colori',
    body: `${sectionHead({ id: 'colori', n: '03', eyebrow: 'Colori', title: 'Grafite, nebbia e una *spia*', desc: 'Valori dai token (`tokens/tokens.json`); nomi e ruoli dal design system del sito. Clicca su un valore per copiarlo.', tag: `${named.length} colori con nome` })}
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
    body: `${sectionHead({ id: 'tipografia', n: '04', eyebrow: 'Tipografia', title: 'Tre famiglie, *una voce*', desc: 'Outfit per i titoli, Albert Sans per leggere, Roboto Mono per la voce «di sistema». Font open source (OFL 1.1), serviti da questa pagina.', tag: 'outfit / albert sans / roboto mono' })}
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
    body: `${sectionHead({ id: 'forme', n: '05', eyebrow: 'Forme e layout', title: 'Angoli vivi, *niente ombre*', desc: 'Gli elementi firma del sistema, costruiti qui con gli stessi token.', tag: 'radius 0.125rem' })}
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
    body: `${sectionHead({ id: 'community', n: '06', eyebrow: 'Grafiche della community', title: 'Icone dei *gruppi*', desc: 'Le icone della WhatsApp Community sono generate da questo repo: un file YAML per gruppo, stesse regole per tutti.', tag: `${active.length} gruppi attivi` })}
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
    body: `${sectionHead({ id: 'regole', n: '07', eyebrow: "Do's and don'ts", title: 'Da fare, da *evitare*', desc: 'Raggruppati per ambito. Per il logo vedi la sezione dedicata.', tag: 'ambiti: interfaccia / community' })}
    <div class="cols-2">${blocks}</div>`,
  });
}

function partnersSection({ brand }) {
  const id = brand.identity;
  const p = brand.partners;
  return module({
    id: 'partner',
    body: `${sectionHead({ id: 'partner', n: '08', eyebrow: 'Kit per partner e soci', title: 'Usare il *nome* e il logo', desc: p.intro, tag: p.status })}
    <div class="cols-3">
      <div class="card">${corners()}<h3>Citare Salento.dev</h3>${doList(p.naming, 'do')}<p class="muted">Regole di scrittura: <a href="#nome">come si scrive il nome</a>.</p></div>
      <div class="card">${corners()}<h3>Co-branding ${telemetry(esc(p.status), 'chip')}</h3>${doList(p.cobranding, 'do')}</div>
      <div class="card">${corners()}<h3>Licenza</h3>${doList(p.licence, 'do')}<p class="muted">Attribuzione: «Grafiche di Salento.dev (https://salento.dev), CC BY 4.0».</p></div>
    </div>
    <div class="contact card">${corners()}<p class="telemetry">contatti</p><p class="contact-line"><a href="mailto:${esc(id.email)}">${esc(id.email)}</a></p><p class="muted">Per co-branding, eventi insieme e richieste di materiali. Canali: ${id.channels.map((c) => `<a href="${esc(c.url)}">${esc(c.label)}</a>`).join(' · ')}.</p></div>`,
  });
}

function downloadSection({ kit }) {
  const rows = [
    ...LOGO_VARIANTS.map((v) => [`Logo ${v.label}`, v.on, [[`SVG`, `kit/logo/svg/salento-dev-logo-${v.slug}.svg`], ...LOGO_PNG_HEIGHTS.map((h) => [`PNG ${h}`, `kit/logo/png/salento-dev-logo-${v.slug}-${h}.png`])]]),
    ['Avatar', 'profili social e chat', [['SVG', 'kit/logo/avatar/salento-dev-avatar.svg'], ...AVATAR_SIZES.map((s) => [`PNG ${s}`, `kit/logo/avatar/salento-dev-avatar-${s}.png`])]],
    ['Token', 'colori, font, raggi, spaziature', [['tokens.json', 'kit/token/tokens.json'], ['tokens.css', 'kit/token/tokens.css']]],
  ];
  const tree = kit.tree.map((l) => esc(l)).join('\n');
  return module({
    id: 'download',
    body: `${sectionHead({ id: 'download', n: '09', eyebrow: 'Download', title: 'Il *kit* completo', desc: 'Un archivio con logo, avatar, icone dei gruppi, token e un LEGGIMI con le regole essenziali e la licenza. Generato a ogni aggiornamento.', tag: `zip · ${bytes(kit.zipSize)}` })}
    <div class="cols-2">
      <div class="card kit">
        ${corners()}
        <p class="telemetry">${esc(KIT_ROOT)}/ · ${kit.count} file</p>
        <pre class="tree" aria-label="Contenuto del kit">${tree}</pre>
        ${cta(KIT_ZIP, `Scarica ${KIT_ZIP}`, `download aria-label="Scarica ${KIT_ZIP} (${bytes(kit.zipSize)})"`)}
      </div>
      <div class="table-wrap"><table class="files">
        <caption class="sr-only">File singoli</caption>
        <thead><tr><th scope="col">File</th><th scope="col">Uso</th><th scope="col">Formati</th></tr></thead>
        <tbody>${rows.map(([name, use, links]) => `<tr><th scope="row">${esc(name)}</th><td class="muted">${esc(use)}</td><td class="links">${links.map(([l, h]) => `<a href="${h}" download>${l}</a>`).join(' ')}</td></tr>`).join('')}</tbody>
      </table></div>
    </div>`,
  });
}

export function footerHtml({ brand, build }) {
  const pv = brand.provenance;
  return `<div class="footer-inner">
    <p>${logo({ cls: 'logo tiny' })} <b>Salento.dev</b> · Brand book generato da <a href="${REPO}">salento-dev/brand</a> @ <a href="${REPO}/commit/${esc(build.sha)}"><code>${esc(build.commit)}</code></a> il ${esc(build.dateLabel)}.</p>
    <p class="muted">Fonte di verità: questo repo (<a href="${blob('docs/04_decisioni_architetturali/0011_repo_brand_fonte_di_verita.md')}">ADR-0011</a>). Regole importate da ${esc(pv.source)}, ${esc(pv.ref)}, ${esc(pv.imported)}. Codice MIT · asset CC BY 4.0 · marchio escluso.</p>
  </div>`;
}

export function bookPage(ctx) {
  return page({
    title: 'Salento.dev — Brand',
    description: `Brand book di Salento.dev: logo, colori, tipografia, regole e kit per community, partner e soci.`,
    base: '',
    nav: SECTIONS.map(([id, label]) => [`#${id}`, label]),
    main: [hero(ctx), essence(ctx), logoSection(ctx), colorsSection(ctx), typographySection(ctx), shapesSection(ctx), communitySection(ctx), rulesSection(ctx), partnersSection(ctx), downloadSection(ctx)].join('\n'),
    footer: footerHtml(ctx),
  });
}
