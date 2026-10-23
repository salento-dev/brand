// Elenca i gruppi temporanei ancora attivi la cui data di fine è passata.
//   npm run check-expired                 -> elenco leggibile
//   npm run check-expired -- --markdown   -> corpo della issue (vuoto se non c'è nulla)
//   npm run check-expired -- --today 2026-12-01
import { loadGroups } from '../src/groups.js';
import { parseArgs } from '../src/cli.js';

export const expiredGroups = (groups, today) =>
  groups.filter((g) => g.kind === 'temporary' && g.status === 'active' && g.ends < today);

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = parseArgs();
  const today = args.today?.[0] ?? new Date().toISOString().slice(0, 10);
  const expired = expiredGroups(loadGroups(), today);

  if ('markdown' in args) {
    if (expired.length) {
      console.log(`I seguenti gruppi temporanei sono terminati ma risultano ancora \`status: active\` (controllo del ${today}).\n`);
      console.log('Per ciascuno: archivia il gruppo su WhatsApp e imposta `status: archived` nel file YAML con una PR.\n');
      for (const g of expired) console.log(`- [ ] **${g.name}** — terminato il ${g.ends} — \`content/groups/${g.slug}.yaml\``);
    }
  } else if (expired.length) {
    console.log(`Gruppi temporanei da archiviare (oggi ${today}):`);
    for (const g of expired) console.log(`  - ${g.slug} (fine ${g.ends})`);
  } else {
    console.log(`Nessun gruppo temporaneo da archiviare (oggi ${today}).`);
  }
}
