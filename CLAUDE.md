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

The application consists of multiple self-contained static HTML files (`index.html`, `brak.html`, `klockan.html`, and future pages). Each page is standalone:
- Inline CSS in `<style>` tags
- Any future JavaScript should be added inline in `<script>` tags, or as additional `.js` files referenced from `index.html`
- No frameworks, no bundler, no backend

The UI language is Swedish (`lang="sv"`). Keep all user-facing text in Swedish.

## Technical Standards

1. **Input: digits only** — All answer input fields must block letters and special characters via a `keydown` handler. Allow: `0–9`, `Backspace`, `Delete`, `Tab`, `ArrowLeft`, `ArrowRight`. Block everything else with `e.preventDefault()`.

2. **Input: maxlength** — Every answer input must have a `maxlength` attribute set to the realistic maximum number of digits for that exercise. Also enforce the same limit in the `input` event handler (`this.value.slice(0, N)`). Determine the limit from the actual answer range, not a round number.

3. **Pulse on "Ny uppgift"** — When the answer is correct, add class `btn-pulse` to the "Ny uppgift" button as a gentle visual cue. Remove it on: wrong answer, new task load (in the build/reset function), and button click (via the new-task function which triggers the reset).

4. **Clean state on new task** — The build/reset function for each module must fully clear all state before rendering the new task: input values, `ok`/`err` classes, feedback text, explanation boxes, step lines, and any pending `setTimeout` callbacks (store IDs, call `clearTimeout` on all of them at reset time). No state must bleed from one task to the next.

5. **Cross-page consistency** — UX patterns (input guards, pulse animation, state clearing) must be applied uniformly across all pages (`brak.html`, `klockan.html`, and any future pages). When a standard is established or changed, update all existing pages.
