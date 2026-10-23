# 02 · Pipeline e formati

## Pipeline

```
content/groups/*.yaml ─▶ zod (src/schema.js) ─▶ formats/icon.js ─▶ SVG ─▶ resvg ─▶ PNG 640 (+ anteprima 96)
tokens/tokens.json ──────────────────────────────┤  sfondo
assets/doodles/ + sets.yaml ─▶ src/wallpaper.js ─┤  wallpaper di doodle a schizzo (src/doodles.js)
assets/subjects/<nome>.svg ─▶ src/subjects.js ───┘  soggetto con i colori del gruppo
```

L'SVG è composto **direttamente** (stringhe) e convertito in PNG con `@resvg/resvg-js`, senza font di sistema: stesso input → stessi byte ([ADR-0009](../04_decisioni_architetturali/0009_svg_diretto_resvg_senza_satori.md)).

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
2. Registrare la collezione in `COLLECTIONS` di `scripts/generate.js` e `scripts/gallery.js`.
3. `formats/event-cover.js` con `render()`; per testo e impaginazione tornerà probabilmente Satori (vedi ADR-0009).
