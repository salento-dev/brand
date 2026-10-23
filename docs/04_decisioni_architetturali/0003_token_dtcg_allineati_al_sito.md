# ADR-0003 · Token W3C DTCG allineati al sito (e valore "pietra")

- **Stato:** Accettata (le varianti `group.permanent`/`group.temporary` sono sostituite da ADR-0008)
- **Data:** 2026-10-23

## Contesto

Il sito (`website/resources/css/app.css`) usa Tailwind v4: tema solo scuro, superfici sulla scala `mist`, `primary` = `cyan-500`, `secondary` = `violet-500`. Le grafiche devono sembrare parte dello stesso prodotto. Satori e resvg non leggono OKLCH in modo affidabile; servono valori esadecimali. Serve anche un secondo accento per distinguere i gruppi temporanei.

## Decisione

- `tokens/tokens.json` in formato **W3C DTCG** (`$value`, `$type`, alias `{gruppo.token}`), su tre livelli:
  1. **primitive**: `color.mist|cyan|violet|amber.*`, `color.pietra`, `font.*`, `spacing.*`, `radius.*`;
  2. **semantic**: `bg`, `surface`, `border`, `text`, `text-muted`, `accent`, `accent-contrast`, … — **gli unici che i componenti leggono**;
  3. **varianti**: `group.permanent.*`, `group.temporary.*` sovrascrivono le chiavi semantic omonime.
- I colori Tailwind sono convertiti da OKLCH (`tailwindcss/theme.css` del sito) in hex; l'OKLCH originale resta in `$extensions["dev.salento"].oklch`.
- Resolver interno (`src/tokens.js`, ~50 righe) invece di Style Dictionary.
- **Pietra = `#E2B45A`** (OKLCH 79.4% 0.120 82.3), non `amber-400`/`amber-500`:
  - richiama la pietra leccese (oro caldo, poco saturo); `amber-400` (`#FFB900`) è un giallo "segnale/avviso" molto saturo che accanto al cyan risulta aggressivo e si confonde con gli stati di warning;
  - contrasto su `mist-950` **10.25:1** (amber-400 11.45:1, amber-500 9.24:1): ampiamente sopra 4.5:1, e `mist-950` sopra pietra (badge) è altrettanto leggibile;
  - tonalità vicina ad amber (h ≈ 82 vs 84), quindi coerente con gli accenti ambra già presenti nelle utility del sito (`text-gradient`, `shadow-glow`).
- `npm run validate` verifica il **contrasto WCAG** di testo, testo secondario e accento su sfondo/superficie e del testo del badge sull'accento, per ogni variante.

## Conseguenze

**Positive**
- Stessi valori del sito; un cambio di palette si fa in un file.
- Formato standard, leggibile da strumenti futuri (Style Dictionary, Figma Tokens).

**Negative / trade-off**
- La conversione OKLCH → hex è fatta una volta: se Tailwind cambia palette va rifatta (valori di riferimento nei `$extensions`).
- `pietra` non esiste nel sito: è un token solo del brand (da riportare nel sito se adottato).

## Alternative considerate

- **amber-400 / amber-500** come accento temporaneo: più "di sistema" ma meno caratterizzante e con connotazione di avviso.
- **violet-500 (secondary)**: contrasto su `mist-950` solo 4.48:1, sotto soglia per il testo.
- **Style Dictionary**: potente ma sovradimensionato per pochi token e un solo output.

## Fonti

- [Design Tokens Format Module (W3C DTCG)](https://www.designtokens.org/tr/drafts/format/)
- [Tailwind CSS v4 — palette colori](https://tailwindcss.com/docs/colors)
- [WCAG 2.2 — 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- Repo `website`: `resources/css/app.css`, `docs/03_codice/03_design_system_frontend.md`, ADR-0005 (dark theme).
