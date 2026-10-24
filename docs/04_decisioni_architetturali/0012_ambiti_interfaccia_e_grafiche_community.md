# ADR-0012 · Ambiti delle regole: interfaccia e grafiche della community

- **Stato:** Accettata
- **Data:** 2026-10-24
- **Collegata a:** ADR-0008 (accento per gruppo), ADR-0011 (import da DESIGN.md)

## Contesto

Le regole importate dal sito (ADR-0011) dicono:

- **One Signal Rule**: il cyan è l'unico accento attivo;
- **Reserve Rule**: violet e fuchsia non si attivano senza una decisione esplicita;
- **Brand-Borrow Rule**: verde solo per WhatsApp e lo stato live, ambra solo per i WIP.

Le icone dei gruppi WhatsApp (ADR-0008) usano invece un accento per gruppo (fuchsia, violet, cyan, emerald, lime) e la **pietra** `#E2B45A` per i temporanei. Lette insieme, le due cose sembrano in conflitto.

## Decisione

Ogni regola ha un **ambito** (`scope` in `content/brand/brand.yaml`):

| Ambito | Cosa copre | Palette |
|--------|-----------|---------|
| `interfaccia` | sito, brand book, ogni superficie con testo e layout (slide, banner, locandine) | neutri + Signal Cyan; riserva e prestiti funzionali solo come da regole |
| `community` | grafiche generate da questo repo per i canali della community: oggi le icone dei gruppi | neutri (sfondo mist-900, luce mist-50) + accenti `group.accents` + pietra |
| `tutti` | logo, nome, tipografia, tema scuro | — |

- **ADR-0008 è la decisione esplicita** richiesta dalla Reserve Rule: violet e fuchsia (e emerald, lime) sono attivi **solo dentro le icone dei gruppi**, mai come accenti dell'interfaccia.
- La **pietra** è un colore della community, distinto dall'ambra WIP: non si usa nell'interfaccia al posto dell'ambra e l'ambra non entra nelle icone (The Pietra Rule).
- WhatsApp Green e WIP Amber restano prestiti dell'interfaccia; non entrano nelle grafiche della community.
- Nuove grafiche della community (es. cover eventi) dichiarano nel proprio formato quale palette usano; un nuovo accento passa sempre da token, schema e controllo di contrasto.
- Il brand book mostra la tabella "Due ambiti, una palette" nella sezione Colori e un'etichetta di ambito su ogni regola.

## Conseguenze

**Positive**
- Nessuna eccezione implicita: chi legge una regola sa dove vale.
- Le icone restano distinguibili per colore senza indebolire la sobrietà dell'interfaccia.

**Negative / trade-off**
- Un concetto in più (l'ambito) da spiegare; le grafiche ibride (es. una locandina con icone dei gruppi) seguono l'interfaccia per testo e layout e la community solo dentro le icone.

## Alternative considerate

- **Icone solo cyan** per rispettare la One Signal Rule: scartata in ADR-0008 (icone indistinguibili).
- **Abolire la Reserve Rule**: toglierebbe al sito una protezione utile contro accenti decorativi.
- **Pietra = WIP Amber**: due significati diversi (gruppo a tempo vs evento in pianificazione) con lo stesso colore.

## Fonti

- [ADR-0008](0008_accento_per_gruppo.md) · [ADR-0011](0011_repo_brand_fonte_di_verita.md)
- `content/brand/brand.yaml` (`scopes`, `rules`)
