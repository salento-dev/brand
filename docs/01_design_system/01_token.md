# 01 · Token e palette

> Fonte: [`tokens/tokens.json`](../../tokens/tokens.json) (formato W3C DTCG). Decisioni: [ADR-0003](../04_decisioni_architetturali/0003_token_dtcg_allineati_al_sito.md), [ADR-0008](../04_decisioni_architetturali/0008_accento_per_gruppo.md).

## Livelli

```
primitive                     ruoli
color.mist.*, color.cyan.*  ─▶ semantic.*            galleria e formati futuri (cover eventi)
color.violet.*, fuchsia.*,  ─▶ group.icon.*          sfondo e luce delle icone dei gruppi
emerald.*, lime.*           ─▶ group.accents.<nome>  accenti ammessi per i gruppi permanenti
color.pietra, pietra-dark   ─▶ group.temporary       accento fisso dei gruppi temporanei
                               placeholder.*         colori segnaposto dei soggetti (non sono colori del brand)
```

Le primitive Tailwind sono convertite da OKLCH (`tailwindcss/theme.css` del sito) in hex; l'OKLCH originale resta in `$extensions["dev.salento"].oklch` e un test verifica che hex e OKLCH coincidano.

## Ruoli semantic (galleria)

| Token | Valore | Hex | Uso |
|-------|--------|-----|-----|
| `bg` | `mist-950` | `#090b0c` | sfondo pagina |
| `surface` | `mist-900` | `#161b1d` | card |
| `border` | `mist-800` | `#22292b` | bordi |
| `text` | `mist-50` | `#f9fbfb` | testo |
| `text-muted` | `mist-400` | `#9ca8ab` | testo secondario |
| `accent` | `cyan-500` | `#00b8db` | link, logo |
| `secondary` | `violet-500` | `#8e51ff` | riservato |

## Icone dei gruppi

| Token | Valore | Hex | Uso |
|-------|--------|-----|-----|
| `group.icon.bg` | `mist-900` | `#161b1d` | sfondo, stacchi tra le forme, logo stampato |
| `group.icon.highlight` | `mist-50` | `#f9fbfb` | riflessi, vapore, strisce, fari |

### Accenti (`accent` nel YAML dei permanenti)

| Nome | `accent` | `accent-dark` | Contrasto accento / sfondo | Gruppo attuale |
|------|----------|---------------|----------------------------|----------------|
| `cyan` | cyan-400 `#00d3f2` | cyan-700 `#007595` | 9.60:1 | AI Corner |
| `violet` | violet-400 `#a684ff` | violet-700 `#7008e7` | 6.09:1 | Tavola Rotonda |
| `fuchsia` | fuchsia-400 `#ed6aff` | fuchsia-700 `#a800b7` | 6.71:1 | Dev Break |
| `emerald` | emerald-400 `#00d492` | emerald-700 `#007a55` | 8.96:1 | @include |
| `lime` | **lime-500** `#7ccf00` | lime-700 `#497d00` | 8.92:1 | Mercatino |
| *temporanei* | pietra `#e2b45a` | pietra-dark `#976403` | 9.03:1 | tutti i temporanei |

`lime` usa il 500 perché il 400 è troppo acido accanto agli altri. `pietra-dark` è **calcolata** (`darkShade` in `src/color.js`: OKLCH L −25, C ×0.95, H −8°) perché la pietra non ha una scala; un test verifica che il valore nei token corrisponda al calcolo.

### Contrasto (verificato da `npm run validate` per ogni accento e per la pietra)

| Regola | Minimo | Perché |
|--------|--------|--------|
| `accent` / `bg` | 4.5:1 | soggetto e doodle sullo sfondo; logo stampato (colore sfondo) sull'accento |
| `accent-dark` / `bg` | 2:1 | ombre e parti secondarie distinguibili dallo sfondo (decorative) |
| `accent` / `accent-dark` | 2:1 | ombra piatta distinguibile dalla parte in luce |

Per aggiungere un accento: primitive nei token (con OKLCH), voce in `group.accents`, `npm run schema` (l'elenco entra nello schema), `npm run validate`.

## Segnaposto dei soggetti (`placeholder.*`)

| Token | Hex | Diventa |
|-------|-----|---------|
| `placeholder.accent` | `#ff00ff` | accento del gruppo |
| `placeholder.accent-dark` | `#800080` | accento scuro |
| `placeholder.highlight` | `#ffffff` | `group.icon.highlight` |
| `placeholder.bg` | `#000000` | `group.icon.bg` |

Dettagli in [Soggetti](../02_icone_gruppi/02_soggetti.md).

## Font e raggi

I token `font.*` (Outfit, Albert Sans, Roboto Mono) e `radius.*` restano allineati al sito ma **non sono usati dalle icone** (niente testo): serviranno alle cover eventi (fase 2).
