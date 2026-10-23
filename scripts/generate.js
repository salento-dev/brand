// Genera i PNG di tutti i formati.
//   npm run generate                         -> tutto (esclusi i gruppi archiviati)
//   npm run generate -- --only <file...>     -> solo ciò che dipende dai file indicati (es. diff di una PR)
//   npm run generate -- --include-archived   -> anche i gruppi archiviati
import fs from 'node:fs';
import path from 'node:path';
import { loadFormats } from '../src/formats.js';
import { loadGroups } from '../src/groups.js';
import { loadTokens } from '../src/tokens.js';
import { loadDoodleSets } from '../src/doodles.js';
import { renderPng } from '../src/render.js';
import { parseArgs } from '../src/cli.js';
import { OUT_DIR } from '../src/paths.js';

// Una modifica a questi percorsi può cambiare qualunque immagine: si rigenera tutto.
const GLOBAL_INPUTS = /^(tokens|formats|assets|src|scripts)\/|^package(-lock)?\.json$/;

const COLLECTIONS = { groups: loadGroups };

/** Decide cosa generare: null = tutto, altrimenti l'insieme degli slug per collezione. */
export function selection(changedFiles) {
  if (!changedFiles) return null;
  if (changedFiles.some((f) => GLOBAL_INPUTS.test(f))) return null;
  const picked = {};
  for (const f of changedFiles) {
    const m = f.match(/^content\/([\w-]+)\/([^/]+)\.ya?ml$/);
    if (m) (picked[m[1]] ??= new Set()).add(m[2]);
  }
  return picked;
}

async function main() {
  const args = parseArgs();
  const only = args.only ? selection(args.only) : null;
  const includeArchived = 'include-archived' in args;
  const ctx = { tokens: loadTokens(), sets: loadDoodleSets() };
  let count = 0;

  for (const format of await loadFormats()) {
    const items = COLLECTIONS[format.collection]()
      .filter((item) => includeArchived || item.status !== 'archived')
      .filter((item) => !only || only[format.collection]?.has(item.slug));

    for (const item of items) {
      const { png, previews } = renderPng(format.render(item, ctx), format);
      const file = path.join(OUT_DIR, format.output(item));
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, png);
      for (const [width, buf] of Object.entries(previews)) {
        const preview = path.join(path.dirname(file), String(width), path.basename(file));
        fs.mkdirSync(path.dirname(preview), { recursive: true });
        fs.writeFileSync(preview, buf);
      }
      console.log(`✓ out/${format.output(item)}`);
      count++;
    }
  }
  console.log(count ? `\n${count} immagini generate.` : 'Nessuna immagine da generare per i file indicati.');
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
