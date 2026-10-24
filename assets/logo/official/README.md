# Salento.dev · logo pack ufficiale

File ufficiali del logo di Salento.dev, dal media kit della community. Brand book con regole ed esempi:
https://salento-dev.github.io/brand/#logo

## Contenuto

Quattro famiglie:

- **Logo stacked + simbolo** (`stacked-symbol`): versione istituzionale completa, pittogramma e nome su due righe. Per hero, copertine, pagine e materiali con spazio verticale.
- **Logo orizzontale** (`horizontal`): simbolo a sinistra, la variante più flessibile. Per header, footer, sponsor wall, pagine web e materiali partner.
- **Logo compatto stacked** (`compact-stacked`): pittogramma sopra e nome sotto. Per badge, card, layout stretti.
- **Pittogramma** (`pictogram`): solo il simbolo. Per favicon, avatar, pattern, sticker e icone.

Per ogni famiglia tre varianti di colore:

1. `dark-on-light` = Salento Dark su sfondo chiaro
2. `white-on-dark` = bianco su sfondo scuro
3. `cyan-on-dark` = Salento Cyan su sfondo scuro

Formati:

- `svg/` SVG trasparente (vettoriale, da preferire)
- `png/` PNG trasparente
- `webp/` WEBP con sfondo incluso (`#FFFFFF` per dark-on-light, `#000000` per le varianti su scuro)

Ogni formato ha due versioni:

- `padded/` con un piccolo margine già incluso nel file
- `no-padding/` taglio stretto sul logo, senza spazio extra

Nome dei file: `logos/<formato>/<padding>/salentodev-<famiglia>-<variante>-<padding>.<estensione>`.

## Colori

| Colore | HEX | RGB | Uso |
|--------|-----|-----|-----|
| Salento Dark | `#1D1E1C` | 29, 30, 28 | logo su sfondi chiari |
| Salento Cyan | `#20D0ED` | 32, 208, 237 | logo su sfondi scuri |
| White | `#FFFFFF` | 255, 255, 255 | logo su sfondi scuri, sfondo dei WEBP chiari |
| Black | `#000000` | 0, 0, 0 | sfondo dei WEBP scuri e delle anteprime |

## Linee guida essenziali

- Usa sempre questi file ufficiali: non ricostruire, ridisegnare, deformare o inclinare il logo.
- Lascia sempre spazio libero attorno al logo: almeno l'altezza di un modulo (una barra) del pittogramma. Niente testi, icone, bordi o altri marchi dentro quest'area. Nei layout stretti preferisci la versione `padded` invece di aggiungere margini casuali.
- Non ridurre il nome fino a renderlo illeggibile: per avatar, favicon e icone piccole usa il pittogramma.
- Usa `dark-on-light` su sfondi chiari e puliti, `white-on-dark` o `cyan-on-dark` su sfondi scuri. Mai la versione cyan su fondi chiari o poco contrastati.
- Su foto, pattern o gradienti metti il logo su un'area piena che garantisca un contrasto stabile.
- Non cambiare i colori al di fuori delle tre varianti; niente ombre, glow, gradienti o effetti.
- Non usare screenshot o file compressi al posto di questi file.

## Il nome

Nel testo si scrive sempre **Salento.dev**. Il wordmark del logo si legge «Salento Dev»: è un elemento grafico e resta com'è, non va ricopiato nel testo.

## Copyright e licenza

Copyright © 2026 Salento.dev. Tutti i diritti riservati.

Il logo (tutte le famiglie e le varianti), il wordmark e il nome «Salento.dev» sono segni distintivi protetti e di titolarità dei rispettivi aventi diritto. Qualsiasi utilizzo è subordinato a preventiva autorizzazione e deve rispettare le linee guida ufficiali. Per chiedere l'autorizzazione: salento.dev@gmail.com.

Il download o l'accesso al brand book, al kit o a questo logo pack non comporta cessione di diritti, licenze implicite o autorizzazioni automatiche. Ogni uso non autorizzato, improprio o non conforme è espressamente vietato.

Questi file sono esclusi dalle licenze aperte del repository (codice MIT, altri asset CC BY 4.0): vedi `LICENSE-ASSETS.md` nel repository https://github.com/salento-dev/brand.

## Provenienza

- Fonte: media kit di Salento.dev, https://salento.dev/sd-media-kit-2026/ (logo pack `.zip`, file datati 2026-05-30), scaricato il 2026-10-24.
- SHA-256 dello zip originale: `247533ce4cc5285bbdc98cf0f34959c1e298c3a67f2771b0001ed691a3a2f2f7`.
- PNG e WEBP sono identici agli originali. Negli SVG l'unica modifica è il prefisso XML `ns0:` riportato al namespace SVG di default (`<svg xmlns="http://www.w3.org/2000/svg">`): geometria, colori e testi invariati.
- `SHA256SUMS` elenca i file di questa cartella (verifica: `shasum -a 256 -c SHA256SUMS`); `SHA256SUMS.upstream` (solo nel repository) i file originali dello zip.
