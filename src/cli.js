// Parsing minimale degli argomenti: --flag e --opzione valore1 valore2 ...
export function parseArgs(argv = process.argv.slice(2)) {
  const args = { _: [] };
  let current = '_';
  for (const a of argv) {
    if (a.startsWith('--')) {
      current = a.slice(2);
      args[current] ??= [];
    } else {
      // valori separati da spazi o a capo (comodo per `--only "$(git diff --name-only ...)"`)
      args[current].push(...a.split(/\s+/).filter(Boolean));
    }
  }
  return args;
}
