// Importa il logo pack ufficiale del media kit (ADR-0013) in assets/logo/official/.
//   npm run logo:import -- <cartella estratta dello zip>
// I file sono dati non fidati: si copiano solo i 72 file attesi, gli SVG passano dal controllo di sicurezza
// e l'unica modifica è il prefisso XML `ns0:` riportato al namespace SVG di default (geometria e colori invariati).
// Scrive SHA256SUMS (file vendorizzati) e SHA256SUMS.upstream (file originali dello zip).
// README.md non si importa: è la versione adattata (nome Salento.dev, licenza) e si aggiorna a mano.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { expectedFiles, lintOfficialSvg, sha256, writeManifest, checkOfficialPack, MANIFEST, UPSTREAM_MANIFEST } from '../src/logo.js';
import { loadTokens } from '../src/tokens.js';
import { OFFICIAL_LOGO_DIR } from '../src/paths.js';

/** Riporta `<ns0:svg xmlns:ns0="…/svg">` a `<svg xmlns="…/svg">`. Nient'altro cambia. */
export function normalizeSvgNamespace(text) {
  return text
    .replace(/<ns0:svg xmlns:ns0="http:\/\/www\.w3\.org\/2000\/svg"/, '<svg xmlns="http://www.w3.org/2000/svg"')
    .replace(/<(\/?)ns0:/g, '<$1');
}

export function importPack(src, dest = OFFICIAL_LOGO_DIR) {
  const upstream = [];
  const vendored = [];
  for (const rel of expectedFiles()) {
    const from = path.join(src, rel);
    if (!fs.existsSync(from) || !fs.statSync(from).isFile() || fs.lstatSync(from).isSymbolicLink()) throw new Error(`manca ${rel}`);
    let data = fs.readFileSync(from);
    upstream.push([rel, sha256(data)]);
    if (rel.endsWith('.svg')) {
      const text = normalizeSvgNamespace(data.toString('utf8'));
      const errors = lintOfficialSvg(text);
      if (errors.length) throw new Error(`${rel}: ${errors.join('; ')}`);
      data = Buffer.from(text);
    }
    fs.mkdirSync(path.dirname(path.join(dest, rel)), { recursive: true });
    fs.writeFileSync(path.join(dest, rel), data);
    vendored.push([rel, sha256(data)]);
  }
  fs.writeFileSync(path.join(dest, MANIFEST), writeManifest(vendored));
  fs.writeFileSync(path.join(dest, UPSTREAM_MANIFEST), writeManifest(upstream));
  return vendored.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const src = process.argv[2];
  if (!src) {
    console.error('Uso: npm run logo:import -- <cartella estratta del logo pack>');
    process.exit(1);
  }
  const n = importPack(path.resolve(src));
  const errors = checkOfficialPack(loadTokens());
  if (errors.length) {
    console.error(errors.map((e) => `✗ ${e}`).join('\n'));
    process.exit(1);
  }
  console.log(`✓ ${n} file in assets/logo/official/ (+ ${MANIFEST}, ${UPSTREAM_MANIFEST})`);
}
