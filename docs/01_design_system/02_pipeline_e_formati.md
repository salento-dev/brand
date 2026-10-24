# 02 · Pipeline e formati

## Pipeline

```
content/groups/*.yaml ─▶ zod (src/schema.js) ─▶ formats/icon.js ─▶ SVG ─▶ resvg ─▶ PNG 640 (+ anteprima 96)
tokens/tokens.json ──────────────────────────────┤  sfondo
assets/doodles/ + sets.yaml ─▶ src/wallpaper.js ─┤  wallpaper di doodle a schizzo (src/doodles.js)
assets/subjects/<nome>.svg ─▶ src/subjects.js ───┘  soggetto con i colori del gruppo
```

L'SVG è composto **direttamente** (stringhe) e convertito in PNG con `@resvg/resvg-js`, senza font di sistema: stesso input → stessi byte ([ADR-0009](../04_decisioni_architetturali/0009_svg_diretto_resvg_senza_satori.md)).

## Brand book e kit

```
content/brand/brand.yaml ─▶ src/brand.js (zod) ─┐
tokens/tokens.json ─▶ src/tokens.js ─▶ src/tokens-css.js ─┼─▶ scripts/site.js ─▶ out/index.html, out/icone/, out/assets/
assets/logo/official/ ─▶ src/logo.js (verifica, avatar) ─┤                    out/brand-kit.zip, out/salentodev-logo-pack.zip (src/kit.js + src/zip.js)
out/groups/*.png (npm run generate) ──────────────────────┘                    out/fonts/ (src/site/fonts.js)
```

Dettagli: [Brand book e kit](../06_brand_book/01_brand_book.md).

## Moduli

| File | Cosa fa |
|------|---------|
| `src/tokens.js` | resolver DTCG, `themeFor`, `accentNames`, `iconPalette(tokens, gruppo)`, `placeholders` |
| `src/color.js` | OKLCH ↔ hex, `darkShade` (pietra scura) |
| `src/subjects.js` | lint dei soggetti, sostituzione dei segnaposto |
| `src/doodles.js` | libreria doodle, tratto a mano libera (`renderSketch`), maschere e impaccamento, lint, `sets.yaml` |
| `src/wallpaper.js` | composizione del wallpaper (parametri in `WALLPAPER`), seed = slug |
| `src/groups.js` | caricamento/validazione YAML, avvisi sugli accenti ripetuti |
| `formats/icon.js` | il formato icona: scala del soggetto, cerchio sicuro, `render(gruppo)` → SVG |
| `src/brand.js` | carica e valida `content/brand/brand.yaml` |
| `src/logo.js` | logo pack ufficiale: file attesi, controllo di sicurezza degli SVG, checksum (`checkOfficialPack`), file per gli zip, modulo del pittogramma, avatar |
| `scripts/import-logo-pack.js` | `npm run logo:import`: importa lo zip del media kit in `assets/logo/official/` |
| `src/kit.js`, `src/zip.js` | file del kit, `LEGGIMI.txt`, scrittore ZIP senza dipendenze |
| `src/tokens-css.js` | token → custom properties CSS |
| `src/site/` | pagine (`book.js`, `gallery.js`, `html.js`), stile (`brand.css`), font self-hosted (`fonts.js`) |

## Formati (`formats/`)

Ogni file esporta un oggetto; `src/formats.js` li scopre in automatico.

```js
export default {
  id: 'icon',
  collection: 'groups',          // content/groups/*.yaml
  width: 640, height: 640,
  safeArea: { shape: 'circle', radius: 280 },
  previews: [96],                // anteprime ridotte (galleria, commento PR)
  output: (g) => `groups/${g.slug}.png`,
  render: (g, { tokens, sets }) => '<svg …>',
};
```

### Aggiungere un formato (fase 2: cover eventi)

1. Schema dei dati in `src/schema.js` e loader per la nuova collezione (`content/events/`).
2. Registrare la collezione in `COLLECTIONS` di `scripts/generate.js` e `scripts/site.js`.
3. `formats/event-cover.js` con `render()`; per testo e impaginazione tornerà probabilmente Satori (vedi ADR-0009).
