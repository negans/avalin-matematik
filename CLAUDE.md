# CLAUDE.md — Avalins Matematikverkstad

## PROJEKTÖVERSIKT
Interaktiv matematikplattform för Avalin (f. 2014, åk 5, NPF/autismutredning pågår).
Live: negans.github.io/avalin-matematik
Repo: github.com/negans/avalin-matematik
Stack: HTML/CSS/JavaScript — inga ramverk.

## AVALINS PROFIL
Begränsat verbalt arbetsminne — inte bristande grundförmåga.
Lärstil: kropp → bild → förståelse → abstraktion.
Visuellt, konkret, steg för steg. Teknikvän, jobbar självständigt.
Intressen: katter, rita, pyssla. Gillar mjuka varma färger med natur och djur.

## ARBETSFLÖDE
- Claude Code CLI: claude --dangerously-skip-permissions i VS Code-terminalen
- PowerShell för git: add → commit → push
- Auto Save aktiverat i VS Code
- npx serve . i separat PowerShell-terminal för lokal testning

## DESIGN-DNA
Färgpalett definieras som CSS-variabler i varje fils <style>-block.
Varma skogsfärger: bg #FDF6EC, surface #FFF8F0, primary #D97B3A, correct #6B9E6B, wrong #C0614A.
Inga hårdkodade färger — använd alltid --color-* variabler.

## MISO-MASKOTEN
- Kattmaskot, fixed position bottom:20px right:20px
- Storlek: clamp(100px, 12vw, 140px)
- Tre poser: miso-neutral.webp, miso-glad.webp, miso-uppmuntrande.webp
- Pratbubbla: background #FFF8F0, border 2px solid #EDE0C8, border-radius 16px, ingen pil
- Bubblan auto-döljs efter 3000ms
- const CAT_NAME = "Miso" högst upp i varje fils script-block
- Miso-containern placeras precis före </script>

## FILSTRUKTUR
avalin-matematik/
├── index.html           (startsida, alla modulknappar live)
├── style.css            (delad bas-CSS)
├── klockan.html         (✅ klar)
├── brak.html            (✅ klar — Modul 1–9)
├── taluppfattning.html  (✅ klar — Modul 1–8, inkl. negativa tal m7–m8)
├── decimaltal.html      (✅ klar — Modul 1–4)
├── test.html            (fungerar endast via npx serve .)
├── images/miso/         (miso-neutral.webp, miso-glad.webp, miso-uppmuntrande.webp)
├── images/forest-bg.webp
├── CLAUDE.md
└── README.md

## TEKNISKA STANDARDER
- answered-flagga blockerar dubbelklick
- clean state vid ny uppgift
- pulse på Ny uppgift vid rätt svar
- streak 🐱 X i rad från 2 rätta — nollställs vid fel
- hadError-flagga: streak ökar bara om uppgiften klarades utan fel
- digits-only keydown-handler där relevant
- multiple choice föredras över textinput
- nivå-badge synlig
- avancera efter 3 rena rätt i rad (hadError = false)

## NÄSTA STEG — PRIORITERAD ORDNING
1. Gamification — streak-belöningar, localStorage-poäng
2. Koordinatsystem — ny fil
3. Geometri — ny fil
4. Sannolikhet/statistik — ny fil

## RÖDA FLAGGOR
- Git körs i PowerShell — inte i Claude-terminalen
- Starta alltid med claude --dangerously-skip-permissions
- test.html fungerar inte via file:// — använd npx serve .
- npx serve . i egen terminal, inte Claude Code-terminalen
- Lägg inte till navigeringsknappar eller extra features utan att Mats bett om det
- Stoppa design-tangenter innan funktionen är klar
- Inga hårdkodade färger — använd alltid --color-* variabler

## SESSIONSAVSLUT
Innan du avslutar varje session, uppdatera CLAUDE.md automatiskt:
- Markera moduler som klara om de testats och godkänts av Mats
- Uppdatera NÄSTA STEG om prioriteringen förändrats
- Lägg till nya röda flaggor om sådana uppstått
- Ändra ingenting annat utan att Mats bett om det
