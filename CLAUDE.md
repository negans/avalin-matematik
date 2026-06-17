# CLAUDE.md — Avalins Matematikverkstad

## PROJEKTÖVERSIKT
Interaktiv matematikplattform för Avalin (f. 2014, åk 6 från hösten 2025).
Live: negans.github.io/avalin-matematik
Repo: github.com/negans/avalin-matematik
Stack: HTML/CSS/JavaScript — inga ramverk.

## AVALINS PROFIL
Utredning klar: bekräftat svagt verbalt arbetsminne — milda tendenser till autism och dyskalkyli.
Behöver tydliga instruktioner i steg — ett steg i taget, aldrig flera saker samtidigt.
Lärstil: kropp → bild → förståelse → abstraktion.
Visuellt, konkret, steg för steg. Teknikvän, jobbar självständigt.
Intressen: katter, rita, pyssla. Gillar mjuka varma färger med natur och djur.
Mål: minst godkänt i matematik åk 6.

## PEDAGOGISK ROLL
Plattformen är komplement till SINGMA/skolan — inte fristående.
Avalin möter ett begrepp i skolan → befäster det här.
Samma moment som skolan, men mer visuellt, mer konkret, mer anpassat.
Följer SINGMA-strukturen: 5A och 5B är referens för innehåll och ordning.

## ARBETSFLÖDE
- Claude Code CLI: kör `claude` i VS Code-terminalen med auto mode (auto-accept edits) — INTE --dangerously-skip-permissions
- PowerShell för git: add → commit → push (semikolon som separator, inte &&)
- Auto Save aktiverat i VS Code
- npx serve . i separat PowerShell-terminal för lokal testning

## FILSTRUKTUR
avalin-matematik/
├── index.html          (startsida, alla modulknappar live)
├── style.css           (✅ klar — gemensam stilmall)
├── klockan.html        (✅ klar)
├── brak.html           (✅ klar — Modul 1–10 inkl. procent + tre former)
├── taluppfattning.html (✅ klar — Modul 1–8 inkl. negativa tal)
├── decimaltal.html     (✅ klar — Modul 1–5 inkl. enhetsbyten)
├── multiplikation.html (⬜ ej skapad — Fas 2, steg 6)
├── koordinat.html      (⬜ ej skapad — Fas 3, steg 7)
├── geometri.html       (⬜ ej skapad — Fas 3, steg 8)
├── algebra.html        (⬜ ej skapad — Fas 3, steg 9)
├── statistik.html      (⬜ ej skapad — Fas 3, steg 10)
├── template.html       (⬜ skapas EFTER koordinat.html är klar — inte innan)
├── logic/              (✅ delad ren logik: shared, decimaltal, brak, taluppfattning, klockan)
├── tests/              (✅ test.js — beroendefri svit, körs med "node tests/test.js")
├── CLAUDE.md
└── README.md

## HANDLINGSPLAN — PRIORITERAD ORDNING

### Fas 1 — Skal och infrastruktur (byggs en gång, gäller alla filer)
1. ✅ CSS-refaktor — gemensam style.css bruten ut
2. ✅ Designlyft — Miso-maskot (3 poser), varm färgpalett, skogsbakgrund
3. ✅ Gamification — localStorage-poäng, daglig streak, stjärnor (storage.js)
   → statsbaren är dold på begäran (style.css), men poäng/stjärnor sparas och Miso firar milstolpar

### Fas 2 — Komplettera åk 5 (befintliga filer + ny multiplikation.html)
4. ✅ Procent ↔ bråk ↔ decimal — sambandet explicit (brak.html, Modul 10)
5. ✅ Decimaltal i mätsammanhang — enhetsbyten cm↔m, ml↔l, g↔kg (decimaltal.html, Modul 5)
6. ⬜ multiplikation.html — multiplikation och division med hela tal och decimaltal (SINGMA 5A kap 2)
   → NÄSTA STEG. Täcker gap i läroplanen: inget i kodbasen tränar detta som räknesätt

### Fas 3 — Nya filer åk 5–6 (shell-first: bygg ett, extrahera template, repetera)
7. koordinat.html — koordinatsystem, plotta punkter (SINGMA 5A kap 6)
   → Efter denna: extrahera template.html från det som byggts
8. geometri.html — vinklar, former, symmetri, omkrets, area (SINGMA 5B kap 4–5)
9. algebra.html — uttryck, variabler, enkla ekvationer (SINGMA 5B kap 1)
10. statistik.html — diagram, medelvärde, sannolikhet, kombinatorik (SINGMA 5B kap 6)

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
- ett steg i taget i UI — aldrig flera krav synliga samtidigt

## RÖDA FLAGGOR
- Använd INTE --dangerously-skip-permissions. Kör med auto mode (auto-accept edits).
- npx serve . i egen terminal, inte Claude Code-terminalen
- Ren logik hör hemma i logic/*.js (testbar) — kör node tests/test.js efter ändring
- Lägg inte till navigeringsknappar eller extra features utan att Mats bett om det
- Stoppa design-tangenter innan funktionen är klar
- Abstrahera inte för tidigt — bygg koordinat.html färdigt innan template.html skapas
- Miso DOM-placering: container måste ligga omedelbart före </script>-taggen
- Bygg aldrig mer än ett steg åt gången utan Mats godkännande