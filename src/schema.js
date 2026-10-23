// Schema dei dati: unica fonte di verità. Lo JSON Schema in schema/ è generato da qui (npm run schema).
import { z } from 'zod';
import { accentNames, loadTokens } from './tokens.js';

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const NAME_MAX = 32; // nomi brevi: leggibili nella lista chat di WhatsApp senza troncamento
export const SHORT_NAME_MAX = 14; // etichetta per galleria, testo alternativo e documentazione
export const DOODLES_MAX = 10;

/** Accenti ammessi per i gruppi permanenti: le chiavi di `group.accents` nei token. */
export const ACCENTS = accentNames(loadTokens());

const isoDate = z.iso.date({ error: 'data ISO attesa (AAAA-MM-GG)' });
const slugName = (what) => z.string().regex(SLUG, `${what}: nome in kebab-case (es. coffee-cup)`);

const GroupObject = z.strictObject({
  name: z.string().trim().min(1, 'obbligatorio').max(NAME_MAX, `max ${NAME_MAX} caratteri`).meta({ description: 'Nome del gruppo come appare su WhatsApp (max 32).' }),
  shortName: z.string().trim().min(1, 'obbligatorio').max(SHORT_NAME_MAX, `max ${SHORT_NAME_MAX} caratteri`)
    .meta({ description: 'Nome breve (max 14) per galleria, testo alternativo e documentazione. Non è disegnato sull\'icona.' }),
  kind: z.enum(['permanent', 'temporary']).meta({ description: 'permanent = gruppo stabile; temporary = legato a un evento/periodo.' }),
  subject: slugName('subject')
    .meta({ description: 'Soggetto centrale: nome di un file in assets/subjects/<nome>.svg (es. coffee-cup).' }),
  accent: z.enum(ACCENTS, { error: `accento non valido: usa uno tra ${ACCENTS.join(', ')}` })
    .optional()
    .meta({ description: `Solo permanent (obbligatorio): colore del gruppo, uno tra ${ACCENTS.join(', ')}. I temporary usano sempre la pietra.` }),
  doodles: z.array(slugName('doodles')).min(1, 'elenco vuoto: togli la riga o aggiungi dei doodle').max(DOODLES_MAX, `max ${DOODLES_MAX} doodle`).optional()
    .meta({ description: `Doodle del wallpaper tipici del gruppo (max ${DOODLES_MAX}), nomi di file in assets/doodles/. Si aggiungono al set comune.` }),
  description: z.string().trim().max(280, 'max 280 caratteri').optional().meta({ description: 'Descrizione breve (italiano).' }),
  starts: isoDate.optional().meta({ description: 'Solo temporary: data di inizio (AAAA-MM-GG).' }),
  ends: isoDate.optional().meta({ description: 'Solo temporary: data di fine (AAAA-MM-GG), >= starts.' }),
  status: z.enum(['active', 'archived']).default('active').meta({ description: 'archived = gruppo chiuso, non più generato.' }),
  example: z.boolean().optional().meta({ description: 'true se il file è solo un esempio dimostrativo.' }),
});

export const GroupSchema = GroupObject.superRefine((g, ctx) => {
  const issue = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });
  if (g.kind === 'temporary') {
    if (!g.starts) issue('starts', 'obbligatorio per i gruppi temporary');
    if (!g.ends) issue('ends', 'obbligatorio per i gruppi temporary');
    if (g.starts && g.ends && g.ends < g.starts) issue('ends', 'deve essere uguale o successiva a starts');
    if (g.accent !== undefined) issue('accent', 'non ammesso per i gruppi temporary: usano sempre l\'accento pietra. Togli la riga accent.');
  } else {
    if (g.accent === undefined) issue('accent', `obbligatorio per i gruppi permanent: uno tra ${ACCENTS.join(', ')}`);
    for (const key of ['starts', 'ends']) {
      if (g[key] !== undefined) issue(key, 'non ammesso per i gruppi permanent');
    }
  }
  const dup = g.doodles?.filter((d, i) => g.doodles.indexOf(d) !== i);
  if (dup?.length) issue('doodles', `doodle ripetuti: ${[...new Set(dup)].join(', ')}`);
});

/** JSON Schema per l'editor (yaml-language-server). Le regole incrociate sono riscritte come if/then. */
export function groupJsonSchema() {
  const schema = z.toJSONSchema(GroupObject, { io: 'input', target: 'draft-2020-12' });
  schema.properties.doodles.uniqueItems = true;
  return {
    $schema: schema.$schema,
    $id: 'https://salento.dev/brand/schema/group.schema.json',
    title: 'Gruppo WhatsApp Salento.dev',
    description: 'Generato da src/schema.js con `npm run schema`: non modificare a mano.',
    ...Object.fromEntries(Object.entries(schema).filter(([k]) => k !== '$schema')),
    allOf: [
      {
        if: { properties: { kind: { const: 'temporary' } }, required: ['kind'] },
        then: { required: ['starts', 'ends'], not: { required: ['accent'] } },
        else: { required: ['accent'], not: { anyOf: [{ required: ['starts'] }, { required: ['ends'] }] } },
      },
    ],
  };
}
