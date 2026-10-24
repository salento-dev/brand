# ADR-0011 · Il repo brand è la fonte di verità dell'identità (import da DESIGN.md e brand book)

- **Stato:** Accettata
- **Data:** 2026-10-24
- **Modifica:** ADR-0003 (aggiunge il livello `brand` ai token), ADR-0006 (`out/index.html` diventa il brand book, la galleria passa a `out/icone/`)

## Contesto

L'identità visiva di Salento.dev era descritta solo nel repo del sito: `DESIGN.md` (North Star "The Night Console", colori con nome e ruolo, Named Rules, tipografia, forme, Do's and Don'ts) e i Brand Commitments di `PRODUCT.md`. Il repo del sito è **privato** e `DESIGN.md` esiste solo sul branch `chore/design-system-cleanup` (commit `fb3aab5`). Community, partner e soci hanno bisogno di regole e materiali pubblici e scaricabili; questo repo è pubblico, ha già token, logo e una pipeline che pubblica su GitHub Pages.

## Decisione

- **Questo repo è la fonte di verità del brand.** Le regole si cambiano qui; il sito le recepisce (vedi [domande aperte](../open-questions.md), n. 13).
- **Import** (2026-10-24, da `salento-dev/website` `DESIGN.md`, branch `chore/design-system-cleanup` @ `fb3aab5`) del solo contenuto di marca, diviso in due fonti:
  - **valori** in [`tokens/tokens.json`](../../tokens/tokens.json): nuovo livello `brand.color.*` con i 18 colori con nome (Signal Cyan, Console Black, Panel Graphite…) come alias alle primitive, ruolo in `$description`, nome, categoria, token del sito e valore originale (`designMd`) in `$extensions["dev.salento"]`; `typography.*` (gerarchia, token compositi DTCG), spaziature con nome (`spacing.bracket|card|control|page-x|section|hero-y`), `radius.xs` (0.125rem, default) e le primitive mancanti `color.black` e `color.green.400/500` (convertite da OKLCH come le altre). I token esistenti restano; `semantic.radius` passa a `radius.xs` come da DESIGN.md.
  - **testi e regole** in [`content/brand/brand.yaml`](../../content/brand/brand.yaml) (validato con zod da `src/brand.js` e da `npm run validate`): identità (nome, dominio, lingua, canali, email), North Star, Named Rules con **ambito** (ADR-0012), regole del logo, Do's and Don'ts, indicazioni per i partner. Formattazione ammessa: `**grassetto**`, `` `codice` ``, `[link](https://…)`.
- **Esclusi dall'import**: uso dei componenti Blade/Tailwind, animazioni GSAP, `.claude/design.md` (catalogo componenti), e da `PRODUCT.md` tutto tranne i Brand Commitments (utenti, posizionamento, evidenze restano interni). Il link di invito WhatsApp non si pubblica: i canali puntano al sito (lo schema lo rifiuta).
- **Brand book**: `npm run site` (`scripts/site.js`) genera a ogni build
  - `out/index.html`: pagina unica in italiano (hero, essenza, logo, colori, tipografia, forme, grafiche della community, do & don't, partner, download), HTML + CSS statici con lo stile del brand e un solo script (copia negli appunti);
  - `out/icone/index.html`: la galleria delle icone (stesse funzioni di prima);
  - `out/brand-kit.zip` (+ gli stessi file in `out/kit/`): logo SVG in Bright Mist, Signal Cyan e Console Black, PNG trasparenti 512/1024/2048 con area di rispetto, avatar quadrato, icone dei gruppi attivi, `tokens.json`, `tokens.css`, `LEGGIMI.txt`;
  - `out/fonts/`: Outfit, Albert Sans e Roboto Mono **self-hosted** dai pacchetti `@fontsource-variable/*` (devDependencies), niente Google Fonts CDN (GDPR); `out/assets/tokens.css` generato dai token.
- Lo ZIP è scritto da `src/zip.js` (~120 righe, nessuna dipendenza: deflate di `node:zlib` o store, CRC32, data del commit = byte riproducibili). Niente `marked`: i testi sono dati strutturati, non Markdown libero.
- `npm run gallery` resta come alias di `npm run site`.

## Conseguenze

**Positive**
- Regole e materiali pubblici, versionati e revisionati con PR; un link unico per partner e soci.
- I valori vivono in un solo posto (token) e la pagina li legge: swatch, CSS e kit non possono divergere. Un test verifica che i colori con nome corrispondano all'OKLCH di DESIGN.md.
- Nessuna richiesta esterna a runtime, nessuna nuova dipendenza di produzione.

**Negative / trade-off**
- Finché il sito non punta a questo repo, `DESIGN.md` del sito e il brand possono divergere: va riallineato a mano (domanda aperta 13).
- Le indicazioni nuove (area di rispetto, dimensione minima, co-branding) sono una **proposta** da confermare.
- Nelle anteprime di PR il kit contiene solo le icone rigenerate da quella PR; quello pubblicato da `main` le contiene tutte.

## Alternative considerate

- **Leggere `DESIGN.md` dal repo del sito in build**: impossibile senza credenziali (repo privato) e lega il brand a un branch non unito.
- **Copiare `DESIGN.md` intero come Markdown + `marked`**: più fedele ma porta dentro contenuto Blade e una dipendenza; difficile da validare e da riusare nel kit.
- **Zip con la CLI `zip` in CI**: un passaggio in più, comportamento diverso in locale.
- **Font dal CDN di Google Fonts**: più semplice ma trasferisce l'IP dei visitatori a terzi.

## Fonti

- `salento-dev/website` `DESIGN.md` @ `fb3aab5` (privato), `PRODUCT.md` § Brand Commitments, `config/community.php`, `resources/views/components/ui/logo.blade.php`
- [Design Tokens Format Module — Composite types (typography)](https://www.designtokens.org/tr/drafts/format/#composite-design-token)
- [Fontsource](https://fontsource.org/) · [SIL Open Font License 1.1](https://openfontlicense.org/)
- [APPNOTE.TXT — .ZIP File Format Specification](https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT)
