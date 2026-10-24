# ADR-0013 · Logo ufficiale dal media kit, vendorizzato così com'è

- **Stato:** Accettata
- **Data:** 2026-10-24
- **Modifica:** ADR-0011 (il kit non contiene più loghi generati da questo repo)

## Contesto

Esiste un **media kit ufficiale** della community, pubblicato su https://salento.dev/sd-media-kit-2026/, con descrizioni, colori, linee guida e un **logo pack** (zip, file datati 2026-05-30): quattro famiglie (stacked + simbolo, orizzontale, compatto stacked, pittogramma) in tre varianti di colore (dark-on-light, white-on-dark, cyan-on-dark), in SVG, PNG e WEBP, con e senza padding: 72 file.

Il brand book di questo repo (ADR-0011) generava invece le sue varianti del solo pittogramma (Bright Mist, Signal Cyan, Console Black) da `assets/logo.svg`, con un'area di rispetto derivata dalla geometria. Due set di loghi in concorrenza, con colori diversi e senza il logo con il nome. Il media kit vieta di ricostruire o ridisegnare il logo.

## Decisione

- **I file ufficiali sono la fonte di verità del logo.** Si vendorizzano in `assets/logo/official/` con la stessa struttura del pack (`logos/{svg,png,webp}/{padded,no-padding}/salentodev-<famiglia>-<variante>-<padding>.<ext>`), con `npm run logo:import -- <cartella>` (`scripts/import-logo-pack.js`).
- I file sono trattati come **dati non fidati**: si copiano solo i 72 nomi attesi; gli SVG passano un controllo di sicurezza (solo `svg`/`title`/`g`/`path`, attributi noti, nessuno script, riferimento esterno, entità, stile o `foreignObject`; tracciati solo M/L/C/Z; un solo colore, quello della variante). L'**unica modifica** è il prefisso XML `ns0:` degli SVG riportato al namespace SVG di default: geometria, colori e testi invariati. PNG e WEBP sono identici agli originali.
- **Provenienza e integrità**: `SHA256SUMS` (file vendorizzati), `SHA256SUMS.upstream` (file dello zip originale), SHA-256 dello zip in `README.md` e in `content/brand/brand.yaml` (`logo.provenance`). `npm run validate` verifica i 72 file, nessun file in più, i checksum, la sicurezza degli SVG e la firma di PNG/WEBP.
- `assets/logo/official/README.md` è il README del pack **adattato** (nome «Salento.dev», licenza decisa in ADR-0015) e accompagna il pack nei download.
- **Brand book**: la sezione Logo mostra le 4 famiglie con descrizione e usi, ogni variante sul suo sfondo (bianco o nero), i link a SVG/PNG/WEBP con e senza padding, la tabella «quale logo usare dove», le linee guida del media kit (uso, area di rispetto, leggibilità, sfondi, errori da evitare) e i diritti. Ovunque nella pagina il logo è un `<img>` dei file ufficiali (topbar: orizzontale; hero: stacked + simbolo; footer: pittogramma). I testi stanno in `brand.yaml` → `logo`.
- **Regole derivate**: si tengono solo dove coerenti con il media kit. L'area di rispetto passa a **un modulo del pittogramma** (l'altezza di una barra, ~7.8% dell'altezza del pittogramma) come minimo, al posto della riga di barre (~18%); resta l'indicazione derivata «pittogramma riconoscibile fino a ~24px / 8mm».
- **Download**: `brand-kit.zip` contiene `logo-pack/` (README, SHA256SUMS, `logos/…`) al posto delle varianti generate; il pack è scaricabile anche da solo come `salentodev-logo-pack.zip` (radice `salentodev-logo-pack/`). Gli stessi file sono in `out/kit/logo-pack/` per i link singoli.
- **Avatar**: resta un solo file generato, `avatar/salentodev-avatar.svg` (+ PNG 512/1024): il pittogramma ufficiale white-on-dark incorporato senza modifiche (stesso viewBox e tracciati) su Black `#000000`, alto metà del lato. È anche la favicon della pagina.
- **`assets/logo.svg` resta** com'è: è il riferimento del pittogramma stampato nei soggetti delle icone dei gruppi. Ha la **stessa geometria** del pittogramma ufficiale a un'altra scala (17 barre, scarto massimo 0.1 unità su 104.5 dopo la normalizzazione): un test lo verifica. Le icone dei gruppi non cambiano.

## Conseguenze

**Positive**
- Un solo set di loghi, uguale a quello del media kit; niente ricostruzioni.
- Integrità verificabile (checksum) e file sicuri da servire su Pages.
- Partner e soci trovano tutto in un posto: file singoli, pack completo, regole.

**Negative / trade-off**
- 72 file binari (~1.3 MB) nel repo; un aggiornamento del media kit va reimportato a mano (`npm run logo:import`) e rivisto in PR.
- Il brand book e il media kit sul sito possono divergere finché non si decide quale tenere (domande aperte).
- Il README adattato si aggiorna a mano.

## Alternative considerate

- **Rigenerare le famiglie da `assets/logo.svg` + font**: vietato dal media kit (non ricostruire) e il wordmark non è un font disponibile qui.
- **Linkare lo zip del sito senza vendorizzarlo**: nessun controllo di integrità, risorsa esterna, il brand book non sarebbe autosufficiente.
- **SVG perfettamente identici (con `ns0:`)**: validi, ma alcuni editor e l'uso inline li gestiscono male; la normalizzazione è tracciata da `SHA256SUMS.upstream`.
- **Generare noi i WEBP**: superfluo, il pack li contiene già.

## Fonti

- Media kit: https://salento.dev/sd-media-kit-2026/ (logo pack, SHA-256 `247533ce4cc5285bbdc98cf0f34959c1e298c3a67f2771b0001ed691a3a2f2f7`)
- [ADR-0011](0011_repo_brand_fonte_di_verita.md) · [ADR-0014](0014_palette_del_marchio_salento_cyan_e_dark.md) · [ADR-0015](0015_licenza_logo_e_nome_riservati.md)
