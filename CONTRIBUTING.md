# Contribuire a salento.dev brand

Grazie per voler contribuire! Guida rapida; i dettagli sono in [`docs/`](docs/README.md).

## In breve

1. **Parti da una issue** — usa un template (Nuovo gruppo, Nuovo soggetto o doodle, Bug).
2. **Branch dedicato da `main`** — mai commit diretti su `main`. Nome `tipo/descrizione` (`feat/`, `fix/`, `docs/`, `refactor/`, `chore/`), es. `feat/gruppo-ai-corner`.
3. **Prima della PR**:
   ```bash
   npm run validate
   npm test
   npm run generate -- --only content/groups/<slug>.yaml && npm run gallery
   ```
4. **Apri la PR** verso `main` con il template; nella descrizione `Closes #N`. Le anteprime arrivano in un commento automatico.

Le modifiche a `tokens/`, `formats/`, `src/`, `assets/` e `.github/` richiedono la revisione del core team (CODEOWNERS).

## Aggiungi un gruppo in 5 passi

1. **Issue e branch** — apri (o commenta) una issue **Nuovo gruppo** e crea il branch `feat/gruppo-<slug>`.
2. **Crea il file** `content/groups/<slug>.yaml` (slug in kebab-case ASCII: diventa il nome dell'immagine):
   ```yaml
   # yaml-language-server: $schema=../../schema/group.schema.json
   name: Off topic – Dev Break        # come su WhatsApp, max 32
   shortName: Dev Break               # max 14, per galleria e testo alternativo
   kind: permanent                    # oppure temporary
   subject: coffee-cup                # un file di assets/subjects/
   accent: fuchsia                    # solo permanent: cyan | violet | fuchsia | emerald | lime
   doodles: [pizza, gamepad, headphones]   # facoltativo: file di assets/doodles/
   description: Chiacchiere, meme e pause caffè lontano dal codice.
   ```
   Per un gruppo `temporary` togli `accent` (è sempre pietra) e aggiungi `starts` e `ends` (`AAAA-MM-GG`).
3. **Scegli soggetto e colore** — un soggetto esistente ([elenco](docs/02_icone_gruppi/02_soggetti.md)) o uno nuovo (vedi la guida); un accento non usato da altri permanenti (altrimenti `validate` avvisa).
4. **Controlla** — `npm run validate && npm run generate -- --only content/groups/<slug>.yaml && npm run gallery`, poi apri `out/index.html`: guarda il 640, le versioni a 96/48px e la lista chat simulata.
5. **Apri la PR** con `Closes #N` e controlla l'anteprima nel commento automatico.

Mai inserire link di invito WhatsApp o dati personali.

## Guide

| Tema | Documento |
|------|-----------|
| Token e palette | [01_token](docs/01_design_system/01_token.md) |
| Pipeline e formati | [02_pipeline_e_formati](docs/01_design_system/02_pipeline_e_formati.md) |
| Icona di gruppo | [01_formato_icona](docs/02_icone_gruppi/01_formato_icona.md) |
| Soggetti | [02_soggetti](docs/02_icone_gruppi/02_soggetti.md) |
| Doodle e wallpaper | [03_doodle](docs/02_icone_gruppi/03_doodle.md) |
| Aggiungere un gruppo | [01_aggiungere_un_gruppo](docs/03_contribuire/01_aggiungere_un_gruppo.md) |
| CI e anteprime | [02_ci_e_anteprime](docs/03_contribuire/02_ci_e_anteprime.md) |
| Decisioni (ADR) | [04_decisioni_architetturali](docs/04_decisioni_architetturali/README.md) |

## Code style

- JavaScript ESM, Node 22, nessun build step.
- Codice piccolo e leggibile: funzioni semplici, commenti in italiano, niente astrazioni premature.
- Il codice legge i colori **solo** dai token (`themeFor`, `iconPalette`), mai colori scritti a mano; i soggetti usano solo i 4 segnaposto.
