# ADR-0004 · Simbolo = Heroicon o illustrazione con sostituzione dell'accento

- **Stato:** Superseded by ADR-0007
- **Data:** 2026-10-23

## Contesto

Ogni gruppo ha un simbolo. Un set di icone pronto copre la maggior parte dei casi, ma la community vuole anche disegni più ricchi e riconoscibili (mercatino, tavola rotonda…). Un'illustrazione deve funzionare sia per un gruppo permanente (accento cyan) sia temporaneo (accento pietra) senza doppioni. Gli SVG arrivano da contributori esterni: vanno controllati.

## Decisione

`symbol` è **uno** tra:

- `{ heroicon: "<nome>" }` — Heroicons **outline 24** (pacchetto npm `heroicons`, versione fissata); il nome è validato contro l'elenco. Renderizzate con tratto **2** (invece di 1.5) per la leggibilità a 48px.
- `{ illustration: "<nome>" }` — file `assets/illustrations/<nome>.svg`.

Le illustrazioni si disegnano con un **accento segnaposto riservato `#00b8db`** (= `cyan-500`, token `illustration.accent-placeholder`); il generatore lo sostituisce con l'accento della variante. `npm run validate` applica un lint:

- `viewBox` quadrato; dimensione massima 30 KB;
- vietati `<image>`/raster, `<text>`, `<script>`, `<style>`, `<foreignObject>`, animazioni, attributi `on*`, `href` e `url()` esterni, `currentColor`;
- solo colori della palette: segnaposto + `bg`, `surface`, `border`, `text`, `text-muted` (hex dai token).

## Conseguenze

**Positive**
- Un'illustrazione vale per tutte le varianti, presenti e future.
- Palette vincolata = stile coerente e contrasto garantito.
- SVG sicuri da renderizzare in CI.

**Negative / trade-off**
- Gli illustratori lavorano in "falso colore" (il cyan è un segnaposto).
- Niente sfumature libere, testo o immagini incorporate.

## Alternative considerate

- **Solo Heroicons**: coerente ma povero per i gruppi "di carattere".
- **Due file per illustrazione (uno per variante)**: duplicazione e derive.
- **`currentColor`**: un solo colore disponibile, niente dettagli in bianco/grigio.
- **Lucide / altri set**: Heroicons è già nell'ecosistema Tailwind del sito.

## Fonti

- [Heroicons](https://heroicons.com)
- [Linee guida illustrazioni](../02_icone_gruppi/02_linee_guida_illustrazioni.md)
