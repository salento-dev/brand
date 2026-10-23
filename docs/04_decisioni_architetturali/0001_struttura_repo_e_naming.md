# ADR-0001 · Struttura del repo, dati separati da formati, naming

- **Stato:** Accettata (la cartella `components/` è rimossa da ADR-0009)
- **Data:** 2026-10-23

## Contesto

La community vive soprattutto in una WhatsApp Community con molti gruppi. Le icone oggi sono fatte a mano, con stili diversi. Serve un "design system as code": chiunque deve poter aggiungere un gruppo con una PR, senza strumenti di grafica. Nella fase 2 arriveranno le cover degli eventi: aggiungerle non deve richiedere di riscrivere quanto fatto per le icone.

## Decisione

Struttura a strati, dal più stabile al più variabile:

| Cartella | Contenuto | Chi la tocca |
|----------|-----------|--------------|
| `tokens/` | Token di design (DTCG) | core team |
| `assets/` | Logo e illustrazioni SVG | core team + illustratori |
| `components/` | Primitive grafiche condivise (`Frame`, `Symbol`, `Logo`, `Badge`) | core team |
| `formats/` | Formati dichiarativi (`id`, misure, area sicura, collezione, `layout`), **scoperti automaticamente** | core team |
| `content/<collezione>/` | Dati YAML, uno per file | chiunque |
| `src/`, `scripts/` | Libreria e comandi npm | manutentori |

Regole di naming:

- **slug = nome file** in kebab-case ASCII (`content/groups/ai-corner.yaml`); non esiste un campo `slug` da tenere allineato.
- Chiavi YAML **in inglese**, contenuti **in italiano**; documentazione in italiano con cartelle numerate come nel sito.
- Un formato dichiara la sua `collection`: aggiungere le cover eventi significa aggiungere `content/events/`, uno schema e `formats/event-cover.js`, senza toccare il formato `icon`.

## Conseguenze

**Positive**
- Il contributo tipico (nuovo gruppo) tocca un solo file YAML.
- CODEOWNERS può proteggere gli strati stabili.
- Nuovi formati si aggiungono per estensione.

**Negative / trade-off**
- Lo slug non si può cambiare senza rinominare il file (e quindi l'URL dell'immagine).
- Qualche indirezione in più rispetto a uno script unico.

## Alternative considerate

- **Uno script per immagine**: semplice all'inizio, ma duplica stile e logica a ogni formato.
- **Figma + export manuale**: nessun versionamento dei dati, revisione impossibile in PR.
- **Campo `slug` nel YAML**: rischio di disallineamento con il nome file.

## Fonti

- [Satori](https://github.com/vercel/satori)
- Convenzioni del repo `website` (`CONTRIBUTING.md`, `docs/07_decisioni_architetturali/`).
