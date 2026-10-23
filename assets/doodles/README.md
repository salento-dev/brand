# Doodle

Libreria di disegni "a schizzo" per il **wallpaper** delle icone dei gruppi (vedi
[docs/02_icone_gruppi/03_doodle.md](../../docs/02_icone_gruppi/03_doodle.md)). Un file SVG per doodle: il nome
file (kebab-case) è l'identificativo usato nel campo `doodles` dei gruppi e in [`sets.yaml`](sets.yaml).

Il generatore non disegna gli SVG così come sono: ne legge la geometria e la ripassa con un tratto "a pennello"
(leggera ondulazione, spessore variabile, chiusure imperfette), con spessore e colore uguali per tutti.

## Tipi (dal prefisso del nome)

| Prefisso | Tipo | viewBox | Uso |
|---|---|---|---|
| *(nessuno)* | doodle | `0 0 96 96` | wallpaper, 64–100px; elencabili in `doodles` e `base` |
| `filler-` | riempitivo | `0 0 32 32` | stelline, puntini… negli spazi rimasti (`fillers` in `sets.yaml`) |
| `hero-` | scena | `0 0 160 160` | scene grandi, **non usate** dalle icone (riservate alle cover eventi, fase 2) |

## Regole di stile (controllate da `npm run validate`)

- `viewBox` quadrato che parte da `0 0` (di norma `0 0 96 96`); margine di ~8 unità attorno al disegno.
- Sul tag `<svg>`: `fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"`.
- **Solo `currentColor`** (o `none`) per `fill` e `stroke`: il generatore lo sostituisce con l'accento del gruppo.
  Piccoli riempimenti sono ammessi con `fill="currentColor"` + `fill-opacity` (es. cuore della tazzina).
- Elementi ammessi: `g`, `path`, `circle`, `ellipse`, `rect`, `line`, `polyline`, `polygon`.
  Niente testo, immagini, filtri, gradienti, `style`, `class`, link.
- **Niente archi `A` nelle path**: il tratto a mano libera lavora su curve; usa `C`/`Q` (o `circle`/`ellipse`).
- `data-w=".6"` su un elemento = tratto più sottile (frazione dello spessore standard), per i dettagli.
- Forme semplici, leggibili a ~60px; massimo 12KB. Prima riga: commento con nome e provenienza.

## Fonti e licenze

Tutti i file attuali sono **disegnati a mano per Salento.dev** e sono rilasciati con la licenza del repository.
Le icone [Tabler](https://tabler.io/icons) (MIT, © Paweł Kuna) usate dalla prima libreria non sono più presenti:
se ne riaggiungi una (o un'icona di un altro set con licenza compatibile) indica nel commento iniziale fonte,
autore e licenza, e aggiungila a questa tabella.

| File | Fonte | Licenza |
|---|---|---|
| tutti | disegnati per Salento.dev | come il repository |
