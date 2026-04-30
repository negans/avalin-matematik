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

## FILSTRUKTUR
avalin-matematik/
├── index.html          (startsida, alla modulknappar live)
├── klockan.html        (✅ klar)
├── brak.html           (✅ klar — Modul 1–9)
├── taluppfattning.html (✅ klar — Modul 1–6)
├── decimaltal.html     (✅ klar — Modul 1–4)
├── test.html           (fungerar endast via npx serve .)
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
1. CSS-refaktor — bryt ut gemensam style.css (PÅGÅR NÄSTA)
2. Designlyft — varma mjuka färger, katt-maskot, illustrationer
3. Gamification — streak-belöningar, localStorage-poäng
4. Negativa tal — taluppfattning.html
5. Koordinatsystem — ny fil
6. Geometri — ny fil
7. Sannolikhet/statistik — ny fil

## RÖDA FLAGGOR
- Git körs i PowerShell — inte i Claude-terminalen
- Starta alltid med claude --dangerously-skip-permissions
- test.html fungerar inte via file:// — använd npx serve .
- npx serve . i egen terminal, inte Claude Code-terminalen
- Lägg inte till navigeringsknappar eller extra features utan att Mats bett om det
- Stoppa design-tangenter innan funktionen är klar