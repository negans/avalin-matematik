# CLAUDE.md — Avalins Matematikverkstad

## PROJEKTÖVERSIKT
Interaktiv matematikplattform för Avalin (f. 2014, börjar åk 6 i augusti 2026).
Live: negans.github.io/avalin-matematik
Repo: github.com/negans/avalin-matematik
Stack: HTML/CSS/JavaScript — inga ramverk.

## AVALINS PROFIL
Utredning klar: bekräftat svagt verbalt arbetsminne — milda tendenser till autism och dyskalkyli.
Behöver tydliga instruktioner i steg — ett steg i taget, aldrig flera saker samtidigt.
Lärstil: kropp → bild → förståelse → abstraktion.
Visuellt, konkret, steg för steg. Teknikvän, jobbar självständigt.
Intressen: katter, rita, pyssla. Gillar mjuka varma färger med natur och djur.
Mål: golv E, sikte C–D i matematik åk 6 (första betyg jul 2026) — genom djup förståelse, inte forcering.

## PEDAGOGISK ROLL
Plattformen är komplement till SINGMA/skolan — inte fristående.
Avalin möter ett begrepp i skolan → befäster det här.
Samma moment som skolan, men mer visuellt, mer konkret, mer anpassat.
Följer SINGMA-strukturen: 5A och 5B är referens för innehåll och ordning (Fas 1–3).

BETYGSKONTEXT (åk 6)
Avalin börjar åk 6 i augusti 2026; första betyget sätts till jul 2026, mot betygskriterierna för åk 6 som täcker HELA centralinnehållet åk 4–6 — inte bara höstens nya moment. "Befästa grunden" är därför rätt strategi, men verktyget måste också nå de åk-6-typiska moment som 5A/5B inte täcker (Fas 4–7).
Golv = E. Sikte = C–D. Betyget är en FÖLJD, inte en byggsten: skillnaden mellan E och C/D är djup förståelse, att välja ändamålsenlig metod och att föra resonemang — inte fler moduler. Därför designar vi för förståelse och metodval (worked examples, interleaving, resonemangslager) och håller E som golv så att Avalin aldrig sätts under press.
Ingen deadline att forcera mot: KVALITET FÖRE TEMPO. Allt ska vara klart och putsat före skolstart aug 2026, så Avalin kan förbereda sig under sommaren.
⚠️ SINGMA 6A/6B exakta kapitellista är INTE verifierad (NOK inloggningsskyddat). Fas 4–7 vilar på Lgr22 åk 4–6 + publicerade åk 6-planeringar. Bekräfta kapitelordningen mot Singma 6A/6B elevwebb/lärarhandledning.

## PEDAGOGISKA DESIGNPRINCIPER (gäller ALLA moduler)
Härledda ur Avalins profil. Bryts inte utan att ändringen skrivs in här.

Arbetsminne:
- En instruktion = en mening, presens, konkret. Inga bisatser, inga idiom. Aldrig två krav synliga samtidigt.
- Visa hellre än beskriv: bilden bär uppgiften, texten är en knuff. Konkret representation före symbolisk (kropp → bild → förståelse → abstraktion).
- Isolera färdigheten som tränas. Incidentell aritmetik får ALDRIG vara svårare än momentet som övas — t.ex. medelvärde tvingas bli heltal, vinklar/tal hålls "snälla".

Dyskalkyli:
- Stötta antalsuppfattning visuellt (prickar, tioramar, grupperingar). Luta inte mot utantillkunskap om talfakta.
- Färg är ALDRIG enda signalen (rätt/fel, kategorier): para alltid med ikon + text/form.
- Håll tal små och rena där begreppet — inte räkningen — är poängen.

Autism / förutsägbarhet:
- Layout identisk mellan sidor: samma knappplaceringar, samma plats för feedback, samma färgbetydelser. Hon ska aldrig behöva lära om gränssnittet.
- Inga överraskningar: inga timers, ingen nedräkning, ingen plötslig rörelse. Miso firar lugnt, aldrig mitt i en uppgift.
- Mjuka animationer. Ingen uppläsning/ljud alls (Mats beslut 2026-06-20: hela uppläsningsfunktionen borttagen, se Fas 4 / lager 11b).

