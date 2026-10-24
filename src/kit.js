// Kit del brand: logo, icone dei gruppi, token e LEGGIMI, in una cartella e in brand-kit.zip.
import { createZip } from './zip.js';
import { logoFiles, CLEAR_SPACE_RATIO, MIN_HEIGHT_PX, MIN_HEIGHT_MM, LOGO_VARIANTS } from './logo.js';

export const KIT_ROOT = 'salento-dev-brand-kit';
export const KIT_ZIP = 'brand-kit.zip';

const plain = (s) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
const bullets = (items) => items.map((i) => `  - ${plain(i)}`).join('\n');

/** Testo del LEGGIMI.txt (regole essenziali + licenza). */
export function readme(brand, tokens, build) {
  const id = brand.identity;
  const hex = (t) => tokens[t].toUpperCase();
  return `${id.name} — kit del brand
${'='.repeat(id.name.length + 18)}

${plain(id.tagline)}
Pagina del brand: https://salento-dev.github.io/brand/
Generato il ${build.date} dal commit ${build.commit} di https://github.com/salento-dev/brand

CONTENUTO
  logo/svg/       logo vettoriale: ${LOGO_VARIANTS.map((v) => `${v.slug} (${v.label} ${hex(v.token)}, ${v.on})`).join('; ')}
  logo/png/       PNG trasparenti alti 512, 1024 e 2048 px, area di rispetto inclusa
  logo/avatar/    avatar quadrato (logo Bright Mist su Console Black), sicuro per il ritaglio a cerchio
  icone-gruppi/   icone dei gruppi della WhatsApp Community (640x640)
  token/          tokens.json (W3C DTCG) e tokens.css (custom properties)

NOME
${bullets(id.naming.do)}
  Da evitare: ${id.naming.dont.map((s) => plain(s).replace(/\.$/, '')).join('; ')}.

LOGO
  - Area di rispetto: X = una riga di barre del logo (barra + interlinea), circa ${Math.round(CLEAR_SPACE_RATIO * 100)}% dell'altezza.
  - Dimensione minima: ${MIN_HEIGHT_PX} px di altezza su schermo, ${MIN_HEIGHT_MM} mm in stampa.
  - ${plain(brand.logo.lightRule)}
  Da evitare:
${bullets(brand.logo.dont)}

COLORI PRINCIPALI
  Console Black ${hex('brand.color.console-black')} · Panel Graphite ${hex('brand.color.panel-graphite')} · Bright Mist ${hex('brand.color.bright-mist')} · Signal Cyan ${hex('brand.color.signal-cyan')}
  Il cyan è l'unica luce accesa: link, etichette, una parola per titolo. Il brand è solo scuro.
  Gli accenti dei gruppi (fuchsia, violet, emerald, lime) e la pietra ${hex('brand.color.pietra')} valgono solo dentro le icone dei gruppi.

FONT (SIL Open Font License 1.1)
  Outfit (titoli) https://fonts.google.com/specimen/Outfit
  Albert Sans (testo) https://fonts.google.com/specimen/Albert+Sans
  Roboto Mono (etichette) https://fonts.google.com/specimen/Roboto+Mono

PARTNER E CO-BRANDING (${brand.partners.status})
${bullets(brand.partners.cobranding)}

LICENZA
${bullets(brand.partners.licence)}
  Attribuzione: "Grafiche di Salento.dev (https://salento.dev), CC BY 4.0".

CONTATTI
  ${id.email} · ${id.site}
`;
}

/**
 * File del kit: [{ path, data }] con percorsi relativi alla radice del kit.
 * `groupIcons`: [{ slug, data }] (PNG già generati); `tokensJson` e `tokensCssText`: testo.
 */
export function kitFiles({ brand, tokens, groupIcons, tokensJson, tokensCssText, build }) {
  return [
    { path: 'LEGGIMI.txt', data: Buffer.from(readme(brand, tokens, build)) },
    ...logoFiles(tokens),
    ...groupIcons.map((g) => ({ path: `icone-gruppi/${g.slug}.png`, data: g.data })),
    { path: 'token/tokens.json', data: Buffer.from(tokensJson) },
    { path: 'token/tokens.css', data: Buffer.from(tokensCssText) },
  ];
}

/** Archivio ZIP del kit (cartella radice `salento-dev-brand-kit/`). */
export const kitZip = (files, date) => createZip(files.map((f) => ({ name: `${KIT_ROOT}/${f.path}`, data: f.data })), { date });
