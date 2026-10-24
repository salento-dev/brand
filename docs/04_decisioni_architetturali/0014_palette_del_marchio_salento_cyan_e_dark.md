# ADR-0014 · Palette del marchio: Salento Cyan e Salento Dark

- **Stato:** Accettata
- **Data:** 2026-10-24
- **Modifica:** ADR-0003 e ADR-0011 (token: nuova categoria `marchio`, `semantic.primary`), One Signal Rule (ADR-0012)

## Contesto

Il media kit ufficiale (ADR-0013) dichiara i colori del logo: **Salento Cyan `#20D0ED`** (RGB 32, 208, 237), **Salento Dark `#1D1E1C`** (RGB 29, 30, 28), White `#FFFFFF` e Black `#000000` (sfondo dei WEBP e delle anteprime). L'interfaccia del sito e il brand book usano invece **Signal Cyan** = Tailwind `cyan-500` `#00B8DB` (DESIGN.md, ADR-0011). Due cyan diversi per lo stesso ruolo di «spia accesa».

## Decisione

- **Per il logo vince il media kit**: i file ufficiali usano solo Salento Dark, White e Salento Cyan; `npm run validate` verifica che ogni SVG usi solo il colore della sua variante.
- **Salento Cyan diventa il colore primario del brand.** Nei token:
  - primitive `color.salento.cyan` `#20d0ed`, `color.salento.dark` `#1d1e1c`, `color.white` `#ffffff` (`color.black` esiste già);
  - `brand.color.salento-cyan`, `brand.color.salento-dark`, `brand.color.white`, `brand.color.black`, categoria **`marchio`** (mostrata per prima nel brand book come «Colori del marchio»);
  - `semantic.primary` = Salento Cyan; `semantic.accent` diventa un alias di `primary`; nuovo `semantic.ink-on-light` = Salento Dark (logo e segni del marchio su fondi chiari).
- **Signal Cyan resta** (`brand.color.signal-cyan` = `cyan-500`, e Deep/Pale/Wash) documentato come **colore attuale dell'interfaccia del sito, da migrare a Salento Cyan**.
- **Superfici invariate**: la scala `mist` (Console Black, Panel Graphite…) resta la base del sito e del brand book. Salento Dark non è una superficie: è l'inchiostro del logo su fondi chiari.
- **Brand book**: `--signal` passa a Salento Cyan (eyebrow, una parola nei titoli, link, staffe in evidenza). Contrasto: **10.6:1** su mist-950, **9.4:1** su mist-900, 9.0:1 su Salento Dark, 11.3:1 su nero (AA anche per testo piccolo). Su bianco **1.9:1**: il cyan su fondi chiari è vietato. `npm run validate` controlla `primary` su `bg` e su `surface` (≥ 4.5:1) e Salento Dark su fondo chiaro.
- **Icone dei gruppi invariate** (ADR-0008): l'accento `cyan` di AI Corner resta `cyan-400`, è un accento di gruppo, non il colore del marchio.
- La One Signal Rule nomina Salento Cyan e vieta il cyan su fondi chiari.

### Migrazione del sito (da fare nel repo `website`, non qui)

1. `primary` (oggi `cyan-500` `#00B8DB`) → `#20D0ED` (o meglio da `tokens.css`: `--semantic-primary`).
2. Rivedere `primary-dark` (hover, oggi `cyan-700`) e `primary-light` (`cyan-300`): Salento Cyan è più chiaro di cyan-500, l'hover scuro va ricontrollato.
3. Verificare i contrasti: testo cyan su `surface`/`surface-900` (≥ 4.5:1, ok), testo scuro sopra pill/badge cyan, stato «prossimo evento» al 10% di opacità; nessun cyan su superfici chiare.
4. Sostituire il logo del sito con i file ufficiali (orizzontale white-on-dark nell'header, pittogramma per favicon e avatar).

Finché il sito non migra, le due tinte convivono: il brand book usa già Salento Cyan.

## Conseguenze

**Positive**
- Un solo cyan di marca, uguale nel logo, nel brand book e (dopo la migrazione) nel sito.
- I formati futuri (cover eventi) leggono `semantic.primary` e ottengono il colore giusto.

**Negative / trade-off**
- Per un periodo sito e brand book mostrano due cyan leggermente diversi.
- `semantic.accent` cambia valore: i formati che lo usano (es. cover eventi in lavorazione) passano a Salento Cyan.

## Alternative considerate

- **Tenere Signal Cyan come primario e Salento Cyan solo per il logo**: due cyan di marca, incoerente con il media kit.
- **Ricolorare il logo in cyan-500**: vietato dal media kit (colori fuori dalle varianti).
- **Scala completa Salento Cyan (50–950)**: prematuro; si valuta con la migrazione del sito.

## Fonti

- Media kit: https://salento.dev/sd-media-kit-2026/ (sezione Colori, README del logo pack)
- [ADR-0003](0003_token_dtcg_allineati_al_sito.md) · [ADR-0008](0008_accento_per_gruppo.md) · [ADR-0012](0012_ambiti_interfaccia_e_grafiche_community.md) · [ADR-0013](0013_logo_ufficiale_dal_media_kit.md)
- [WCAG 2.2 · 1.4.3 Contrasto minimo](https://www.w3.org/TR/WCAG22/#contrast-minimum)