Trygghet / mående (E är golvet):
- Tid mäts inte och visas inte. Långsamhet bestraffas aldrig.
- Fel är information, inte misslyckande: vänlig feedback, visa rätt väg, försök igen utan dramatik.
- Framsteg ska kännas: små täta vinster, Miso bekräftar, svårighet höjs först efter säker behärskning.

## ARBETSFLÖDE
- Claude Code CLI: kör `claude` i VS Code-terminalen med auto mode (auto-accept edits) — INTE --dangerously-skip-permissions
- Git: Claude sköter add → commit → push via sina verktyg (Mats behöver inte köra git själv). Pusha bara efter Mats godkännande — pushen publicerar till live-sidan.
- Auto Save aktiverat i VS Code
- npx serve . i separat PowerShell-terminal för lokal testning

## FILSTRUKTUR
avalin-matematik/
├── index.html          (startsida, alla modulknappar live)
├── style.css           (✅ klar — gemensam stilmall)
├── storage.js          (✅ localStorage: poäng, streak, stjärnor, inställningar)
├── ui.js               (✅ delade UI-globaler: showMiso(), setStreak() + mönster v2-helpers: renderExampleSteps(), toggleExample(), renderWhyPanel(), hideWhyPanel())
├── klockan.html        (✅ klar)
├── brak.html           (✅ klar — Modul 1–10 inkl. procent + tre former)
├── taluppfattning.html (✅ klar — Modul 1–8 inkl. negativa tal)
├── decimaltal.html     (✅ klar — Modul 1–5 inkl. enhetsbyten)
├── multiplikation.html (✅ klar — Modul 1–5 inkl. division med rest, ×/÷ med 10/100/1000, decimaltal)
├── koordinat.html      (✅ klar — Modul 1–4: läs av, hitta, plotta punkter, fyra kvadranter)
├── geometri.html       (✅ klar — Modul 1–5: vinklar, former, symmetri, omkrets, area)
├── algebra.html        (✅ klar — Modul 1–5: uttryck, variabler, förenkla, ekvationer, mönster)
├── statistik.html      (✅ klar — Modul 1–5: diagram, medelvärde, sannolikhet, kombinatorik, typvärde)
├── skala.html          (⬜ ej skapad — Fas 5)
├── template.html       (✅ klar — extraherad ur koordinat.html; skelett för nya modulsidor)
├── logic/              (✅ delad ren logik: shared, decimaltal, brak, taluppfattning, klockan, multiplikation, koordinat, geometri, algebra, statistik)
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
10. ✅ statistik.html — diagram, medelvärde, sannolikhet, kombinatorik (SINGMA 5B kap 6)
    → Modul 1 läsa stapeldiagram · 2 medelvärde · 3 sannolikhet (kulor) · 4 kombinatorik (rutnät) · 5 typvärde
    → 🎉 FAS 3 KLAR — SINGMA 5A/5B-roadmapen i mål. Roadmapen FORTSÄTTER med Fas 4–8 (åk 6-komplettering, golv E / sikte C–D).

### Fas 4–8 — Åk 6-komplettering (golv E, sikte C–D)
Bakgrund: Fas 1–3 kartlägger SINGMA 5A/5B. Allt nedan står i Lgr22 åk 4–6 och är
åk-6-provmaterial. INGET är bortprioriterat (kvalitet före tempo) — allt är schemalagt,
ordnat efter beroende och pedagogisk logik.
WHY denna ordning: uppgradera mönstret EN gång på alla befintliga filer → bygg nya filer
på det färdiga mönstret → lägg retrieval-/problemlösningslagret ovanpå färdigt innehåll →
backlog sist (lägst beroenderisk) → slutpass. Så rörs ingen fil två gånger för samma sak.

