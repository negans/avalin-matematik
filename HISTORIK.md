# HISTORIK — Avalins Matematikverkstad

Avklarad handlingsplan (Fas 1–4 + Fas 5 steg 14–15) och per-fil-detaljer.
Flyttat hit ur CLAUDE.md 2026-07-02 för att hålla den aktiva instruktionsfilen tokenlätt.
Läs vid behov (t.ex. "hur anpassades brak.html?") — inte varje session.
De aktiva reglerna (mönster v2, distraktor-doktrin, DoD, standarder) bor kvar i CLAUDE.md.

---

## Fas 1 — Skal och infrastruktur (KLAR)
1. ✅ CSS-refaktor — gemensam style.css bruten ut
2. ✅ Designlyft — Miso-maskot (3 poser), varm färgpalett, skogsbakgrund
3. ✅ Gamification — localStorage-poäng, daglig streak, stjärnor (storage.js)
   → statsbaren är dold på begäran (style.css), men poäng/stjärnor sparas och Miso firar milstolpar

## Fas 2 — Komplettera åk 5 (KLAR)
4. ✅ Procent ↔ bråk ↔ decimal — sambandet explicit (brak.html, Modul 10)
5. ✅ Decimaltal i mätsammanhang — enhetsbyten cm↔m, ml↔l, g↔kg (decimaltal.html, Modul 5)
6. ✅ multiplikation.html — mult./division hela tal + decimaltal (SINGMA 5A kap 2)
   → Modul 1 grupper/array · 2 hela tal · 3 division (rest på nivå 3) · 4 ×/÷ med 10/100/1000 · 5 decimaltal

## Fas 3 — Nya filer åk 5–6 (KLAR — SINGMA 5A/5B-roadmapen i mål)
7. ✅ koordinat.html (SINGMA 5A kap 6) — Modul 1 läs av · 2 hitta punkt (A–D) · 3 plotta (klick) · 4 fyra kvadranter (negativa tal). template.html extraherad härifrån (skelett för kommande modulsidor).
8. ✅ geometri.html (SINGMA 5B kap 4–5) — Modul 1 vinklar · 2 former · 3 symmetri (antal linjer + avslöjar dem) · 4 omkrets · 5 area
9. ✅ algebra.html (SINGMA 5B kap 1) — Modul 1 beräkna uttryck · 2 skriv uttryck · 3 förenkla · 4 lös ekvation (våg) · 5 mönster
10. ✅ statistik.html (SINGMA 5B kap 6) — Modul 1 stapeldiagram · 2 medelvärde · 3 sannolikhet (kulor) · 4 kombinatorik (rutnät) · 5 typvärde

## Fas 4 — Mönster v2 + komplettera befintliga filer (KLAR)
De aktiva mönster v2-reglerna finns i CLAUDE.md ("MÖNSTER V2"). Nedan är utrullnings- och anpassningshistoriken.

### Steg 11 — mönster v2 specat
- 11a Worked example: pilot koordinat.html. Logik workedSteps() i logic/koordinat.js.
- 11b Uppläsning av instruktion — BORTTAGEN (Mats beslut 2026-06-20). Ursprungligen Web Speech API, 🔊-knapp + "Läs upp nya uppgifter"-toggle. All uppläsningskod borttagen ur ui.js, koordinat.html, template.html (speak/svVoice/initSpeak/🔊). Återinför INTE utan nytt beslut. (Instruktionsregeln lever kvar i CLAUDE.md > Designprinciper > Autism.)
- 11c Resonemangslager "Varför?": pilot koordinat.html. Logik whyQuestion() i logic/koordinat.js.
- Granskningskonvention 2026-06-21 (alla filer åtgärdade): (1) BILD FÖRST — exemplet ritar modulens riktiga figur via svgId+task. (2) Uppgiftsspecifik fråga (med tal) ligger i mXLive så den göms när exemplet visas.

