// Caricamento e validazione dei gruppi in content/groups/<slug>.yaml.
import fs from 'node:fs';
import path from 'node:path';
import { load as loadYaml } from 'js-yaml';
import { GROUPS_DIR } from './paths.js';
import { GroupSchema, SLUG } from './schema.js';
import { subjectExists } from './subjects.js';
import { doodleExists, doodleRole } from './doodles.js';

const formatIssues = (issues) =>
  issues.map((i) => `${i.path.length ? i.path.join('.') : '(radice)'}: ${i.message}`);

/**
 * Valida un gruppo a partire dal nome file e dal testo YAML.
 * Restituisce { group, errors }: group è null se ci sono errori.
 * `hasSubject` / `hasDoodle` sono iniettabili per i test.
 */
export function parseGroup(fileName, text, { hasSubject = subjectExists, hasDoodle = doodleExists } = {}) {
  const slug = path.basename(fileName).replace(/\.ya?ml$/, '');
  const errors = [];
  if (!/\.yaml$/.test(fileName)) errors.push('estensione attesa .yaml');
  if (!SLUG.test(slug)) errors.push(`nome file "${slug}" non valido: usa kebab-case ASCII (es. ai-corner.yaml)`);

  let data;
  try {
    data = loadYaml(text);
  } catch (e) {
    return { group: null, errors: [...errors, `YAML non valido: ${e.reason ?? e.message}`] };
  }
  const result = GroupSchema.safeParse(data ?? {});
  if (!result.success) errors.push(...formatIssues(result.error.issues));
  // esistenza dei file: controllata anche se ci sono altri errori, per mostrarli tutti insieme
  const raw = data && typeof data === 'object' ? data : {};
  if (typeof raw.subject === 'string' && SLUG.test(raw.subject) && !hasSubject(raw.subject)) {
    errors.push(`subject: assets/subjects/${raw.subject}.svg non esiste`);
  }
  for (const d of Array.isArray(raw.doodles) ? raw.doodles : []) {
    if (typeof d !== 'string' || !SLUG.test(d)) continue;
    if (!hasDoodle(d)) errors.push(`doodles: assets/doodles/${d}.svg non esiste`);
    else if (doodleRole(d) !== 'doodle') errors.push(`doodles: "${d}" è un ${doodleRole(d) === 'filler' ? 'riempitivo' : 'disegno di scena'}, non un doodle del wallpaper`);
  }
  return errors.length ? { group: null, errors } : { group: { slug, ...result.data }, errors };
}

export const groupFiles = (dir = GROUPS_DIR) =>
  fs.readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)).sort().map((f) => path.join(dir, f));

/** Carica tutti i gruppi validi; lancia errore se uno non lo è (usa validate per il dettaglio). */
export function loadGroups(dir = GROUPS_DIR) {
  return groupFiles(dir).map((file) => {
    const { group, errors } = parseGroup(file, fs.readFileSync(file, 'utf8'));
    if (!group) throw new Error(`${path.basename(file)} non valido:\n  ${errors.join('\n  ')}\nEsegui npm run validate.`);
    return group;
  });
}

/** Avvisi (non bloccanti): gruppi permanenti attivi con lo stesso accento. */
export function accentWarnings(groups) {
  const byAccent = {};
  for (const g of groups) if (g.kind === 'permanent' && g.status === 'active') (byAccent[g.accent] ??= []).push(g.slug);
  return Object.entries(byAccent)
    .filter(([, slugs]) => slugs.length > 1)
    .map(([accent, slugs]) => `accento "${accent}" usato da più gruppi permanenti attivi: ${slugs.join(', ')} (nella lista chat si confondono)`);
}
