# 02 · Soggetti

Il soggetto è l'illustrazione **flat** al centro dell'icona: un file SVG per soggetto in [`assets/subjects/`](../../assets/subjects/), scelto nel YAML del gruppo con `subject: <nome>`. Lo stesso soggetto può servire più gruppi (es. `code-window` per @include e per un hackathon): i colori arrivano dal gruppo.

| Soggetto | Descrizione | Usato da |
|----------|-------------|----------|
| `coffee-cup` | tazza fumante su piattino, manico a D | Dev Break |
| `round-table` | tavolo rotondo dall'alto con 6 sedie | Tavola Rotonda |
| `robot` | busto di robot, logo sul petto | AI Corner |
| `code-window` | finestra di editor con `< logo >` | @include, Hackathon (archiviato) |
| `market-stall` | bancarella con tenda a strisce, banco vuoto | Mercatino |
| `train` | treno visto di fronte sui binari | trasferte (temporanei) |

## Colori segnaposto

Si disegna in "falso colore" con **esattamente questi quattro colori**; il generatore li sostituisce con quelli del gruppo. Qualunque altro colore fa fallire `npm run validate`.

| Segnaposto | Hex | Diventa | Uso |
|------------|-----|---------|-----|
| ACCENT | `#ff00ff` | accento (es. fuchsia-400, pietra) | volumi in luce |
| ACCENT_DARK | `#800080` | accento scuro (-700, pietra scura) | ombra piatta a destra, parti secondarie |
| HIGHLIGHT | `#ffffff` | mist-50 | riflessi, vapore, strisce, fari |
| BG | `#000000` | sfondo mist-900 | stacchi tra forme, logo stampato, "buchi" |

Ammessi anche `none` e `url(#id)` verso un `clipPath` interno. Esadecimali corti o maiuscoli vanno bene (`#FFF`).

## Griglia e regole di disegno

- `viewBox="0 0 160 160"` (obbligatorio). Ingombro di progetto **136 unità** (≈ 12…148): con la scala ×3.25 diventa il 69% del diametro dell'icona.
- **Cerchio sicuro**: tutto (stacchi compresi) entro **86 unità dal centro (80, 80)**; `validate` lo misura sul rendering e fallisce se si esce. Attenzione agli angoli dei rettangoli larghi in basso.
- **Luce dall'alto a sinistra**: ombra piatta ACCENT_DARK sul quarto destro dei volumi, ottenuta con un `clipPath` della forma e un rettangolo scuro (vedi `coffee-cup.svg`).
- **Stacchi**: tra forme sovrapposte una "fessura" color sfondo di 4.5 unità, con
  `stroke="#000000" stroke-width="9" stroke-linejoin="round" paint-order="stroke"` sulla forma che sta sopra.
- **Tratti pieni** (manici, vapore, binari, parentesi): spessore **12** (dettagli 5–8), `stroke-linecap="round" stroke-linejoin="round"`.
- **Raggi** coerenti: 6 / 8 / 12 / 18 unità.
- **Logo**: le barre del logo stampate sul soggetto in BG `#000000`, alte 26–52 unità. Copia il blocco `<g transform="translate(x y) scale(k)" fill="#000000">…</g>` da un soggetto esistente; con altezza `h` e centro `(cx, cy)`: `k = h / 105`, `x = cx − 45·k`, `y = cy − h/2`.
- Pochi elementi grandi: a 48px il soggetto è grande ~33px.

## Vietato (controllato da `npm run validate`)

- colori fuori dai 4 segnaposto, `currentColor`;
- `<image>`/raster, `<text>`, `<script>`, `<style>`, `<foreignObject>`, `<use>`, filtri, gradienti, maschere, animazioni;
- attributi `style`, `class`, `on*`; `href`/`url()` esterni;
- `viewBox` diverso da `0 0 160 160`; file oltre 30 KB.

## Aggiungere un soggetto

1. Apri la issue **Nuovo soggetto o doodle** con l'idea.
2. Disegna (Figma, Inkscape o a mano nell'editor) su 160×160 con i 4 segnaposto; esporta "SVG minimale" e ripulisci (niente metadati, niente `style`).
3. Salva in `assets/subjects/<nome>.svg` (kebab-case, in inglese come gli altri) con un commento iniziale che descrive il soggetto.
4. Usalo in un gruppo (`subject: <nome>`), poi `npm run validate && npm run generate && npm run site` e controlla 640/96/48 e la lista chat.
5. Apri la PR: le anteprime arrivano nel commento automatico.
