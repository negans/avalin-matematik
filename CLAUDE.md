# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A single-page interactive math tool for Avalin, written in Swedish. Currently a static HTML file with no build system or dependencies.

## Avalins profil
- Ålder: 11 år, åk 5, Annabergsskolan Malmö
- Logopedutredning mars 2026: begränsat verbalt arbetsminne – inte bristande grundförmåga
- NPF/autismutredning pågår vid BUP Malmö
- Lär sig bäst: konkret → visuellt → abstraktion, aldrig tvärtom
- Styrka: resonerar steg för steg (se 9:ans tabell via fingertrick)
- Arbetsminnet får inte överbelastas – ett moment i taget, skriv ned mellanresultat
- Intressen: katter, rita, måla, pyssla

## Modulprioritet
1. Klockan (analog)
2. Taluppfattning och tallinjen
3. Multiplikation och division
4. Bråk och decimaltal
5. Geometri och mätning
6. Problemlösning med text

## Pedagogiska regler
- Svenska i UI, engelska i kod och variabelnamn
- Feedback vid fel: uppmuntrande och vägledande, aldrig värderande
- Varje moment introduceras konkret/visuellt innan abstraktion
- Sessioner anpassas efter dagsform – lättare eller svårare innehåll
- Framsteg ska vara synliga för Avalin och pappan

## Development

Open `index.html` directly in a browser — no build step, server, or package manager needed.

## Architecture

The entire application lives in `index.html` as a self-contained static page:
- Inline CSS in `<style>` tags
- Any future JavaScript should be added inline in `<script>` tags, or as additional `.js` files referenced from `index.html`
- No frameworks, no bundler, no backend

The UI language is Swedish (`lang="sv"`). Keep all user-facing text in Swedish.
