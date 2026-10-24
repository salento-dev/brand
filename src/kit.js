// Kit del brand: logo pack ufficiale, avatar, icone dei gruppi, token e LEGGIMI, in una cartella e in brand-kit.zip.
// Il logo pack si scarica anche da solo (salentodev-logo-pack.zip), con la stessa struttura del media kit.
import { createZip } from './zip.js';
import { logoPackFiles, avatarFiles, LOGO_PACK_ROOT, LOGO_PACK_ZIP } from './logo.js';

export const KIT_ROOT = 'salento-dev-brand-kit';
export const KIT_ZIP = 'brand-kit.zip';
/** Cartella del logo pack dentro il kit. */
export const KIT_LOGO_DIR = 'logo-pack';
export { LOGO_PACK_ROOT, LOGO_PACK_ZIP };

const plain = (s) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
const bullets = (items, indent = '  ') => items.map((i) => `${indent}- ${plain(i)}`).join('\n');
const wrap = (s, indent = '  ') => plain(s).replace(/(.{1,100})(\s+|$)/g, `${indent}$1\n`).trimEnd();

/** Testo del LEGGIMI.txt (regole essenziali + licenza). */
export function readme(brand, tokens, build) {
  const id = brand.identity;
  const lg = brand.logo;
  const hex = (t) => tokens[t].toUpperCase();
  const fam = (f) => lg.families.find((x) => x.id === f).name;
  return `${id.name} — kit del brand
${'='.repeat(id.name.length + 18)}

${plain(id.tagline)}
Pagina del brand: https://salento-dev.github.io/brand/
Generato il ${build.date} dal commit ${build.commit} di https://github.com/salento-dev/brand

CONTENUTO
  ${KIT_LOGO_DIR}/      logo pack ufficiale del media kit: ${lg.families.length} famiglie x ${lg.variants.length} varianti di colore,
                  SVG, PNG e WEBP, con e senza padding (vedi ${KIT_LOGO_DIR}/README.md)
  avatar/         avatar quadrato: pittogramma ufficiale bianco su nero, sicuro per il ritaglio a cerchio
  icone-gruppi/   icone dei gruppi della WhatsApp Community (640x640)
  token/          tokens.json (W3C DTCG) e tokens.css (custom properties)

NOME
${bullets(id.naming.do)}
  Da evitare: ${id.naming.dont.map((s) => plain(s).replace(/\.$/, '')).join('; ')}.

DESCRIZIONI UFFICIALI
${brand.descriptions.items.map((d) => `  ${d.label} (${d.use}):\n${wrap(d.text, '    ')}`).join('\n')}

LOGO
${lg.families.map((f) => `  - ${f.name} (${f.id}): ${plain(f.use)}`).join('\n')}
  Varianti: ${lg.variants.map((v) => `${v.id} (${v.on.toLowerCase()})`).join('; ')}.
  Quale usare dove:
${lg.whereToUse.map((w) => `    ${w.where}: ${fam(w.family)}${w.variant ? `, ${w.variant}` : ''}`).join('\n')}
${lg.guidelines.map((g) => `  ${g.title}:\n${bullets(g.items, '    ')}`).join('\n')}
  Da evitare:
${bullets(lg.dont, '    ')}

COLORI DEL MARCHIO
  Salento Cyan ${hex('brand.color.salento-cyan')} · Salento Dark ${hex('brand.color.salento-dark')} · White ${hex('brand.color.white')} · Black ${hex('brand.color.black')}
  Salento Cyan è l'unica luce accesa, solo su fondi scuri. Il brand è scuro: Console Black ${hex('brand.color.console-black')},
  Panel Graphite ${hex('brand.color.panel-graphite')}, Bright Mist ${hex('brand.color.bright-mist')}.
  Gli accenti dei gruppi (fuchsia, violet, cyan, emerald, lime) e la pietra ${hex('brand.color.pietra')} valgono solo dentro le icone dei gruppi.

FONT (SIL Open Font License 1.1)
  Outfit (titoli) https://fonts.google.com/specimen/Outfit
  Albert Sans (testo) https://fonts.google.com/specimen/Albert+Sans
  Roboto Mono (etichette) https://fonts.google.com/specimen/Roboto+Mono

PARTNER E CO-BRANDING (${brand.partners.status})
${bullets(brand.partners.cobranding)}

DIRITTI E LICENZA
${lg.rights.map((r) => wrap(r)).join('\n')}

${bullets(brand.partners.licence)}
  Attribuzione per gli asset CC BY 4.0: "Grafiche di Salento.dev (https://salento.dev), CC BY 4.0".

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
    ...logoPackFiles().map((f) => ({ path: `${KIT_LOGO_DIR}/${f.path}`, data: f.data })),
    ...avatarFiles(tokens),
    ...groupIcons.map((g) => ({ path: `icone-gruppi/${g.slug}.png`, data: g.data })),
    { path: 'token/tokens.json', data: Buffer.from(tokensJson) },
    { path: 'token/tokens.css', data: Buffer.from(tokensCssText) },
  ];
}

/** Archivio ZIP del kit (cartella radice `salento-dev-brand-kit/`). */
export const kitZip = (files, date) => createZip(files.map((f) => ({ name: `${KIT_ROOT}/${f.path}`, data: f.data })), { date });

/** Archivio ZIP del solo logo pack (cartella radice `salentodev-logo-pack/`: README.md, SHA256SUMS, logos/…). */
export const logoPackZip = (date) => createZip(logoPackFiles().map((f) => ({ name: `${LOGO_PACK_ROOT}/${f.path}`, data: f.data })), { date });
