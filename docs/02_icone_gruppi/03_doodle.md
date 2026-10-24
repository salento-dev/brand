# 03 · Doodle e wallpaper

Il wallpaper è fatto di doodle "a schizzo" presi da [`assets/doodles/`](../../assets/doodles/): stesso spessore, stesso colore (l'accento del gruppo), opacità 0.5. Fanno da texture: si devono riconoscere a 640px, a 48px diventano una trama che distingue l'icona da un fondo piatto.

## Quali doodle finiscono in un'icona

| Fonte | Peso | Dove si definisce |
|-------|------|-------------------|
| doodle del gruppo | ×3 | campo `doodles` del YAML (max 10, solo doodle senza prefisso) |
| set comune | ×1 | `base` in [`assets/doodles/sets.yaml`](../../assets/doodles/sets.yaml) (oggi `sun`, `pajara`) |
| riempitivi | 10 per icona | `fillers` in `sets.yaml` (solo `filler-*`) |

Il generatore mescola i nomi (seed = slug) e piazza un doodle alla volta in un punto casuale dove non tocca gli altri, finché c'è posto. Stesso slug → stessa icona; cambiare lo slug o l'elenco cambia la disposizione.

Consigli per `doodles`: 4–6 oggetti del tema del gruppo, riconoscibili da soli (pizza, gamepad, cuffie per Dev Break; carrello, cartellino, monete per Mercatino). Evita doodle uguali al soggetto.

## Regole di disegno

Le regole complete (viewBox, solo `currentColor`, capi tondi, niente archi `A`, `data-w` per i dettagli) sono in [`assets/doodles/README.md`](../../assets/doodles/README.md) e sono controllate da `npm run validate`.

## Aggiungere un doodle

1. Disegna su `viewBox="0 0 96 96"` con tratto `currentColor` (spessore indicativo 3: viene comunque normalizzato), capi e giunzioni tondi.
2. Salva in `assets/doodles/<nome>.svg` con il commento iniziale (nome e provenienza; per icone di terzi: fonte, autore, licenza).
3. Aggiungilo ai `doodles` di un gruppo, `npm run validate && npm run generate && npm run site`.
