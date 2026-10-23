# ADR-0005 · Anteprime PR via `workflow_run` e branch `previews`

- **Stato:** Accettata
- **Data:** 2026-10-23

## Contesto

Chi rivede una PR deve vedere le icone senza scaricare nulla. Pubblicare un commento richiede un token con permessi di scrittura, ma le PR da fork girano (giustamente) con token in sola lettura. Usare `pull_request_target` e fare checkout del codice della PR è la classica vulnerabilità "pwn request".

## Decisione

Due workflow separati:

1. **`build.yml`** (`pull_request`, `contents: read`): `npm ci`, validate, test, generazione delle sole immagini toccate, galleria; carica un artifact `preview` con i PNG e `pr-number.txt`.
2. **`preview-comment.yml`** (`workflow_run` su Build completato, permessi di scrittura):
   - **non fa checkout e non esegue codice della PR**;
   - tratta l'artifact come **non fidato**: numero PR solo cifre, PR la cui testa deve coincidere con `workflow_run.head_sha`, solo file regolari `kebab-case.png`, firma PNG verificata, max 2 MB;
   - pubblica i PNG sul **branch orfano `previews`** in `pr-<n>/` e crea/aggiorna **un solo commento** (marcatore HTML) con immagini via `raw.githubusercontent.com/<repo>/<sha>/…` (lo SHA evita la cache).

## Conseguenze

**Positive**
- Funziona anche per PR da fork, senza esporre segreti.
- Commento unico, aggiornato a ogni push.

**Negative / trade-off**
- Il branch `previews` cresce nel tempo (da ripulire periodicamente, vedi open questions).
- `raw.githubusercontent.com` funziona solo se il repo è pubblico.
- `workflow_run` usa la versione del workflow presente sul branch di default.

## Alternative considerate

- **`pull_request_target` + checkout della PR**: vulnerabile.
- **Solo artifact scaricabile**: sicuro ma scomodo per chi rivede.
- **Servizi esterni di hosting immagini**: dipendenza e segreti in più.

## Fonti

- [GitHub Security Lab — Preventing pwn requests](https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/)
- [Evento `workflow_run`](https://docs.github.com/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#workflow_run)
