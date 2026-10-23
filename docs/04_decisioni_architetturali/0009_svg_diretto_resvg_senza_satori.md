# ADR-0009 · SVG composto direttamente + resvg; Satori, font e Heroicons rimossi

- **Stato:** Accettata
- **Data:** 2026-10-23
- **Modifica:** ADR-0001 (rimuove `components/`)

## Contesto

La prima pipeline componeva HTML/CSS con componenti (`Frame`, `Symbol`, `Logo`, `Badge`), lo convertiva in SVG con Satori (con i font Outfit/Albert Sans/Roboto Mono di `@fontsource`) e poi in PNG con resvg. Le nuove icone (ADR-0007) non hanno testo né layout a flexbox: sono livelli SVG sovrapposti (sfondo, doodle, soggetto). I prototipi componevano già l'SVG a mano e lo passavano a resvg.

## Decisione

- Il formato `icon` restituisce direttamente una **stringa SVG** (`render(gruppo)`), convertita con `@resvg/resvg-js` senza font di sistema (`loadSystemFonts: false`): più veloce e **deterministico**.
- Rimossi: `satori`, `satori-html`, `@fontsource/*`, `heroicons`, la cartella `components/` e il codice dei simboli/illustrazioni/badge. Dipendenze rimaste: `@resvg/resvg-js`, `js-yaml`, `zod`.
- Interfaccia dei formati: `{ id, collection, width, height, safeArea, previews, output, render }` (al posto di `variant` + `layout`).
- **Fase 2 (cover eventi)**: lì servono testo e impaginazione; Satori (con i font del sito) tornerà probabilmente per quel formato, che produrrà comunque un SVG per resvg. I token `font.*` restano per questo.

## Conseguenze

**Positive**
- Meno dipendenze (sparisce anche l'avviso `npm audit` su `fflate` dentro Satori).
- Rendering di 6 icone in ~2 s; test di determinismo a livello di byte.
- Nessuna "traduzione" HTML→SVG da capire per chi mantiene il codice.

**Negative / trade-off**
- Niente layout automatico: posizioni e scale sono calcolate a mano (va bene per le icone, non per testi lunghi).
- Reintrodurre Satori in fase 2 significa ri-aggiungere font e dipendenze.

## Alternative considerate

- **Tenere Satori** con un `<img>` dell'SVG composto: dipendenze e passaggi in più senza benefici.
- **Canvas (node-canvas / skia)**: dipendenze native più pesanti; resvg è già usato e ha binari precompilati per tutte le piattaforme della CI.

## Fonti

- [resvg-js](https://github.com/yisibl/resvg-js)
- [Satori](https://github.com/vercel/satori)
