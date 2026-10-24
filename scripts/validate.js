// Valida tutto: token (alias + contrasto), identità del brand, soggetti, doodle e set, gruppi, schema esportato aggiornato.
import fs from 'node:fs';
import path from 'node:path';
import { loadTokens, themeFor, accentNames, iconPalette, placeholders } from '../src/tokens.js';
import { contrastRatio, normalizeHex, THEME_RULES, ICON_RULES } from '../src/contrast.js';
import { groupFiles, parseGroup, accentWarnings } from '../src/groups.js';
import { lintSubject, subjectNames, subjectPath } from '../src/subjects.js';
import { lintDoodle, loadDoodleSets, checkDoodleSets } from '../src/doodles.js';
import { subjectMaxRadius, SAFE_RADIUS } from '../formats/icon.js';
import { DOODLES_DIR } from '../src/paths.js';
import { SCHEMA_FILE, schemaText } from './schema.js';
import { loadBrand } from '../src/brand.js';

let failures = 0;
const fail = (where, msg) => {
  failures++;
  console.error(`✗ ${where}: ${msg}`);
};
const ok = (msg) => console.log(`✓ ${msg}`);
const warn = (where, msg) => console.warn(`⚠ ${where}: ${msg}`);

// 1. Token e contrasto
let tokens;
try {
  tokens = loadTokens();
  const theme = themeFor(tokens);
  for (const { fg, bg, min, why } of THEME_RULES) {
    const r = contrastRatio(theme[fg], theme[bg]);
    if (r < min) fail('contrasto semantic', `${fg} su ${bg} = ${r.toFixed(2)}:1 < ${min}:1 (${why})`);
    else ok(`contrasto semantic: ${fg} su ${bg} ${r.toFixed(2)}:1`);
  }
  const palettes = [
    ...accentNames(tokens).map((a) => [`accento ${a}`, { kind: 'permanent', accent: a }]),
    ['temporanei (pietra)', { kind: 'temporary' }],
  ];
  for (const [label, group] of palettes) {
    const pal = iconPalette(tokens, group);
    for (const { fg, bg, min, why } of ICON_RULES) {
      const r = contrastRatio(pal[fg], pal[bg]);
      if (r < min) fail(`contrasto ${label}`, `${fg} su ${bg} = ${r.toFixed(2)}:1 < ${min}:1 (${why})`);
      else ok(`contrasto ${label}: ${fg} su ${bg} ${r.toFixed(2)}:1`);
    }
  }
  const ph = Object.values(placeholders(tokens)).map(normalizeHex);
  if (ph.includes(null) || new Set(ph).size !== 4) fail('tokens placeholder', 'servono 4 colori segnaposto esadecimali distinti');
} catch (e) {
  fail('tokens/tokens.json', e.message);
}

// 1b. Identità e regole del brand (content/brand/brand.yaml): schema + token citati esistenti
try {
  const brand = loadBrand();
  const missing = brand.logo.colors.map((c) => c.token).filter((t) => !tokens?.[t]);
  if (missing.length) fail('content/brand/brand.yaml', `token inesistenti: ${missing.join(', ')}`);
  else ok(`content/brand/brand.yaml (${brand.rules.length} regole)`);
} catch (e) {
  fail('content/brand/brand.yaml', e.message);
}

// 2. Soggetti: lint + area sicura
if (tokens) {
  for (const name of subjectNames()) {
    const where = `assets/subjects/${name}.svg`;
    const errors = lintSubject(fs.readFileSync(subjectPath(name), 'utf8'), placeholders(tokens));
    errors.forEach((e) => fail(where, e));
    if (errors.length) continue;
    const r = subjectMaxRadius(name, tokens);
    if (r > SAFE_RADIUS) fail(where, `esce dal cerchio sicuro: arriva a ${r.toFixed(0)}px dal centro (max ${SAFE_RADIUS}px ≈ 86 unità da 80,80)`);
    else ok(`${where} (fino a ${r.toFixed(0)}px dal centro)`);
  }
}

// 3. Doodle e set comuni
for (const file of fs.readdirSync(DOODLES_DIR).filter((f) => f.endsWith('.svg')).sort()) {
  const errors = lintDoodle(fs.readFileSync(path.join(DOODLES_DIR, file), 'utf8'));
  errors.forEach((e) => fail(`assets/doodles/${file}`, e));
}
try {
  const errors = checkDoodleSets(loadDoodleSets());
  errors.forEach((e) => fail('assets/doodles/sets.yaml', e));
  if (!errors.length) ok('assets/doodles (lint) e sets.yaml');
} catch (e) {
  fail('assets/doodles/sets.yaml', e.message);
}

// 4. Gruppi
const groups = [];
for (const file of groupFiles()) {
  const { group, errors } = parseGroup(file, fs.readFileSync(file, 'utf8'));
  errors.forEach((e) => fail(`content/groups/${path.basename(file)}`, e));
  if (group) {
    groups.push(group);
    ok(`content/groups/${path.basename(file)}`);
  }
}
accentWarnings(groups).forEach((w) => warn('content/groups', w));

// 5. Lo schema esportato deve essere allineato a src/schema.js
if (!fs.existsSync(SCHEMA_FILE) || fs.readFileSync(SCHEMA_FILE, 'utf8') !== schemaText()) {
  fail('schema/group.schema.json', 'non aggiornato: esegui npm run schema');
}

if (failures) {
  console.error(`\n${failures} errore/i.`);
  process.exit(1);
}
console.log('\nTutto valido.');
