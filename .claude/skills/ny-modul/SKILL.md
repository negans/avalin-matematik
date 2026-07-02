---
name: ny-modul
description: Bygg en ny modul eller modulsida i Avalins Matematikverkstad enligt mönster v2 och Definition of Done. Använd när Mats ber om en ny modul (t.ex. "bygg grafer för proportionella samband", "lägg till 3D-former", en ny Mx i en befintlig fil, eller en helt ny .html-sida). Följer receptet från skala.html + proportionalitet.html.
---

# Bygg en ny modul (mönster v2 + DoD)

Receptet destillerat ur de två renaste facit-filerna: `logic/skala.js`, `logic/proportionalitet.js`,
deras testblock i `tests/test.js`, och wiringen i `proportionalitet.html`. **Läs de filerna först**
när du bygger — de är sanningen; det här är checklistan som håller ordningen och inget glöms.

Grundregler (från CLAUDE.md): ett steg i taget, konkret → abstrakt, isolera färdigheten,
färg aldrig enda signalen, E är golvet. KVALITET FÖRE TEMPO. Bygg bara det Mats bett om — inga extra features.

## Ordning (bryt inte)
1. **Logik** i `logic/<modul>.js` (ren, testbar, inga DOM-anrop)
2. **Tester** i `tests/test.js` — i SAMMA commit som logiken
3. `node tests/test.js` → måste vara grönt innan HTML
4. **HTML** — wire in logiken enligt mönster v2
5. `node tests/test.js` && `node tests/regression.js` (båda gröna)
6. **Ockulär verifiering** (Fable-pass i Brave — flagga för Mats att växla modell)
7. `/code-review high`
8. Bocka av **Definition of Done**
9. Committa/pusha först efter Mats godkännande

## 1. Logiklagret — kontrakt
UMD-wrapper överst (kopiera exakt från skala.js/proportionalitet.js — hämtar `shared.js` → `rnd`).

Per modul en generator `genMxTask(level)` där `level ∈ {0,1,2}` (konkret → abstrakt). Returnera ett objekt:
- Numeriskt svar: `{ mod, ...data, correct, distractors: pickDistractors(correct, cand, 3) }`
- Kategorisvar (flerval av fasta ord): `{ mode/type, ...data, correct, choices: [...] }`

Kopiera `pickDistractors(correct, candidates, n)` — den hoppar över facit, dubbletter, och ogiltiga
värden (≤0 eller icke-heltal). **Distraktor-doktrinen:** varje kandidat kodar en NAMNGIVEN missuppfattning,
kommenterad i koden. Lägg diagnostiska kandidater FÖRST, generiska närvärden (`correct±1`, `correct+n`) sist
som garanterad reserv så listan alltid ger 3.
Vanliga missuppfattningar: fel räknesätt (add i st.f. mult), glömt steg, off-by-one, omvänd riktning,
tappad term, delberäkning.

Håll räkningen "snäll": tvinga heltalssvar (välj tal så division går jämnt — se `reduceTask`/M2 i facit),
inga negativa/noll där det inte är meningsfullt.

Mönster v2 i logiken:
- `workedSteps(mod, t)` → **exakt 3 stegrader** (strängar), sista raden bär facit. Konkret → symbol.
- `whyQuestion(mod)` → `{ prompt, correct, distractors: [2 st] }`. En korrekt resonemangsrad + 2
  distraktorer enligt doktrinen. Flerval, aldrig textinput.

Exportera allt längst ner (`return { pickDistractors, genM1Task, ..., workedSteps, whyQuestion }`).

## 2. Testlagret — obligatoriskt, samma commit
Lägg ett block `/* ═══ <modul> ═══ */`, `require`, och per generator + nivå (`[0,1,2].forEach`) via
`forEachRun(gen, lvl, RUNS, t => {...})`. Assertions per nivå:
- Exakt facit-formel (`t.correct === t.n * t.each` osv.)
- Heltal > 0 (där numeriskt)
- `t.distractors.length === 3`
- `distinct([t.correct, ...t.distractors])`
- `!t.distractors.includes(t.correct)`
- Alla distraktorer positiva heltal
- Nivåspecifika invarianter (t.ex. "nivå 0: bara förstoring", "total delbart med n")
- Om kategorival: alla kategorier nåbara (loop 2000 varv, samla `.correct` i ett Set)

Eget block för mönster v2: `workedSteps` ger 3 ifyllda steg, sista bär facit; `whyQuestion` ger 2 distinkta
distraktorer, facit ej bland dem. (Se WE/WHY-blocken i facit.)

## 3. HTML-lagret — wire in mönster v2
Script-includes i `<head>`: `storage.js`, `ui.js`, `logic/shared.js`, `logic/<modul>.js`.

Kopiera mönster v2-limmet från `proportionalitet.html` (rad ~181–241) och byt bara storage-nyckel
(`propWeSeen` → egen per fil):
- `GENS`, `niceExample`, `renderExampleVisual` (rita modulens RIKTIGA figur i exempelrutan — BILD FÖRST)
- `weKey/weSeen/weMark` (persistens av "har sett exemplet", per modul+nivå)
- `showExample/closeExample/maybeExample/wireExample`
- `whyCounts/maybeWhy/showWhy/hideWhy` — `maybeWhy` returnerar om `level !== 2`, annars var tredje (`%3`)

Per modul: state (`streak, task, answered, hadError, level, levelStreak`) → `drawMx` (SVG) → `buildMx`
(ny uppgift, ren state, `buildChoices`, nivå-badge, `hideWhy`) → `mxCheck` (answered-flagga blockerar
dubbelklick; rätt utan fel → `streak++`, `recordCorrect()`; avancera nivå efter 3 rena rätt; anropa
`maybeWhy` efter rätt; fel → `hadError=true`, diagnostisk feedback med ikon+text). Wiring sist:
`Next`-knapp (pulse + `buildMx` + `maybeExample`), `wireExample`, initial `buildMx()` + `maybeExample(x, level)`.

Feedback ALLTID ikon + text (aldrig bara färg). Instruktion = en mening. Ett krav synligt i taget
(uppgiftsspecifik fråga med tal ligger i `mXLive` så den göms när exemplet visas).

**Miso-container omedelbart före `</script>`** (hård regel).

## 4. Definition of Done (bocka av alla)
- [ ] Ren logik i `logic/<modul>.js`, inga DOM-anrop, UMD (browser + Node)
- [ ] 3 nivåer, konkret → abstrakt
- [ ] Distraktorer enligt doktrinen (namngivna missuppfattningar, kommenterade)
- [ ] Tester: exakta värden + invarianter per nivå (facit korrekt, 3 distinkta, facit ej bland distraktorer, inga ogiltiga värden)
- [ ] Instruktion = en kort mening
- [ ] Worked example per nivå (bild först)
- [ ] Färg aldrig enda signalen (ikon/text också)
- [ ] Miso-container omedelbart före `</script>`
- [ ] Cross-page consistent UX (knappar, feedback, färgbetydelser identiska)
- [ ] `node tests/test.js` grönt
- [ ] `node tests/regression.js` grönt
- [ ] Ockulär verifiering i Brave (checklistan i CLAUDE.md > TESTNING & VERIFIERING)
- [ ] `/code-review high` utförd

Efter grön DoD: uppdatera **STATUS**-raden i CLAUDE.md (flytta steget till klart), lägg detaljerna i
**HISTORIK.md** — inte i CLAUDE.md. Föreslå commit/push till Mats.
