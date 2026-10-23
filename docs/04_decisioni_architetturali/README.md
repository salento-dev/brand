# Decisioni architetturali (ADR)

Stesse convenzioni del repo [`website`](https://github.com/salento-dev/website/tree/main/docs/07_decisioni_architetturali):

- **Un ADR = una decisione**, file `NNNN_titolo.md` con numerazione a 4 cifre.
- Gli ADR accettati **non si modificano**: se la decisione cambia si scrive un nuovo ADR che la sostituisce (`Superseded by ADR-NNNN`).
- Struttura: **Stato · Data · Contesto · Decisione · Conseguenze · Alternative considerate · Fonti**.

| Stato | Significato |
|-------|-------------|
| `Proposta` | In discussione |
| `Accettata` | Approvata e attiva |
| `Deprecata` | Non più raccomandata |
| `Superseded by ADR-NNNN` | Sostituita |

## Indice

| # | Decisione | Stato |
|---|-----------|-------|
| [ADR-0001](0001_struttura_repo_e_naming.md) | Struttura del repo, dati separati da formati, naming | Accettata (`components/` → ADR-0009) |
| [ADR-0002](0002_zod_e_json_schema.md) | Zod come unica fonte di verità + JSON Schema esportato | Accettata |
| [ADR-0003](0003_token_dtcg_allineati_al_sito.md) | Token W3C DTCG allineati al sito (e valore "pietra") | Accettata (varianti → ADR-0008) |
| [ADR-0004](0004_simbolo_heroicon_o_illustrazione.md) | Simbolo = Heroicon o illustrazione con sostituzione dell'accento | Superseded by ADR-0007 |
| [ADR-0005](0005_anteprime_pr_workflow_run.md) | Anteprime PR via `workflow_run` e branch `previews` | Accettata |
| [ADR-0006](0006_output_su_pages_non_versionato.md) | Immagini pubblicate su GitHub Pages, non versionate | Accettata |
| [ADR-0007](0007_icone_soggetto_flat_wallpaper_doodle.md) | Icone gruppi: soggetto flat + wallpaper doodle | Accettata |
| [ADR-0008](0008_accento_per_gruppo.md) | Un accento per gruppo (e pietra per i temporanei) | Accettata |
| [ADR-0009](0009_svg_diretto_resvg_senza_satori.md) | SVG composto direttamente + resvg; Satori, font e Heroicons rimossi | Accettata |
