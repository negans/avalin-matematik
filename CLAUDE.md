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
- Git: Claude sköter add → commit → push via sina verktyg (Mats behöver inte köra git själv). Pusha bara efter Mats godkännande — pushen publicerar till live-sidan.
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
├── multiplikation.html (✅ klar — Modul 1–5 inkl. division med rest, ×/÷ med 10/100/1000, decimaltal)
├── koordinat.html      (✅ klar — Modul 1–4: läs av, hitta, plotta punkter, fyra kvadranter)
├── geometri.html       (✅ klar — Modul 1–5: vinklar, former, symmetri, omkrets, area)
├── algebra.html        (✅ klar — Modul 1–5: uttryck, variabler, förenkla, ekvationer, mönster)
├── statistik.html      (⬜ ej skapad — Fas 3, steg 10)
├── template.html       (✅ klar — extraherad ur koordinat.html; skelett för nya modulsidor)
├── logic/              (✅ delad ren logik: shared, decimaltal, brak, taluppfattning, klockan, multiplikation, koordinat, geometri, algebra)
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
6. ✅ multiplikation.html — multiplikation och division med hela tal och decimaltal (SINGMA 5A kap 2)
   → Modul 1 grupper/array · 2 hela tal · 3 division (rest på nivå 3) · 4 ×/÷ med 10/100/1000 · 5 decimaltal
   → NÄSTA STEG är steg 7 (koordinat.html, Fas 3)

### Fas 3 — Nya filer åk 5–6 (shell-first: bygg ett, extrahera template, repetera)
7. ✅ koordinat.html — koordinatsystem, plotta punkter (SINGMA 5A kap 6)
   → Modul 1 läs av · 2 hitta punkt (A–D) · 3 plotta (klick) · 4 fyra kvadranter (negativa tal)
   → ✅ template.html extraherad från det som byggts (skelett för kommande modulsidor)
   → NÄSTA STEG är steg 8 (geometri.html)
8. ✅ geometri.html — vinklar, former, symmetri, omkrets, area (SINGMA 5B kap 4–5)
   → Modul 1 vinklar (typ) · 2 former (känna igen) · 3 symmetri (antal linjer + avslöjar dem) · 4 omkrets · 5 area
   → NÄSTA STEG är steg 9 (algebra.html)
9. ✅ algebra.html — uttryck, variabler, enkla ekvationer (SINGMA 5B kap 1)
   → Modul 1 beräkna uttryck · 2 skriv uttryck · 3 förenkla (samla termer) · 4 lös ekvation (våg) · 5 mönster
   → NÄSTA STEG är steg 10 (statistik.html) — sista i Fas 3
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
- Abstrahera inte för tidigt — template.html finns nu, men håll den som ett skelett; bygg klart en riktig modul innan mönster bryts ut på nytt
- Miso DOM-placering: container måste ligga omedelbart före </script>-taggen
- Bygg aldrig mer än ett steg åt gången utan Mats godkännande