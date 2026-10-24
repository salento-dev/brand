# Salento.dev · brand

**Fonte di verità del brand** della community [Salento.dev](https://salento.dev) e **design system as code**: identità, regole e token vivono qui; le grafiche della community sono generate da dati YAML versionati.

**Brand book:** [salento-dev.github.io/brand](https://salento-dev.github.io/brand/) — logo, colori, tipografia, regole, kit per partner e soci e [`brand-kit.zip`](https://salento-dev.github.io/brand/brand-kit.zip), rigenerati a ogni push su `main` ([ADR-0011](docs/04_decisioni_architetturali/0011_repo_brand_fonte_di_verita.md)).

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
| `npm run validate` | `content/brand/brand.yaml`, schema e regole incrociate, soggetti (lint + cerchio sicuro), doodle e `sets.yaml`, contrasto per ogni accento, schema aggiornato; avvisa sugli accenti ripetuti |
| `npm run generate` | Genera `out/groups/<slug>.png` (+ `out/groups/96/`). Opzioni: `--only <file…>`, `--include-archived` |
| `npm run site` | Crea il sito: `out/index.html` (brand book), `out/icone/index.html` (lista chat simulata, 640 ritagliata a cerchio, 96/48px, download, archiviati), `out/brand-kit.zip` + `out/kit/`, font e CSS. `npm run gallery` è un alias |
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
assets/logo.svg               logo ufficiale (dal sito)
formats/icon.js               formato icona (auto-scoperto)
src/                          libreria (token, colori, schema, soggetti, doodle, wallpaper, render, logo, kit, zip)
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

Codice sotto [MIT](LICENSE); asset grafici (soggetti, doodle, logo, token e immagini generate) sotto [CC BY 4.0](LICENSE-ASSETS.md), marchio escluso. Font (Outfit, Albert Sans, Roboto Mono) sotto SIL OFL 1.1.