### Steg 12 — pilot + utrullning på alla 9 filer (🎉 KLAR)
- ✅ koordinat.html — pilot: 11a + 11c, logiklager grönt, ockulärt i Brave.
- ✅ klockan.html — specialfall (saknar nivåer/flerval/genMxTask). 11a = löst klocka via "Visa mig" + auto första besöket (logic/klockan.js: workedSteps). 11c = "Varför?" ~var tredje HELT rätt svar (ingen nivå-2-gate). Solved-flagga hindrar dubbelräkning av streak vid om-koll.
- ✅ taluppfattning.html — 8 moduler M1–M8. workedSteps + whyQuestion i logic/taluppfattning.js. Egen visual per modul (markerad siffra/talföljd/jämförelse/tallinje). M1/M2 saknar nivåer → exempel första besöket, "Varför?" var tredje; M3–M8 → exempel per nivå, "Varför?" bara nivå 2.
- ✅ decimaltal.html — 5 moduler, standardmönster. logic/decimaltal.js. Exempel per nivå + "Varför?" nivå 3 var tredje.
- ✅ multiplikation.html — 5 moduler. logic/multiplikation.js. Exempel per nivå + "Varför?" nivå 3 var tredje.
- ✅ geometri.html — 5 moduler. logic/geometri.js. Exempel per nivå + "Varför?" nivå 3 var tredje.
- ✅ algebra.html — 5 moduler, generisk makeModule-motor. logic/algebra.js. Exempel/Varför inhakat i motorn via p.mod.
- ✅ statistik.html — 5 moduler, makeModule-motor. logic/statistik.js.
- ✅ brak.html — specialfall (Mats beslut 2026-06-21): mönster v2 på de 6 flervalsmodulerna (da1, da2, M7, M8, M9, M10). da1/da2 utan nivåer (exempel första besöket, "Varför?" var tredje); M7–M10 nivå 1–3 ("Varför?" på toppnivå 3). Interaktiva/"kolla svar"-moduler (M1, M2, M3, M5a, M5b, M6) lämnade medvetet (mönstret passar ej). brak-prefixade JS-namn.

### Steg 13 — innehållsluckor i befintliga filer (KLAR)
- ✅ geometri.html M6: triangelarea (b×h/2) — SVG-triangel (bas/höjd), 3 nivåer. logic/geometri.js genM6Task. 2026-06-21.
- ✅ geometri.html M7: cirkelbegrepp (radie/diameter/medelpunkt + d=2·r) — SVG-cirkel, 3 nivåer (känna igen → d från r → r från d). 2026-06-21.
- ✅ geometri.html M8: sammansatta figurer (L-form = två rektanglar, area = a·c + b·d) — SVG-L med streckad delningslinje + mått, 3 nivåer. 2026-06-21.
- ✅ taluppfattning.html M9: överslagsräkning (avrunda till tiotal/hundratal, uppskatta summa, 3 nivåer) — genM9Task. 2026-06-21.
- ✅ taluppfattning.html M10: romerska siffror (läsa, I–C, 3 nivåer) — genM10Task + toRoman. 2026-06-21.

## Fas 5 — Nya innehållsfiler (pågår; steg 14–15 KLARA)
14. ✅ skala.html — förminskning/förstoring, elevnära. Modul 1 förstoring/förminskning (kattteckning i rutor + skala a:b) · 2 skalfaktor på en längd (förstoring n:1 ×, förminskning 1:n ÷) · 3 karta↔verklighet (1 cm = M m). logic/skala.js testad (genM1–3Task, workedSteps, whyQuestion). Knyter till katter/rita via 🐱-teckning.
15. ✅ proportionalitet.html — proportionella samband (y = k·x), elevnära. Modul 1 lika mycket per styck (total = antal × styckpris) · 2 hur mycket kostar ett? (styckpris = total ÷ antal, alltid heltal) · 3 samma förhållande (värdetabell a→b, c→?; konstanten k). logic/proportionalitet.js testad (art+plural i ITEMS för korrekt svensk grammatik). Generaliserar skala (steg 14) + procent (brak M10).
