# 02 · Aggiornare le regole del brand

Le regole del brand si cambiano **in questo repo** con una PR (ADR-0011). Le modifiche a `tokens/` e `content/brand/` richiedono la revisione del core team (CODEOWNERS).

## Cosa modificare

| Voglio cambiare… | File | Note |
|------------------|------|------|
| un testo, una Named Rule, un do/don't, le indicazioni per i partner | `content/brand/brand.yaml` | schema in `src/brand.js`; formattazione: `**grassetto**`, `` `codice` ``, `[link](https://…)` |
| un colore, il ruolo o il nome di un colore | `tokens/tokens.json` (`color.*` per il valore, `brand.color.*` per nome/ruolo/categoria) | primitive con l'OKLCH in `$extensions`: un test verifica hex = OKLCH |
| la gerarchia tipografica, raggi, spaziature | `tokens/tokens.json` (`typography.*`, `radius.*`, `spacing.*`) | la pagina li legge da `tokens.css` |
| impaginazione o stile della pagina | `src/site/book.js`, `src/site/brand.css` | solo variabili dei token nel CSS, niente colori scritti a mano |
| contenuto del kit o del LEGGIMI | `src/kit.js`, `src/logo.js` | |
| il logo (nuova versione del media kit) | `npm run logo:import -- <zip estratto>` → `assets/logo/official/` | mai modificare i file a mano; aggiorna `logo.provenance` in `brand.yaml` e, se serve, `assets/logo/official/README.md`. La PR mostra i checksum cambiati |
| descrizioni ufficiali | `brand.yaml` → `descriptions` | nome sempre «Salento.dev» (lo schema rifiuta «Salento.Dev») |

Una nuova regola ha sempre un `scope` (`interfaccia`, `community`, `tutti`, vedi ADR-0012) e una `section` (`colori`, `tipografia`, `forme`). Attivare un colore di riserva o un nuovo accento richiede un ADR.

## Controllare

```bash
npm run validate          # schema di brand.yaml, logo pack (72 file, checksum, SVG sicuri), token, contrasto, gruppi
npm test                  # colori con nome = DESIGN.md, zip valido, nessuna risorsa esterna
npm run generate && npm run site
open out/index.html       # brand book; out/icone/index.html per la galleria
```

Nella PR il commento automatico mostra le icone; la pagina completa è nell'artifact `gallery` della build (apri `index.html`).

## Dopo il merge

Il deploy pubblica la pagina. Se la regola tocca anche il sito, apri una issue nel repo `website` per riallinearlo (finché il sito non legge i token da qui: domanda aperta 13).
