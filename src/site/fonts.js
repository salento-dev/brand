// Font self-hosted (niente Google Fonts CDN, GDPR): copia i woff2 variabili dai pacchetti @fontsource-variable
// in out/fonts/ con un fonts.css che li registra con i nomi usati dai token (Outfit, Albert Sans, Roboto Mono).
import fs from 'node:fs';
import path from 'node:path';
import { at } from '../paths.js';

export const FONTS = [
  { family: 'Outfit', pkg: 'outfit' },
  { family: 'Albert Sans', pkg: 'albert-sans' },
  { family: 'Roboto Mono', pkg: 'roboto-mono' },
];

/** Legge wght.css del pacchetto e restituisce le @font-face (latin e latin-ext) con url e famiglia riscritti. */
function faces({ family, pkg }, dir) {
  const css = fs.readFileSync(path.join(dir, 'wght.css'), 'utf8');
  const blocks = css.match(/@font-face\s*{[^}]+}/g) ?? [];
  const picked = [];
  for (const block of blocks) {
    const file = block.match(/url\(\.\/files\/([^)]+\.woff2)\)/)?.[1];
    if (!file || !/-latin(-ext)?-wght-normal\.woff2$/.test(file)) continue;
    picked.push({
      file,
      css: block.replace(/font-family:[^;]+;/, `font-family: '${family}';`).replace(/url\(\.\/files\//, 'url(./'),
    });
  }
  if (!picked.length) throw new Error(`@fontsource-variable/${pkg}: nessun woff2 latin trovato`);
  return picked;
}

/** Copia font, licenze e fonts.css in `outDir`. Restituisce i nomi dei file scritti. */
export function copyFonts(outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const written = [];
  let css = '/* Font self-hosted da @fontsource-variable (SIL Open Font License 1.1): nessuna richiesta a servizi esterni. */\n';
  for (const font of FONTS) {
    const dir = at('node_modules', '@fontsource-variable', font.pkg);
    if (!fs.existsSync(dir)) throw new Error(`Manca @fontsource-variable/${font.pkg}: esegui npm install (devDependencies)`);
    for (const f of faces(font, dir)) {
      fs.copyFileSync(path.join(dir, 'files', f.file), path.join(outDir, f.file));
      written.push(f.file);
      css += `\n${f.css}\n`;
    }
    const licence = `LICENSE-${font.pkg}.txt`;
    fs.copyFileSync(path.join(dir, 'LICENSE'), path.join(outDir, licence));
    written.push(licence);
  }
  fs.writeFileSync(path.join(outDir, 'fonts.css'), css);
  return [...written, 'fonts.css'];
}