### Fas 4 — Mönster v2 + komplettera befintliga filer (rör varje befintlig fil EN gång)
Mönster v2 läggs FÖRST så att nya filer (Fas 5) föds färdiga och inget retrofittas två gånger.
11. Mönster v2 i template.html — uppgradera skelettet med tre lager. Specat för Claude Code:

    11a. ✅ Worked example (löst exempel) före nivåstart — KLAR på piloten (koordinat.html). Logik: workedSteps() i logic/koordinat.js (testad). UI: "Visa mig"-knapp + auto-visning första gången per nivå (sparas i storage), rent rutnät med streckad väg.
        - Visas FÖRSTA gången Avalin går in på en nivå (per modul, per nivå). Därefter nåbar via "Visa mig"-knapp — aldrig påtvingad igen.
        - Innehåll: exakt samma uppgiftstyp hon ska göra härnäst, fullständigt löst, ETT steg per rad, med samma visuella representation som uppgiften.
        - Konkret → symbolisk: exemplet visar bilden först, sedan symbolerna/uträkningen.
        - Datakälla: genereras av samma genMxTask-logik, så exempel och uppgift alltid matchar nivån. Ingen hårdkodad text.

    11b. Uppläsning av instruktion — BORTTAGEN (Mats beslut 2026-06-20)
        - Ursprungligen: Web Speech API, 🔊-knapp + "Läs upp nya uppgifter"-toggle.
        - Mats vill inte ha någon inläsning någonstans. All uppläsningskod är borttagen ur ui.js, koordinat.html och template.html (speak/svVoice/initSpeak/🔊-knappar). Återinför INTE utan nytt beslut.

    11c. ✅ Resonemangslager (C/D) — "varför?" — KLAR på piloten (koordinat.html). Logik: whyQuestion() i logic/koordinat.js (testad). UI: panel efter rätt svar, BARA nivå 2, ~var tredje; fel påverkar aldrig streak/progression.
        - Efter RÄTT svar, ibland en följdfråga "Varför stämmer det?" med 2–3 korta flervalsmotiveringar (multiple choice, ALDRIG textinput).
        - Frekvens: endast nivå 2 (abstrakt) och inte varje gång (~var tredje). Aldrig nivå 0–1 — där bär den konkreta förståelsen.
        - Motiveringar: en korrekt resonemangsrad + 1–2 rimligt-felaktiga, byggda enligt distraktor-doktrinen.
        - STOPPAR ALDRIG progression: fel på "varför" sänker inte streaken och blockerar inte nästa uppgift. Sträcklager ovanpå E-golvet.
        - Ren logik: motiveringar + deras distraktorer genereras i logic/*.js och testas.

12. Pilot FÖRST, sedan utrullning — bryt inte ut mönstret blint till nio filer.
    - ✅ Piloten koordinat.html KLAR: 11a + 11c byggda och verifierade (logiklager grönt, ockulärt i Brave). template.html har 11b-resterna borttagna men 11a/11c är ÄNNU INTE inlagda i skelettet — gör det som en del av första utrullningen.
    - ✅ klockan.html KLAR (specialfall, anpassat): klockan saknar nivåer/flerval/genMxTask. Anpassning: 11a = löst klocka via "Visa mig" + auto första besöket (logic/klockan.js: workedSteps); 11c = "Varför?" ~var tredje HELT rätt svar (ingen nivå-2-gate eftersom nivåer saknas), logic/klockan.js: whyQuestion. Båda testade + ockulärt verifierade. Bonus: solved-flagga hindrar dubbelräkning av streak vid om-koll.
    - ✅ taluppfattning.html KLAR (8 moduler M1–M8): workedSteps + whyQuestion i logic/taluppfattning.js; per modul exempel-panel (egen visual: markerad siffra/talföljd/jämförelse/tallinje) + "Varför?". M1/M2 saknar nivåer → exempel första besöket, "Varför?" var tredje; M3–M8 → exempel per nivå, "Varför?" bara nivå 2. Tester + ockulärt verifierat.
    - ✅ decimaltal.html KLAR (5 moduler, standardmönster): workedSteps + whyQuestion i logic/decimaltal.js; exempel per nivå + "Varför?" nivå 3 var tredje. Tester + ockulärt verifierat.
    - ✅ multiplikation.html KLAR (5 moduler): workedSteps + whyQuestion i logic/multiplikation.js; exempel per nivå + "Varför?" nivå 3 var tredje. Tester + ockulärt verifierat.
    - ✅ geometri.html KLAR (5 moduler): workedSteps + whyQuestion i logic/geometri.js; exempel per nivå + "Varför?" nivå 3 var tredje. Tester + ockulärt verifierat.
    - NÄSTA STEG: rulla ut EN fil i taget (standardmönster): algebra · statistik. (brak = specialfall, 10 moduler, tas sist.)
    - Per fil måste Definition of Done passeras (se nedan).
13. Innehållsluckor i befintliga filer (görs i samma pass som filen ändå öppnas):
    - geometri.html M5: triangelarea (b×h/2) + sammansatta figurer (+ cirkelbegrepp: radie, diameter, medelpunkt)
    - taluppfattning.html: överslagsräkning + rimlighetsbedömning; olika talsystem historiskt (romerska siffror)

### Fas 5 — Nya innehållsfiler (på mönster v2), KONKRET → ABSTRAKT
Ordningen följer Avalins lärstil: konkret bild först, abstraktion sedan.
14. skala.html — förminskning/förstoring, elevnära (karta, förstora en teckning). Konkret ingång till proportionalitet. Knyt till katter/rita.
15. proportionalitet — proportionella samband i bråk-/decimal-/procentform (abstraktionen som generaliserar skala + procent). Egen fil eller modul.
16. grafer för proportionella samband — i koordinat.html (koordinatsystemet finns) eller i proportionalitet-filen.
17. 3D-former — tredimensionella objekt och deras egenskaper (utöka geometri.html eller egen fil).

### Fas 6 — Retrieval- och problemlösningslager (ovanpå färdigt innehåll)
Byggs sent: aggregerar all modul-logik, så det vill ha innehållet stabilt.
18. Blandat repetitionsläge (interleaving) — drar slumpade uppgifter tvärs alla moduler.
    Tränar att VÄLJA metod, inte bara utföra. Starkaste C/D-greppet: prov blandar moment.
19. problemlösning — elevnära textproblem som kräver strategival (Lgr22 problemlösning).
    Bär tungt mot C/D (välja ändamålsenlig metod + resonemang). Kan kopplas in som blandade problem i repetitionsläget.

### Fas 7 — Backlog (på mogen pattern, lägst beroenderisk — byggs men sist)
20. Programmering i visuell miljö / algoritmer (Lgr22 algebra-strand).
    ⚠️ Verifiera FÖRST om skolan täcker detta (ofta Scratch/Blockly i skolan). Om vi bygger:
    hellre ett enkelt algoritm-/instruktionssekvens-pussel än full blockmiljö.
21. Övriga småsaker som dyker upp under bygget — fångas här, inte ad hoc.

### Fas 8 — Slutpass (kvalitetsgrind före skolstart aug 2026)
22. Cross-page consistency-genomgång (hård regel — alla sidor samma UX).
23. node tests/test.js grön + utöka testsviten för ALL ny logik.
24. /code-review high per ny/ändrad modul.
25. Slutlig avstämning mot Lgr22 åk 4–6 (checklista) — bekräfta att inget moment saknas.

## DISTRAKTOR-DOKTRIN (kärnan i kvaliteten)
Varje felaktigt svarsalternativ kodar en SPECIFIK, namngiven missuppfattning — aldrig en slumpmässig närmiss. Det gör fel svar diagnostiska och tvingar fram förståelse, inte gissning. Gäller alla moduler OCH "varför"-motiveringarna.
Missuppfattningar att bygga på:
- Fel räknesätt (adderar i stället för multiplicerar — t.ex. kombinatorik a+b)
- Glömt steg (glömmer dela i medelvärde → svarar summan)
- Off-by-one / fel gränsvärde
- Omvänd riktning (drar åt fel håll; byter täljare/nämnare)
- Tappat term/variabel (glömmer konstanten; tappar x)
- Delberäkning (stannar halvvägs)
Regler: 3 distraktorer, alla distinkta, facit aldrig bland dem, inga ogiltiga värden (negativa/noll där det inte är meningsfullt). Allt verifieras med invariant-assertions i tests/test.js.

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

## TESTNING & VERIFIERING (två lager — BÅDA krävs)
Logiklagret och det visuella lagret fångar olika fel. Inget ersätter det andra.

LOGIKLAGER — automatiserat (Claude Code i terminalen)
- node tests/test.js körs efter VARJE ändring och måste vara grönt.
- All ren logik i logic/*.js ska ha assertions i tests/test.js: exakta värden + invarianter per nivå, property-based (generatorn körs många varv).
- Ny logik = nya tester i SAMMA commit. Gäller även nya lager, t.ex. "varför"-motiveringarnas generator. Inget läggs till otestat.
- Bakåt: testsviten utökas löpande om en lucka upptäcks i redan byggd logik. STATUS NU: alla nio moduler har egen testblock — ingen känd lucka.
- Webbläsar-API (t.ex. SVG-rendering) kan INTE testas i Node — verifieras i visuella lagret i stället.

VISUELLT / OCKULÄRT LAGER — kräver browser-verktyg (terminalen ser INTE renderingen)
- Verifieras i Brave mot npx serve-URL:en via Claude-extensionen (eller skärmdumpar). Claude Code i terminalen kan INTE göra detta själv — det måste ske genom browser-verktyget.
- Checklista per sida: instruktionen visas en mening i taget · worked example visas första gången på en nivå · rätt/fel signaleras med ikon + text (inte bara färg) · Miso renderas och firar utan att störa · ingen timer/nedräkning · layout matchar övriga sidor · inga konsolfel.
- Körs efter VARJE modul, och som helhetspass över alla sidor i Fas 8.

## DEFINITION OF DONE (varje modul måste passera)
- [ ] Ren logik i logic/<modul>.js, inga DOM-anrop, UMD (browser + Node)
- [ ] 3 nivåer, konkret → abstrakt
- [ ] Distraktorer enligt distraktor-doktrinen
- [ ] Tester i tests/test.js: exakta värden + invarianter per nivå (facit korrekt, 3 distinkta, facit ej bland distraktorer, inga ogiltiga värden)
- [ ] Instruktion = en kort mening
- [ ] Worked example per nivå
- [ ] Färg aldrig enda signalen (ikon/text också)
- [ ] Miso-container omedelbart före </script>
- [ ] Cross-page consistent UX (knappar, feedback, färgbetydelser identiska)
- [ ] node tests/test.js grönt
- [ ] Ockulär verifiering i Brave (npx serve via Claude-extensionen) — checklistan i TESTNING & VERIFIERING passerad
- [ ] /code-review high utförd

## RÖDA FLAGGOR
- Använd INTE --dangerously-skip-permissions. Kör med auto mode (auto-accept edits).
- npx serve . i egen terminal, inte Claude Code-terminalen
- Ren logik hör hemma i logic/*.js (testbar) — kör node tests/test.js efter ändring
- Lägg inte till navigeringsknappar eller extra features utan att Mats bett om det
- Stoppa design-tangenter innan funktionen är klar
- Abstrahera inte för tidigt — template.html finns nu, men håll den som ett skelett; bygg klart en riktig modul innan mönster bryts ut på nytt
- Miso DOM-placering: container måste ligga omedelbart före </script>-taggen
- Bygg aldrig mer än ett steg åt gången utan Mats godkännande
- Kvalitet före tempo: ingen deadline att forcera mot. Bygg färdigt och rätt.
- Betyget (C/D) är en FÖLJD av djup förståelse — bygg för förståelse, metodval och resonemang, inte för att bocka av innehåll. E är golvet; sätt aldrig press på Avalin.