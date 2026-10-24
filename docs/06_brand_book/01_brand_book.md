# 01 · Brand book e kit

> Pagina pubblica: **https://salento-dev.github.io/brand/** · Decisioni: [ADR-0011](../04_decisioni_architetturali/0011_repo_brand_fonte_di_verita.md) (fonte di verità e import), [ADR-0012](../04_decisioni_architetturali/0012_ambiti_interfaccia_e_grafiche_community.md) (ambiti delle regole).

Il brand book è una pagina unica in italiano per chi fa parte della community, per i partner e per i soci: logo, colori, tipografia, regole e kit da scaricare. Si rigenera a ogni push su `main`.

## Da dove arriva ogni cosa

| Sezione della pagina | Fonte |
|----------------------|-------|
| Hero, Chi siamo, nome, canali | `content/brand/brand.yaml` → `identity`, `northStar` |
| Logo (regole, colori ammessi) | `brand.yaml` → `logo`; geometria in `src/logo.js` (area di rispetto, dimensione minima) |
| Colori (swatch, HEX/RGB/OKLCH) | `tokens/tokens.json` → `brand.color.*` (nome, ruolo, categoria) e `group.accents.*` |
| Named rules | `brand.yaml` → `rules` (con `section` e `scope`) |
| Tipografia | `tokens.json` → `typography.*`, `font.*`; font da `@fontsource-variable/*` |
| Forme e layout | `tokens.json` → `radius.*`, `spacing.*`; demo in `src/site/book.js` + `src/site/brand.css` |
| Grafiche della community | `content/groups/*.yaml` + PNG di `npm run generate` |
| Do & don't | `brand.yaml` → `dosAndDonts` (per ambito) |
| Partner e soci | `brand.yaml` → `partners` (**proposta**, vedi sotto) |
| Download | kit generato da `src/kit.js` + `src/logo.js` |

Provenienza: i contenuti di marca sono stati importati il 2026-10-24 da `salento-dev/website` `DESIGN.md` (branch `chore/design-system-cleanup` @ `fb3aab5`) e dai Brand Commitments di `PRODUCT.md`. Da qui in avanti si modificano **solo in questo repo**.

## Output (`npm run site`)

```
out/index.html            brand book
out/icone/index.html      galleria delle icone (lista chat simulata, 640/96/48, download, archiviati)
out/brand-kit.zip         kit completo (cartella salento-dev-brand-kit/)
out/kit/…                 gli stessi file del kit, scaricabili uno per uno
out/assets/               brand.css (stile della pagina) e tokens.css (generato dai token)
out/fonts/                Outfit, Albert Sans, Roboto Mono (woff2 variabili, OFL) + fonts.css
```

Nessuna risorsa esterna a runtime (niente CDN, niente Google Fonts): un test lo verifica. L'unico JavaScript copia i valori dei colori negli appunti.

## Contenuto del kit

| Cartella | File |
|----------|------|
| `logo/svg/` | `salento-dev-logo-bianco.svg` (Bright Mist), `-cyan.svg` (Signal Cyan), `-nero.svg` (Console Black) |
| `logo/png/` | le tre versioni, trasparenti, alte 512, 1024 e 2048 px, **area di rispetto inclusa** |
| `logo/avatar/` | avatar quadrato (logo Bright Mist al 50% su Console Black), SVG + PNG 512/1024: sicuro per il ritaglio a cerchio |
| `icone-gruppi/` | PNG 640 dei gruppi attivi |
| `token/` | `tokens.json` (DTCG) e `tokens.css` |
| `LEGGIMI.txt` | regole essenziali, licenza, contatti (generato da `brand.yaml`) |

## Regole del logo (sintesi)

- **Area di rispetto X** = una riga di barre del logo (barra + interlinea: 19.26 unità su 105, ~18% dell'altezza).
- **Dimensione minima**: 24 px di altezza su schermo, 8 mm in stampa.
- **Colori ammessi**: Bright Mist e Signal Cyan su fondi scuri; Console Black su fondi chiari **solo** per materiali di terzi (il brand è solo scuro). Nelle icone dei gruppi il logo è stampato in colore sfondo.
- Vietato: ricolorare, deformare, ruotare, aggiungere effetti, contorno, fondi a basso contrasto.

Area di rispetto e dimensione minima sono **derivate dalla geometria** e vanno confermate ([domande aperte](../open-questions.md), n. 15).

## Partner e soci (proposta)

Le indicazioni di co-branding (logo alla stessa altezza visiva dei partner con almeno 2X di distanza, Console Black su fondi chiari, nessuna approvazione implicita, bozza condivisa prima della stampa) sono **nuove**: sono marcate come *proposta* nella pagina e in `brand.yaml` (`partners.status`) finché il core team non le approva ([domande aperte](../open-questions.md), n. 14). Quando approvate: `status: accettata`.

Licenza: codice MIT, asset CC BY 4.0, **marchio escluso** ([LICENSE-ASSETS.md](../../LICENSE-ASSETS.md)); font sotto SIL OFL 1.1.
