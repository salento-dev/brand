# 02 · CI e anteprime

| Workflow | Quando | Permessi | Cosa fa |
|----------|--------|----------|---------|
| `build.yml` | ogni PR | sola lettura | `npm ci`, validate, test, generate dei soli file toccati, `npm run site` (brand book, galleria, kit), artifact `preview` + `gallery` (tutto `out/`) |
| `preview-comment.yml` | Build completato | scrittura | verifica l'artifact, pubblica i PNG su `previews/pr-<n>/`, commento unico sulla PR |
| `deploy.yml` | push su `main`, manuale | Pages | genera tutto + `npm run site`, pubblica su GitHub Pages (brand book in `/`, galleria in `/icone/`, kit in `/brand-kit.zip`) |
| `expired.yml` | lunedì 07:00 UTC, manuale | issues | issue "Gruppi temporanei da archiviare" (label `archiviazione`) |

## Generazione incrementale

`npm run generate -- --only <file…>` riceve l'elenco dei file cambiati:

- se cambia qualcosa in `tokens/`, `formats/`, `assets/` (soggetti, doodle, `sets.yaml`), `src/`, `scripts/` o `package*.json` → **rigenera tutto**;
- altrimenti solo i gruppi i cui YAML sono nell'elenco;
- i gruppi `archived` sono saltati (salvo `--include-archived`).

## Sicurezza

Il workflow che scrive non esegue mai codice della PR: dettagli in [ADR-0005](../04_decisioni_architetturali/0005_anteprime_pr_workflow_run.md).
