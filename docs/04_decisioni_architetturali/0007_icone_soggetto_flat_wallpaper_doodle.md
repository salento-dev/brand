# ADR-0007 · Icone gruppi: soggetto flat + wallpaper doodle

- **Stato:** Accettata
- **Data:** 2026-10-23
- **Sostituisce:** ADR-0004

## Contesto

Le icone dei gruppi devono distinguersi a colpo d'occhio nella lista chat di WhatsApp, dove sono cerchi di ~48pt (120px su schermo 3×), su tema scuro, accanto al nome del gruppo. La prima pipeline (ADR-0004) usava un simbolo (Heroicon o illustrazione) dentro un anello con staffe "mirino", tutte con lo stesso accento cyan. Il design è stato iterato con prototipi confrontati sullo screenshot reale della lista chat:

| Versione | Idea | Esito |
|----------|------|-------|
| v1 | simbolo Heroicon/illustrazione + anello + barre del logo, accento unico | **scartata**: icone tutte uguali, simbolo sottile e piccolo a 48px, anello e staffe = rumore |
| v2 | logo + nome del gruppo sull'icona, pattern di doodle | **scartata**: il nome è illeggibile a 120px e duplica quello che WhatsApp mostra accanto |
| v3 | soggetto centrale disegnato "a schizzo" come i doodle | **scartata**: il soggetto si confonde con lo sfondo, poco leggibile in piccolo |
| v4 | soggetto **flat** (forme piene, 3 toni) con logo stampato sopra; wallpaper a schizzo con zona libera attorno | approvata nella direzione |
| v5 | come v4, wallpaper su **tutta** l'icona (anche dietro al soggetto), un **accento per gruppo** | **approvata** (variante "colors") |

Integrandola si sono applicati tre ritocchi: manico della tazza ridisegnato (a D, tratto e raggi coerenti), Mercatino senza merce sul banco (illeggibile a 120px), soggetti più grandi (dal ~62% al ~69% del diametro).

## Decisione

- Icona 640×640, sfondo mist-900, **nessun testo**.
- **Wallpaper**: doodle a schizzo (`renderSketch`: tratto a pennello con ondulazione e spessore variabile) da `assets/doodles/`, 64–100px, tratto 4.5 (riempitivi 3.5), opacità 0.5, in accento, sparsi a caso su tutta l'icona senza sovrapposizioni, **seed = slug** (riproducibile). Set = doodle del gruppo (YAML, ×3) + set comune + riempitivi (`assets/doodles/sets.yaml`).
- **Soggetto**: un'illustrazione flat per gruppo, **file SVG** in `assets/subjects/<nome>.svg` (viewBox 160) disegnata con **4 colori segnaposto** (`#ff00ff` accento, `#800080` accento scuro, `#ffffff` luce, `#000000` sfondo) che il generatore sostituisce; il logo a barre è disegnato nel file in colore sfondo. Scala unica ×3.25; tutto entro il cerchio sicuro r 280px.
- Lint dei soggetti in `validate`: viewBox `0 0 160 160`, solo segnaposto, niente raster/testo/script/stili/riferimenti esterni, max 30 KB, verifica del cerchio sicuro sul rendering. Lint dei doodle: viewBox quadrato, solo `currentColor`, capi tondi, niente archi.
- Il campo `symbol` (Heroicon/illustrazione) è sostituito da `subject` (+ `doodles` opzionale); il badge con le date dei temporanei è eliminato (l'accento pietra basta a segnalarli).
- `subject` e `doodles` **non** sono enum nello JSON Schema (a differenza delle Heroicons in ADR-0002): l'esistenza dei file è verificata da `validate`, così aggiungere un soggetto o un doodle non richiede di rigenerare lo schema. `accent` invece è un enum (gli accenti cambiano solo con i token).

## Conseguenze

**Positive**
- Icone riconoscibili a 48px: soggetto grande e pieno, colore diverso per gruppo, trama che le lega come famiglia.
- Un soggetto o un doodle si aggiunge **senza scrivere codice**: un file SVG + una riga di YAML; il lint spiega gli errori.
- Output deterministico, testabile (stesso input → stessi byte).

**Negative / trade-off**
- Disegnare un soggetto richiede più mestiere di scegliere un'icona da un set; le regole (stacchi, ombra, logo) vanno imparate.
- Si lavora in falso colore (magenta), come prima con il cyan segnaposto.
- Cambiare l'elenco dei doodle o lo slug ridistribuisce il wallpaper.

## Alternative considerate

- **Soggetti come funzioni JS** (come nel prototipo): più compatti, ma ogni nuovo soggetto richiede codice e revisione di un manutentore.
- **Heroicons / set di icone**: coerenti ma tutti uguali e sottili a 48px.
- **Un marcatore per il logo** (es. `<rect data-logo>` sostituito dal generatore): più comodo da posizionare, ma un concetto in più da spiegare; il logo incollato nel file si vede anche aprendo l'SVG nel browser.

## Fonti

- Prototipi v1–v5 e simulazioni su screenshot reale (non versionati: contenevano dati dei membri); anteprima nella lista chat generata dalla galleria: [`docs/02_icone_gruppi/img/simulazione-whatsapp.png`](../02_icone_gruppi/img/simulazione-whatsapp.png)
- [Icona di gruppo](../02_icone_gruppi/01_formato_icona.md) · [Soggetti](../02_icone_gruppi/02_soggetti.md) · [Doodle](../02_icone_gruppi/03_doodle.md)
