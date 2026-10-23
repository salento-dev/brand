# 01 · Aggiungere un gruppo

Vedi la versione breve in [CONTRIBUTING.md](../../CONTRIBUTING.md#aggiungi-un-gruppo-in-5-passi).

## Campi

| Campo | Obbligatorio | Note |
|-------|--------------|------|
| `name` | sì | max 32 caratteri, come su WhatsApp |
| `shortName` | sì | max 14 caratteri: galleria, testo alternativo, documentazione (non è disegnato) |
| `kind` | sì | `permanent` o `temporary` |
| `subject` | sì | nome di un file in `assets/subjects/` (es. `coffee-cup`), vedi [Soggetti](../02_icone_gruppi/02_soggetti.md) |
| `accent` | **solo `permanent`** (obbligatorio); vietato per `temporary` | `cyan`, `violet`, `fuchsia`, `emerald`, `lime` — i temporanei sono sempre pietra |
| `doodles` | no | doodle del wallpaper tipici del gruppo, nomi di file in `assets/doodles/` (max 10), vedi [Doodle](../02_icone_gruppi/03_doodle.md) |
| `description` | no | max 280 caratteri |
| `starts`, `ends` | solo `temporary` (obbligatori; vietati per `permanent`) | `AAAA-MM-GG`, `ends >= starts` |
| `status` | no | `active` (default) o `archived` |
| `example` | no | `true` per i file dimostrativi |

Vietati: link di invito WhatsApp, numeri di telefono, nomi di persone. Qualunque chiave non prevista fa fallire la validazione.

Se scegli un accento già usato da un altro gruppo permanente attivo, `npm run validate` mostra un **avviso**: si può fare, ma nella lista chat i due gruppi si distinguono meno.

## Esempio permanente

```yaml
# yaml-language-server: $schema=../../schema/group.schema.json
name: Off topic – Dev Break
shortName: Dev Break
kind: permanent
subject: coffee-cup
accent: fuchsia
doodles: [pizza, gamepad, headphones, pasticciotto, chat-bubbles, tambourine]
description: Chiacchiere, meme e pause caffè lontano dal codice.
```

## Esempio temporaneo

```yaml
# yaml-language-server: $schema=../../schema/group.schema.json
name: Trasferta Codemotion Milano
shortName: Codemotion
kind: temporary
subject: train
doodles: [suitcase, ticket, map-pin, plane, coffee]
starts: 2026-11-18
ends: 2026-11-19
```

## Archiviare

A evento concluso: archivia il gruppo su WhatsApp e imposta `status: archived`. Ogni lunedì il workflow **Gruppi scaduti** apre/aggiorna la issue *"Gruppi temporanei da archiviare"* con l'elenco (`npm run check-expired` in locale).
