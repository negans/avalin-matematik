---
name: dod-check
description: Kör Definition of Done mot en modul i Avalins Matematikverkstad och rapportera vad som saknas. Använd när Mats vill grinda en modul innan commit ("dod-check geometri M9", "är skala klar?", "kolla att modulen håller"). Kör testerna och granskar logik + HTML mot checklistan, men committar inget.
---

# DoD-check — kvalitetsgrind för en modul

Verifiera en modul mot Definition of Done (CLAUDE.md). Rapportera PASS/SAKNAS per punkt.
Fixa inget och committa inget utan att Mats ber om det — det här är en grind, inte en byggskill.
Ange vilken modul/fil som gäller; be Mats precisera om oklart.

## Kör i tur och ordning
1. **Tester grönt** — kör `node tests/test.js` OCH `node tests/regression.js`. Notera PASS/FAIL. Rött = grinden faller direkt. (regression.js fångar trasiga filreferenser, saknad testtäckning och saknad Miso-container.)
2. **Testtäckning** — finns ett testblock för modulens logik? Kolla per generator + nivå:
   exakt facit-formel, 3 distinkta distraktorer, facit ej bland dem, positiva heltal, nivåinvarianter,
   samt WE/WHY-blocket (3 steg, sista bär facit; whyQuestion 2 distinkta distraktorer).
3. **Ren logik** — `logic/<modul>.js`: UMD-wrapper, inga DOM-anrop, `genMxTask(level)` med `level ∈ {0,1,2}`,
   `workedSteps`, `whyQuestion` exporterade. 3 nivåer konkret → abstrakt.
4. **Distraktor-doktrin** — varje distraktorkandidat kodar en NAMNGIVEN missuppfattning (kommenterad).
   Inga slumpnärmissar utan avsikt. Inga ogiltiga värden (≤0 / icke-heltal där det inte är meningsfullt).
5. **HTML** (Grep i modulsidan):
   - Instruktion = en kort mening; ett krav synligt i taget (uppgiftsfråga i `mXLive`, göms vid exempel)
   - Worked example per nivå: `maybeExample`, `weSeen/weMark`, bild ritas i exempelrutan (BILD FÖRST)
   - "Varför?": `maybeWhy` gate (`level !== 2` → return, annars `%3`)
   - Feedback ikon + text, aldrig bara färg
   - `answered`-flagga blockerar dubbelklick; `hadError` styr streak; avancera efter 3 rena rätt
   - Nivå-badge synlig; `Next`-knapp pulse + `maybeExample`
   - **Miso-container omedelbart före `</script>`**
   - Cross-page konsistent (knappar/feedback/färgbetydelser som övriga sidor)
6. **Ockulär verifiering** — kan bara göras i Brave via browser-verktyget (Fable-pass). Om inte kört:
   markera som ÖPPEN och påminn Mats att växla modell och köra den, checklistan i CLAUDE.md.
7. **/code-review high** — om inte kört, markera som ÖPPEN.

## Rapportformat
En rad per DoD-punkt: `✅ PASS` / `❌ SAKNAS: <vad + var>` / `⏳ ÖPPEN (kräver Mats/Fable-pass)`.
Avsluta med en kort mening: klar för commit, eller vad som återstår.
