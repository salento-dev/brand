# Salento.dev · brand

**Fonte di verità del brand** della community [Salento.dev](https://salento.dev) e **design system as code**: identità, regole e token vivono qui; le grafiche della community sono generate da dati YAML versionati.

**Brand book:** [salento-dev.github.io/brand](https://salento-dev.github.io/brand/) — logo ufficiale, descrizioni, colori, tipografia, regole, kit per partner e soci, [`brand-kit.zip`](https://salento-dev.github.io/brand/brand-kit.zip) e [`salentodev-logo-pack.zip`](https://salento-dev.github.io/brand/salentodev-logo-pack.zip), rigenerati a ogni push su `main` ([ADR-0011](docs/04_decisioni_architetturali/0011_repo_brand_fonte_di_verita.md)).

**Logo:** i file ufficiali del [media kit](https://salento.dev/sd-media-kit-2026/) (4 famiglie × 3 varianti, SVG/PNG/WEBP, con e senza padding) sono in [`assets/logo/official/`](assets/logo/official/README.md), verificati con checksum e mai ricostruiti ([ADR-0013](docs/04_decisioni_architetturali/0013_logo_ufficiale_dal_media_kit.md)). Colore primario: **Salento Cyan `#20D0ED`** ([ADR-0014](docs/04_decisioni_architetturali/0014_palette_del_marchio_salento_cyan_e_dark.md)).

**Fase 1:** icone dei gruppi della WhatsApp Community (640×640, ritagliate a cerchio): [galleria](https://salento-dev.github.io/brand/icone/).

![Le icone nella lista chat di WhatsApp](docs/02_icone_gruppi/img/simulazione-whatsapp.png)

Ogni icona: sfondo mist-900, **wallpaper di doodle a schizzo** nell'accento del gruppo, **soggetto flat** al centro con il logo a barre stampato sopra, nessun testo. Ogni gruppo permanente ha il suo accento (`cyan`, `violet`, `fuchsia`, `emerald`, `lime`); i temporanei sono sempre **pietra**.

## Quickstart

Richiede Node 22 (`nvm use`).

```bash
npm install
npm run validate
npm run generate
npm run site        # apri out/index.html (brand book) e out/icone/index.html
```

## Comandi

| Comando | Cosa fa |
|---------|---------|
| `npm run schema` | Esporta `schema/group.schema.json` da `src/schema.js` |
| `npm run validate` | `content/brand/brand.yaml`, logo pack ufficiale (72 file, `SHA256SUMS`, SVG sicuri), schema e regole incrociate, soggetti (lint + cerchio sicuro), doodle e `sets.yaml`, contrasto per ogni accento, schema aggiornato; avvisa sugli accenti ripetuti |
| `npm run generate` | Genera `out/groups/<slug>.png` (+ `out/groups/96/`). Opzioni: `--only <file…>`, `--include-archived` |
| `npm run site` | Crea il sito: `out/index.html` (brand book), `out/icone/index.html` (lista chat simulata, 640 ritagliata a cerchio, 96/48px, download, archiviati), `out/brand-kit.zip` + `out/kit/`, `out/salentodev-logo-pack.zip`, font e CSS. `npm run gallery` è un alias |
| `npm run logo:import -- <cartella>` | Reimporta il logo pack del media kit (zip estratto) in `assets/logo/official/` e riscrive i checksum |
| `npm run check-expired` | Elenca i temporanei terminati ma ancora `active` (`--markdown`, `--today AAAA-MM-GG`) |
| `npm test` | Test con `node:test` |

## Struttura

```
tokens/tokens.json            token W3C DTCG (primitive → brand → semantic, typography, group.accents, placeholder)
content/brand/brand.yaml      identità e regole del brand (testi della pagina e del LEGGIMI)
schema/group.schema.json      generato da src/schema.js (zod)
content/groups/*.yaml         un file per gruppo, slug = nome file
assets/subjects/*.svg         soggetti flat, disegnati con 4 colori segnaposto
assets/doodles/*.svg          libreria di doodle del wallpaper (+ sets.yaml, README con le regole)
assets/logo/official/         logo pack ufficiale del media kit (README, SHA256SUMS, logos/{svg,png,webp}/{padded,no-padding}/)
assets/logo.svg               pittogramma stampato nei soggetti delle icone (stessa geometria del pittogramma ufficiale)
formats/icon.js               formato icona (auto-scoperto)
src/                          libreria (token, colori, schema, soggetti, doodle, wallpaper, render, logo pack, kit, zip)
src/site/                     brand book e galleria (HTML, CSS, font self-hosted)
scripts/                      comandi npm
test/                         node:test
docs/                         documentazione (italiano) e ADR
```

## Documentazione

- [Indice docs](docs/README.md) · [Brand book e kit](docs/06_brand_book/01_brand_book.md) · [Aggiornare le regole del brand](docs/06_brand_book/02_aggiornare_le_regole.md) · [Contribuire](CONTRIBUTING.md) · [ADR](docs/04_decisioni_architetturali/README.md) · [Domande aperte](docs/open-questions.md)

## Roadmap

- **Brand book** e kit per partner e soci (fatto)
- **Fase 1 — icone gruppi WhatsApp** (fatto)
- **Fase 2 — cover eventi**: nuova collezione `content/events/` e formato `formats/event-cover.js`, riusando token e libreria.
- In seguito: storie/post social, immagini Open Graph; il sito legge token e regole da qui.

## Licenza

**Logo, wordmark e nome «Salento.dev»: tutti i diritti riservati**, uso subordinato ad autorizzazione preventiva e alle linee guida. Codice sotto [MIT](LICENSE); altri asset grafici (soggetti, doodle, icone dei gruppi, token, testi del brand book) sotto [CC BY 4.0](LICENSE-ASSETS.md): le icone si possono usare per i gruppi e la comunicazione di Salento.dev, il logo stampato al loro interno resta riservato. Font (Outfit, Albert Sans, Roboto Mono) sotto SIL OFL 1.1. Dettagli: [LICENSE-ASSETS.md](LICENSE-ASSETS.md).
