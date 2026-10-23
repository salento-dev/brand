# ADR-0008 · Un accento per gruppo (e pietra per i temporanei)

- **Stato:** Accettata
- **Data:** 2026-10-23
- **Modifica:** ADR-0003 (sostituisce le varianti `group.permanent` / `group.temporary`)

## Contesto

Con ADR-0003 tutti i gruppi permanenti avevano lo stesso accento (cyan-500) e i temporanei la pietra. Nella lista chat le icone permanenti risultavano indistinguibili. I prototipi v4/v5 (ADR-0007) hanno confrontato "mono" (tutto cyan) e "colors" (un accento per gruppo): è stata approvata la variante colors. Il soggetto flat usa tre toni: accento, accento scuro per l'ombra e mist-50.

## Decisione

- Nei token, `group.accents.<nome>` definisce gli **accenti ammessi**, ciascuno con `accent` e `accent-dark`:
  `cyan` (400/700), `violet` (400/700), `fuchsia` (400/700), `emerald` (400/700), `lime` (**500**/700 — il 400 è troppo acido).
  Le primitive mancanti (`fuchsia`, `emerald`, `lime`, scale complete) sono convertite da OKLCH di `tailwindcss/theme.css` come le altre.
- Il YAML dei gruppi **permanenti** ha `accent` obbligatorio (enum dagli accenti nei token); per i **temporanei** è **vietato** (errore esplicito: usano sempre la pietra).
- I temporanei usano `group.temporary` = pietra `#e2b45a` + `pietra-dark` `#976403`, calcolata con `darkShade` (OKLCH L −25, C ×0.95, H −8°) perché la pietra non ha una scala; un test verifica che il valore nei token corrisponda al calcolo.
- `group.icon.bg` = mist-900 (sfondo delle icone: nella lista chat di WhatsApp, quasi nera, stacca meglio del mist-950) e `group.icon.highlight` = mist-50.
- `npm run validate` verifica per ogni accento e per la pietra: accento/sfondo ≥ 4.5:1, accento scuro/sfondo ≥ 2:1, accento/accento scuro ≥ 2:1. **Avvisa** (senza fallire) se due permanenti attivi condividono l'accento.

## Conseguenze

**Positive**
- I gruppi si riconoscono dal colore prima ancora che dal soggetto.
- Palette chiusa e verificata: nessun colore arbitrario nel YAML.

**Negative / trade-off**
- Cinque accenti per cinque permanenti: al sesto gruppo serve un nuovo accento (token + `npm run schema`) o si accetta un doppione (avviso).
- Ci si allontana dal "solo cyan + violet" del sito: gli accenti sono comunque colori Tailwind della stessa palette.

## Alternative considerate

- **Accento unico (mono)**: più sobrio ma icone indistinguibili (v4/v5 "mono").
- **Colore libero (hex) nel YAML**: flessibile ma senza garanzie di contrasto e coerenza.
- **Accento facoltativo con default**: errori silenziosi (gruppi tutti cyan senza accorgersene).
- **Accento ignorato per i temporanei** invece che vietato: meno errori bloccanti, ma il YAML direbbe una cosa e l'icona un'altra.

## Fonti

- [Tailwind CSS v4 — palette](https://tailwindcss.com/docs/colors)
- [WCAG 2.2 — 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [Token e palette](../01_design_system/01_token.md)
