# 01 · Brand book e kit

> Pagina pubblica: **https://salento-dev.github.io/brand/** · Decisioni: [ADR-0011](../04_decisioni_architetturali/0011_repo_brand_fonte_di_verita.md) (fonte di verità e import), [ADR-0012](../04_decisioni_architetturali/0012_ambiti_interfaccia_e_grafiche_community.md) (ambiti delle regole), [ADR-0013](../04_decisioni_architetturali/0013_logo_ufficiale_dal_media_kit.md) (logo ufficiale), [ADR-0014](../04_decisioni_architetturali/0014_palette_del_marchio_salento_cyan_e_dark.md) (Salento Cyan), [ADR-0015](../04_decisioni_architetturali/0015_licenza_logo_e_nome_riservati.md) (licenza).

Il brand book è una pagina unica in italiano per chi fa parte della community, per i partner e per i soci: logo ufficiale, descrizioni, colori, tipografia, regole e kit da scaricare. Integra il [media kit](https://salento.dev/sd-media-kit-2026/) della community. Si rigenera a ogni push su `main`.

## Da dove arriva ogni cosa

| Sezione della pagina | Fonte |
|----------------------|-------|
| Hero, Chi siamo, nome, canali | `content/brand/brand.yaml` → `identity`, `northStar` |
| Descrizioni ufficiali | `brand.yaml` → `descriptions` (dal media kit, nome scritto Salento.dev) |
| Logo (famiglie, varianti, quale usare dove, linee guida, diritti) | `brand.yaml` → `logo`; file in `assets/logo/official/` (ADR-0013) |
| Colori (swatch, HEX/RGB/OKLCH) | `tokens/tokens.json` → `brand.color.*` (nome, ruolo, categoria; prima i colori del `marchio`) e `group.accents.*` |
| Named rules | `brand.yaml` → `rules` (con `section` e `scope`) |
| Tipografia | `tokens.json` → `typography.*`, `font.*`; font da `@fontsource-variable/*` |
| Forme e layout | `tokens.json` → `radius.*`, `spacing.*`; demo in `src/site/book.js` + `src/site/brand.css` |
| Grafiche della community | `content/groups/*.yaml` + PNG di `npm run generate` |
| Do & don't | `brand.yaml` → `dosAndDonts` (per ambito) |
| Partner e soci | `brand.yaml` → `partners` (**proposta**, vedi sotto) |
| Download | kit generato da `src/kit.js` + `src/logo.js` |

Provenienza: i contenuti di marca sono stati importati il 2026-10-24 da `salento-dev/website` `DESIGN.md` (branch `chore/design-system-cleanup` @ `fb3aab5`) e dai Brand Commitments di `PRODUCT.md`; logo pack, descrizioni, colori del marchio e linee guida del logo dal media kit (https://salento.dev/sd-media-kit-2026/, 2026-10-24). Da qui in avanti si modificano **solo in questo repo**.

## Output (`npm run site`)

```
out/index.html            brand book
out/icone/index.html      galleria delle icone (lista chat simulata, 640/96/48, download, archiviati)
out/brand-kit.zip         kit completo (cartella salento-dev-brand-kit/)
out/salentodev-logo-pack.zip  solo il logo pack ufficiale (cartella salentodev-logo-pack/)
out/kit/…                 gli stessi file del kit, scaricabili uno per uno
out/assets/               brand.css (stile della pagina) e tokens.css (generato dai token)
out/fonts/                Outfit, Albert Sans, Roboto Mono (woff2 variabili, OFL) + fonts.css
```

Nessuna risorsa esterna a runtime (niente CDN, niente Google Fonts): un test lo verifica. L'unico JavaScript copia i valori dei colori negli appunti.

## Contenuto del kit

| Cartella | File |
|----------|------|
| `logo-pack/` | logo pack ufficiale, **identico** a `assets/logo/official/`: `README.md` (adattato), `SHA256SUMS`, `logos/{svg,png,webp}/{padded,no-padding}/` (72 file) |
| `avatar/` | avatar quadrato: pittogramma ufficiale white-on-dark al 50% su Black, SVG + PNG 512/1024, sicuro per il ritaglio a cerchio (anche favicon della pagina) |
| `icone-gruppi/` | PNG 640 dei gruppi attivi |
| `token/` | `tokens.json` (DTCG) e `tokens.css` |
| `LEGGIMI.txt` | regole essenziali, licenza, contatti (generato da `brand.yaml`) |

## Regole del logo (sintesi)

- **Solo i file ufficiali** del logo pack: mai ricostruire, ridisegnare, deformare, inclinare, ricolorare o aggiungere effetti; niente screenshot o file compressi.
- **Famiglie**: stacked + simbolo (copertine, hero, slide), orizzontale (header, footer, sponsor wall, web, partner), compatto stacked (badge, card, layout stretti), pittogramma (favicon, avatar, sticker, piccole dimensioni).
- **Varianti**: dark-on-light (Salento Dark) su fondi chiari; white-on-dark o cyan-on-dark (Salento Cyan) su fondi scuri; mai cyan su chiaro. Su foto, pattern o gradienti: un'area piena dietro.
- **Area di rispetto**: almeno un **modulo** del pittogramma (l'altezza di una barra, ~7.8% del pittogramma). Il padding dei file «padded» è più piccolo.
- **Dimensioni**: il nome non va ridotto fino all'illeggibilità, sotto si usa il pittogramma; il pittogramma resta riconoscibile fino a ~24 px / 8 mm (indicazione derivata, da confermare: [domande aperte](../open-questions.md), n. 15).
- Il wordmark si legge «Salento Dev»: è grafica; nel testo il nome è sempre **Salento.dev**.
- Nelle icone dei gruppi il pittogramma (`assets/logo.svg`, stessa geometria dell'ufficiale) è stampato in colore sfondo.

## Partner e soci (proposta)

Le indicazioni di co-branding (logo orizzontale alla stessa altezza visiva dei partner con almeno due moduli di distanza, dark-on-light su fondi chiari, nessuna approvazione implicita, bozza condivisa prima della stampa) sono **nuove**: sono marcate come *proposta* nella pagina e in `brand.yaml` (`partners.status`) finché il core team non le approva ([domande aperte](../open-questions.md), n. 14). Quando approvate: `status: accettata`.

Licenza: **logo, wordmark e nome riservati** (uso solo con autorizzazione); altri asset CC BY 4.0, le icone dei gruppi utilizzabili per i gruppi e la comunicazione di Salento.dev con il logo al loro interno riservato; codice MIT; font SIL OFL 1.1 ([LICENSE-ASSETS.md](../../LICENSE-ASSETS.md), ADR-0015).
