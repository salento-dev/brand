# ADR-0002 · Zod come unica fonte di verità + JSON Schema esportato

- **Stato:** Accettata
- **Data:** 2026-10-23

## Contesto

I file YAML sono scritti da volontari, spesso dall'editor web di GitHub. Servono: (1) validazione rigorosa in CI con messaggi in italiano, incluse regole incrociate (date obbligatorie solo per i temporanei, `ends >= starts`); (2) autocompletamento e segnalazione errori nell'editor; (3) un solo posto dove cambiare le regole.

## Decisione

- Lo schema è definito **una sola volta** con **zod v4** in `src/schema.js`.
- `npm run schema` esporta `schema/group.schema.json` con `z.toJSONSchema`; le regole incrociate (non esprimibili automaticamente da `superRefine`) sono aggiunte come `if/then/else`.
- Ogni YAML inizia con `# yaml-language-server: $schema=../../schema/group.schema.json` (estensione YAML di Red Hat per VS Code).
- `npm run validate` fallisce se lo schema esportato non è allineato a `src/schema.js`.
- L'elenco delle Heroicons valide entra nello schema come `enum` (autocompletamento nell'editor).

## Conseguenze

**Positive**
- Un'unica definizione; editor e CI non divergono.
- I tipi derivati sono disponibili per gli script.

**Negative / trade-off**
- Lo JSON Schema è un file generato ma versionato (serve all'editor senza `npm install`).
- L'esistenza dei file delle illustrazioni è verificata solo da `validate`, non dall'editor.

## Alternative considerate

- **JSON Schema scritto a mano + Ajv**: due fonti (tipi e schema) o messaggi d'errore meno curati.
- **Validazione solo in JS**: nessun aiuto nell'editor.

## Fonti

- [Zod 4 — JSON Schema](https://zod.dev/json-schema)
- [yaml-language-server — modeline `$schema`](https://github.com/redhat-developer/yaml-language-server#using-inlined-schema)
