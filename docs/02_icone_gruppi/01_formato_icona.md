# 01 · Icona di gruppo

> Implementazione: [`formats/icon.js`](../../formats/icon.js). Output: `out/groups/<slug>.png` (640×640) e `out/groups/96/<slug>.png`. Decisione: [ADR-0007](../04_decisioni_architetturali/0007_icone_soggetto_flat_wallpaper_doodle.md).

![Simulazione nella lista chat di WhatsApp](img/simulazione-whatsapp.png)

*Le icone generate nella lista chat di WhatsApp (avatar 120px su schermo 3×; anteprime dei messaggi oscurate).*

## Anatomia

```
┌──────────────────────────────┐  640×640, WhatsApp ritaglia il cerchio inscritto (r 320)
│  ✎   ✎    ✎   ✦   ✎    ✎     │  1. sfondo mist-900 pieno
│ ✎    ╭────────────╮    ✎  ·  │  2. wallpaper: doodle a schizzo in accento, opacità 0.5,
│   ✎  │  SOGGETTO  │  ✎       │     sparsi su TUTTA l'icona (anche dietro al soggetto)
│ ·    │  flat con  │     ✎    │  3. soggetto flat al centro, ~69% del diametro,
│   ✎  │  logo      │  ✎    ✦  │     tutto entro il cerchio sicuro (r 280)
│ ✎    ╰────────────╯   ✎      │
│   ✎    ✦    ✎    ✎     ✎     │  nessun testo
└──────────────────────────────┘
```

| Livello | Regola |
|---------|--------|
| Sfondo | `group.icon.bg` = mist-900 `#161b1d` |
| Wallpaper | doodle 64–100px, tratto 4.5px (riempitivi 30–42px, tratto 3.5), opacità 0.5, rotazione ±20°, distanza minima 26px, mai sovrapposti; posizioni casuali ma **riproducibili** (seed = slug). Set: doodle del gruppo (×3) + set comune + riempitivi ([Doodle](03_doodle.md)) |
| Soggetto | file `assets/subjects/<subject>.svg`, viewBox 160 scalato ×3.25 (ingombro di progetto 136 unità = 69% del diametro), centrato; tutto entro r 280px (≈ 86 unità dal centro 80,80) ([Soggetti](02_soggetti.md)) |
| Logo | le barre del logo sono **stampate sul soggetto** in colore sfondo (tazza, piano del tavolo, petto del robot…) |

## Colori per gruppo

Tre toni + sfondo, tutti dai token ([Token](../01_design_system/01_token.md)):

| Ruolo | Colore |
|-------|--------|
| accento | `-400` della famiglia scelta (lime: 500) — volumi in luce, doodle |
| accento scuro | `-700` — ombra piatta sul lato destro, parti secondarie (sedute, piattino, binari) |
| luce | mist-50 — riflessi, vapore, strisce della tenda, fari |
| sfondo | mist-900 — stacchi tra forme sovrapposte e logo stampato |

| Gruppo | `accent` | Soggetto |
|--------|----------|----------|
| Dev Break | `fuchsia` | `coffee-cup` |
| Tavola Rotonda | `violet` | `round-table` |
| AI Corner | `emerald` | `robot` |
| @include | `cyan` | `code-window` |
| Mercatino | `lime` | `market-stall` |
| temporanei (trasferte, eventi) | sempre **pietra** (campo `accent` vietato) | es. `train` |

Un accento diverso per gruppo rende le icone distinguibili a colpo d'occhio nella lista chat; la pietra segnala subito "gruppo a tempo". `npm run validate` **avvisa** (non blocca) se due permanenti attivi hanno lo stesso accento.

## Nome sull'icona: no

WhatsApp mostra già il nome accanto all'icona; a 48px un testo sarebbe illeggibile e ruberebbe spazio al soggetto. Il `shortName` del YAML serve solo a galleria, testo alternativo e documentazione.

## Da fare / da evitare

| ✅ Da fare | ❌ Da evitare |
|-----------|--------------|
| Un soggetto unico, riconoscibile a 48px | Scene con tanti oggetti piccoli (es. merce sul banco del mercatino) |
| Forme piene, raggi coerenti, ombra piatta a destra | Contorni sottili, sfumature, prospettive complicate |
| Logo stampato sul soggetto, in colore sfondo | Logo separato o testo |
| Doodle legati al tema del gruppo, 4–6 nomi | Elenchi lunghi di doodle o doodle che sembrano il soggetto in piccolo |
| Controllare galleria a 96/48px e la lista chat simulata | Valutare solo il 640 |

## Come verificare

`npm run generate && npm run site`, poi apri `out/icone/index.html`: in alto la **lista chat simulata** (tema scuro) con tutti i gruppi attivi, poi per ogni gruppo il 640 ritagliato a cerchio, le versioni a 96 e 48px e i link di download.
