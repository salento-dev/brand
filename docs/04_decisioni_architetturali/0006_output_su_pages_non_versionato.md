# ADR-0006 · Immagini pubblicate su GitHub Pages, non versionate

- **Stato:** Accettata
- **Data:** 2026-10-23

## Contesto

Le immagini sono un **derivato** di dati, token e componenti. Versionarle nel repo gonfia la storia git con binari e crea conflitti a ogni modifica di stile (che rigenera tutto). Chi amministra i gruppi deve però poterle scaricare facilmente.

## Decisione

- `out/` è in `.gitignore`.
- A ogni push su `main` (`deploy.yml`) si rigenera **tutto** (anche gli archiviati) più la galleria `out/index.html`, pubblicata su **GitHub Pages** con `actions/upload-pages-artifact` + `actions/deploy-pages`.
- L'URL stabile di un'icona è `<pages>/groups/<slug>.png`.

## Conseguenze

**Positive**
- Repo leggero, nessun conflitto sui binari.
- Una sola fonte (il codice): le immagini pubblicate sono sempre coerenti con `main`.

**Negative / trade-off**
- Per avere i PNG in locale serve `npm install` + `npm run generate`.
- Nessuno storico delle immagini precedenti (ricostruibile da un commit).

## Alternative considerate

- **PNG committati** (come gli asset versionati del sito, ADR-0006 di `website`): comodi da scaricare ma pesanti e conflittuali.
- **Release con allegati**: più passaggi manuali.

## Fonti

- [GitHub Pages con workflow personalizzati](https://docs.github.com/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
