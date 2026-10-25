// Costruisce il sito pubblicato su GitHub Pages (out/):
//   out/index.html          brand book (content/brand/brand.yaml + token)
//   out/icone/index.html    galleria delle icone dei gruppi (serve prima `npm run generate`)
//   out/brand-kit.zip       kit (logo pack ufficiale, avatar, icone, token, LEGGIMI) + gli stessi file in out/kit/
//   out/salentodev-logo-pack.zip  solo il logo pack ufficiale (README, SHA256SUMS, logos/)
//   out/assets/, out/fonts/ CSS, token CSS, pattern a puntini e font self-hosted (nessuna richiesta esterna)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { loadFormats } from '../src/formats.js';
import { loadGroups } from '../src/groups.js';
import { loadTokens, loadTokenTree, describeTokens } from '../src/tokens.js';
import { tokensCss } from '../src/tokens-css.js';
import { loadBrand } from '../src/brand.js';
import { kitFiles, kitZip, logoPackZip, KIT_ZIP, KIT_ROOT, LOGO_PACK_ZIP } from '../src/kit.js';
import { copyFonts } from '../src/site/fonts.js';
import { dotsSvg } from '../src/site/pattern.js';
import { bookPage, footerHtml } from '../src/site/book.js';
import { galleryPage, itemFiles } from '../src/site/gallery.js';
import { OUT_DIR, TOKENS_FILE, SITE_DIR, ROOT } from '../src/paths.js';

const COLLECTIONS = { groups: loadGroups };
const MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

/** Commit e data dell'ultimo commit (o variabili d'ambiente in CI: BRAND_COMMIT_SHA). */
export function buildInfo(env = process.env) {
  const git = (...args) => {
    try {
      return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
      return '';
    }
  };
  const sha = env.BRAND_COMMIT_SHA || git('rev-parse', 'HEAD') || 'locale';
  const iso = (sha !== 'locale' && git('show', '-s', '--format=%cI', sha)) || new Date().toISOString();
  const date = iso.slice(0, 10);
  const [y, m, d] = date.split('-').map(Number);
  return { sha, commit: sha.slice(0, 7), date, dateLabel: `${d} ${MONTHS[m - 1]} ${y}`, time: new Date(iso) };
}

const writer = (outDir) => (rel, data) => {
  const file = path.join(outDir, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
};

/** Albero dei file del kit, per la pagina (file in radice e cartelle fino a due livelli, con il conteggio). */
function kitTree(files) {
  const dirs = new Map();
  for (const f of files) {
    const parts = f.path.split('/');
    const dir = parts.length > 1 ? parts.slice(0, Math.min(parts.length - 1, 2)).join('/') + '/' : '';
    if (!dirs.has(dir)) dirs.set(dir, []);
    dirs.get(dir).push(parts.at(-1));
  }
  const lines = [];
  for (const [dir, names] of [...dirs].sort(([a], [b]) => a.localeCompare(b))) {
    if (!dir) names.forEach((n) => lines.push(n));
    else lines.push(`${dir}  (${names.length} file)`);
  }
  return lines;
}

/** `outDir`: cartella di destinazione (default out/); le icone dei gruppi si leggono sempre da out/. */
export async function buildSite({ outDir = OUT_DIR, log = console.log } = {}) {
  const write = writer(outDir);
  const tokens = loadTokens();
  const tree = loadTokenTree();
  const described = describeTokens(tree);
  const brand = loadBrand();
  const formats = await loadFormats();
  const build = buildInfo();
  const iconFormat = formats.find((f) => f.collection === 'groups');
  const groups = COLLECTIONS.groups();

  // CSS, token CSS e font
  const cssText = tokensCss(described, { header: `Token Salento.dev @ ${build.commit}` });
  write('assets/tokens.css', cssText);
  write('assets/brand.css', fs.readFileSync(path.join(SITE_DIR, 'brand.css')));
  write('assets/dots.svg', dotsSvg(tokens['brand.color.pattern-sand']));
  copyFonts(path.join(outDir, 'fonts'));

  // Kit: icone dei gruppi attivi già generate
  const groupIcons = groups
    .filter((g) => g.status !== 'archived' && iconFormat)
    .map((g) => ({ slug: g.slug, file: path.join(OUT_DIR, itemFiles(g, iconFormat).file) }))
    .filter((g) => fs.existsSync(g.file))
    .map((g) => ({ slug: g.slug, data: fs.readFileSync(g.file) }));
  const missing = groups.filter((g) => g.status !== 'archived').length - groupIcons.length;
  if (missing) log(`⚠ ${missing} icona/e di gruppo non generata/e: il kit non le contiene (npm run generate).`);
  const files = kitFiles({ brand, tokens, groupIcons, tokensJson: fs.readFileSync(TOKENS_FILE, 'utf8'), tokensCssText: cssText, build });
  fs.rmSync(path.join(outDir, 'kit'), { recursive: true, force: true });
  for (const f of files) write(path.join('kit', f.path), f.data);
  const zip = kitZip(files, build.time);
  write(KIT_ZIP, zip);
  log(`✓ out/${KIT_ZIP} (${files.length} file in ${KIT_ROOT}/, ${Math.round(zip.length / 1024)} KB) e out/kit/`);
  const packZip = logoPackZip(build.time);
  write(LOGO_PACK_ZIP, packZip);
  log(`✓ out/${LOGO_PACK_ZIP} (${Math.round(packZip.length / 1024)} KB)`);

  // Pagine
  const kit = { zipSize: zip.length, packSize: packZip.length, count: files.length, tree: kitTree(files) };
  const ctx = { brand, tokens, described, groups, format: iconFormat, build, kit };
  write('index.html', bookPage(ctx));
  log('✓ out/index.html (brand book)');
  write('icone/index.html', galleryPage({ formats, collections: COLLECTIONS, tokens, build, footer: footerHtml(ctx, '../') }));
  log('✓ out/icone/index.html (galleria icone)');
  return { files, zip, packZip, build };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await buildSite();
