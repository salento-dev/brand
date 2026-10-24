# ADR-0015 · Licenza: logo, wordmark e nome riservati

- **Stato:** Accettata
- **Data:** 2026-10-24
- **Sostituisce:** la parte sul logo della decisione di licenza in [domande aperte](../open-questions.md) n. 10 e in `LICENSE-ASSETS.md` («asset grafici, logo compreso, CC BY 4.0, marchio escluso»)

## Contesto

La licenza decisa all'avvio del repo metteva sotto CC BY 4.0 tutti gli asset grafici, **logo compreso**, escludendo solo l'uso del marchio per far credere a un'affiliazione. Il media kit ufficiale (ADR-0013) dice invece: «Il logo, il nome e gli asset Salento.Dev sono segni distintivi protetti… Qualsiasi utilizzo è subordinato a preventiva autorizzazione… Il download non comporta cessione di diritti». Le due cose non possono valere insieme sugli stessi file.

## Decisione

- **Logo (tutte le famiglie e le varianti), wordmark e nome «Salento.dev»: tutti i diritti riservati.** Ogni uso richiede l'autorizzazione preventiva (salento.dev@gmail.com) e il rispetto delle linee guida. Testo adottato dal media kit, con il nome scritto «Salento.dev». Riguarda `assets/logo/official/`, `assets/logo.svg`, il logo stampato nei soggetti e nelle icone, l'avatar, `out/kit/logo-pack/`, `salentodev-logo-pack.zip`.
- **Resto invariato**: codice MIT; **altri asset grafici** (soggetti, doodle, icone dei gruppi, token, testi del brand book) CC BY 4.0; font SIL OFL 1.1.
- **Icone dei gruppi**: si possono usare per i gruppi e la comunicazione di Salento.dev; il logo stampato al loro interno resta riservato (vale anche per i soggetti che lo contengono).
- Il testo compare in `LICENSE-ASSETS.md`, nel README del logo pack, nella sezione Logo («Diritti e autorizzazioni») e Partner del brand book, nel `LEGGIMI.txt` del kit e nel README del repo.

## Conseguenze

**Positive**
- Una sola regola, uguale nel media kit e nel repo.
- Soggetti, doodle e token restano riusabili liberamente.

**Negative / trade-off**
- Chi riusa un'icona o un soggetto fuori dalla comunicazione di Salento.dev deve togliere il logo o chiedere l'autorizzazione.
- Il nome scritto nel testo per citare la community (es. «in collaborazione con Salento.dev») ricade formalmente sotto l'autorizzazione: per i partner è parte dell'accordo di co-branding.

## Alternative considerate

- **Lasciare il logo sotto CC BY 4.0 con l'esclusione del marchio**: contraddice il media kit.
- **Riservare tutti gli asset grafici**: blocca il riuso di doodle e soggetti, che è utile alla community.

## Fonti

- Media kit: https://salento.dev/sd-media-kit-2026/ (sezione Copyright)
- [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode.it) · [ADR-0013](0013_logo_ufficiale_dal_media_kit.md)
