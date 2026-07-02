# CLAUDE.md — Avalins Matematikverkstad

> Avklarad handlingsplan (Fas 1–4 + steg 14–15) bor i **HISTORIK.md**. Läs den bara vid behov.
> Denna fil = aktiv instruktion + var vi är nu. Håll den tokenlätt: nya "KLAR"-rader förs till HISTORIK.md, inte hit.

## PROJEKTÖVERSIKT
Interaktiv matematikplattform för Avalin (f. 2014, börjar åk 6 i augusti 2026).
Live: negans.github.io/avalin-matematik · Repo: github.com/negans/avalin-matematik
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
Avalin möter ett begrepp i skolan → befäster det här. Samma moment, men mer visuellt, konkret, anpassat.
Följer SINGMA-strukturen: 5A och 5B är referens för innehåll och ordning (Fas 1–3).

BETYGSKONTEXT (åk 6): Första betyget jul 2026 mäts mot betygskriterierna för åk 6, som täcker HELA
centralinnehållet åk 4–6 — inte bara höstens nya moment. Därför måste verktyget även nå åk-6-typiska
moment som 5A/5B inte täcker (Fas 4–7). Golv = E, sikte = C–D. Betyget är en FÖLJD, inte en byggsten:
skillnaden mellan E och C/D är djup förståelse, ändamålsenligt metodval och resonemang — inte fler moduler.
Vi designar för förståelse/metodval (worked examples, interleaving, resonemangslager) och håller E som golv.
KVALITET FÖRE TEMPO — ingen deadline att forcera mot. Allt klart och putsat före skolstart aug 2026.
⚠️ SINGMA 6A/6B exakta kapitellista är INTE verifierad (NOK inloggningsskyddat). Fas 4–7 vilar på Lgr22
åk 4–6 + publicerade åk 6-planeringar. Bekräfta kapitelordningen mot Singma 6A/6B elevwebb/lärarhandledning.

## PEDAGOGISKA DESIGNPRINCIPER (gäller ALLA moduler)
Härledda ur Avalins profil. Bryts inte utan att ändringen skrivs in här.

Arbetsminne:
- En instruktion = en mening, presens, konkret. Inga bisatser, inga idiom. Aldrig två krav synliga samtidigt.
- Visa hellre än beskriv: bilden bär uppgiften, texten är en knuff. Konkret före symbolisk (kropp → bild → förståelse → abstraktion).
- Isolera färdigheten som tränas. Incidentell aritmetik får ALDRIG vara svårare än momentet som övas — t.ex. medelvärde tvingas bli heltal, vinklar/tal hålls "snälla".

Dyskalkyli:
- Stötta antalsuppfattning visuellt (prickar, tioramar, grupperingar). Luta inte mot utantillkunskap om talfakta.
- Färg är ALDRIG enda signalen (rätt/fel, kategorier): para alltid med ikon + text/form.
- Håll tal små och rena där begreppet — inte räkningen — är poängen.

Autism / förutsägbarhet:
- Layout identisk mellan sidor: samma knappplaceringar, samma plats för feedback, samma färgbetydelser. Hon ska aldrig behöva lära om gränssnittet.
- Inga överraskningar: inga timers, ingen nedräkning, ingen plötslig rörelse. Miso firar lugnt, aldrig mitt i en uppgift.
- Mjuka animationer. Ingen uppläsning/ljud alls (Mats beslut 2026-06-20; all uppläsningskod borttagen — återinför INTE utan nytt beslut).

Trygghet / mående (E är golvet):
- Tid mäts inte och visas inte. Långsamhet bestraffas aldrig.
- Fel är information, inte misslyckande: vänlig feedback, visa rätt väg, försök igen utan dramatik.
- Framsteg ska kännas: små täta vinster, Miso bekräftar, svårighet höjs först efter säker behärskning.

## MÖNSTER V2 (obligatoriskt för alla nya moduler)
Två lager ovanpå grunduppgiften. Ren logik i logic/*.js, testad. (Per-fil-anpassningar för äldre filer: se HISTORIK.md.)

Worked example (löst exempel) — workedSteps():
- Visas AUTO första gången per nivå (sparas i storage); därefter via "Visa mig"-knapp — aldrig påtvingad igen.
- BILD FÖRST: exemplet ritar modulens riktiga figur i exempelrutan (rita-funktionen tar svgId + task), sedan symboler/uträkning.
- Exakt samma uppgiftstyp hon ska göra härnäst, fullständigt löst, ETT steg per rad, samma visuella representation.
- Genereras av samma genMxTask-logik → exempel och uppgift matchar alltid nivån. Ingen hårdkodad text.
- Uppgiftsspecifik fråga (med tal) ligger INNE i mXLive så den göms när exemplet visas. Generiska frågor får ligga utanför.

Resonemangslager (C/D) "Varför?" — whyQuestion():
- Efter RÄTT svar, ibland följdfråga "Varför stämmer det?" med 2–3 flervalsmotiveringar (multiple choice, ALDRIG textinput).
- Frekvens: endast toppnivå (abstrakt) och inte varje gång (~var tredje). Aldrig lägsta nivåerna — där bär den konkreta förståelsen.
- Motiveringar: en korrekt resonemangsrad + 1–2 rimligt-felaktiga enligt distraktor-doktrinen.
- STOPPAR ALDRIG progression: fel på "varför" sänker inte streaken och blockerar inte nästa uppgift. Sträcklager ovanpå E-golvet.

## ARBETSFLÖDE
- Claude Code CLI: kör `claude` i VS Code-terminalen med auto mode (auto-accept edits) — INTE --dangerously-skip-permissions
- Git: Claude sköter add → commit → push via sina verktyg. Pusha bara efter Mats godkännande (pushen publicerar till live-sidan).
- Auto Save aktiverat i VS Code. npx serve . i separat PowerShell-terminal för lokal testning.

## FILSTRUKTUR
- index.html — startsida, alla modulknappar live
- style.css — gemensam stilmall · storage.js — localStorage (poäng, streak, stjärnor, inställningar)
- ui.js — delade UI-globaler: showMiso(), setStreak() + mönster v2-helpers renderExampleSteps(), toggleExample(), renderWhyPanel(), hideWhyPanel()
- template.html — skelett för nya modulsidor (extraherad ur koordinat.html; håll som skelett)
- Modulsidor (alla klara): klockan, brak, taluppfattning, decimaltal, multiplikation, koordinat, geometri, algebra, statistik, skala, proportionalitet (.html)
- logic/ — delad ren logik (shared + en fil per modulsida ovan)
- tests/ — test.js (logik) + regression.js (struktur/referensintegritet/täckning), beroendefria; körs med `node tests/test.js` resp. `node tests/regression.js`
- CLAUDE.md (denna) · HISTORIK.md (avklarat) · README.md

## STATUS & ÅTERSTÅENDE ARBETE
Klart: Fas 1–4 (SINGMA 5A/5B + mönster v2 på alla 9 filer + innehållsluckor) och Fas 5 steg 14–15. Detaljer i HISTORIK.md.
WHY-ordning för det som återstår: bygg nya filer på färdigt mönster → lägg retrieval-/problemlösningslager ovanpå stabilt innehåll → backlog sist → slutpass. Så rörs ingen fil två gånger för samma sak.

### Fas 5 — Nya innehållsfiler (konkret → abstrakt)
16. grafer för proportionella samband — i koordinat.html (koordinatsystemet finns) eller i proportionalitet-filen.
17. 3D-former — tredimensionella objekt och deras egenskaper (utöka geometri.html eller egen fil).

### Fas 6 — Retrieval- och problemlösningslager (byggs sent; vill ha innehållet stabilt)
18. Blandat repetitionsläge (interleaving) — slumpade uppgifter tvärs alla moduler. Tränar att VÄLJA metod. Starkaste C/D-greppet.
19. problemlösning — elevnära textproblem som kräver strategival (Lgr22). Bär tungt mot C/D. Kan kopplas in som blandade problem i repetitionsläget.

### Fas 7 — Backlog (mogen pattern, lägst beroenderisk)
20. Programmering i visuell miljö / algoritmer (Lgr22 algebra-strand). ⚠️ Verifiera FÖRST om skolan täcker detta (ofta Scratch/Blockly). Om vi bygger: hellre enkelt algoritm-/sekvenspussel än full blockmiljö.
21. Övriga småsaker som dyker upp under bygget — fångas här, inte ad hoc.

### Fas 8 — Slutpass (kvalitetsgrind före skolstart aug 2026)
22. Cross-page consistency-genomgång (hård regel — alla sidor samma UX).
23. node tests/test.js grön + utöka testsviten för ALL ny logik.
24. /code-review high per ny/ändrad modul.
25. Slutlig avstämning mot Lgr22 åk 4–6 (checklista) — bekräfta att inget moment saknas.

## DISTRAKTOR-DOKTRIN (kärnan i kvaliteten)
Varje felaktigt svarsalternativ kodar en SPECIFIK, namngiven missuppfattning — aldrig en slumpmässig närmiss.
Det gör fel svar diagnostiska och tvingar fram förståelse, inte gissning. Gäller alla moduler OCH "varför"-motiveringarna.
Missuppfattningar att bygga på:
- Fel räknesätt (adderar i stället för multiplicerar — t.ex. kombinatorik a+b)
- Glömt steg (glömmer dela i medelvärde → svarar summan)
- Off-by-one / fel gränsvärde
- Omvänd riktning (drar åt fel håll; byter täljare/nämnare)
- Tappat term/variabel (glömmer konstanten; tappar x)
- Delberäkning (stannar halvvägs)
Regler: 3 distraktorer, alla distinkta, facit aldrig bland dem, inga ogiltiga värden (negativa/noll där det inte är meningsfullt). Allt verifieras med invariant-assertions i tests/test.js.

## TEKNISKA STANDARDER
- answered-flagga blockerar dubbelklick · clean state vid ny uppgift · pulse på Ny uppgift vid rätt svar
- streak 🐱 X i rad från 2 rätta — nollställs vid fel · hadError-flagga: streak ökar bara om uppgiften klarades utan fel
- digits-only keydown-handler där relevant · multiple choice föredras över textinput · nivå-badge synlig
- avancera efter 3 rena rätt i rad (hadError = false) · ett steg i taget i UI — aldrig flera krav synliga samtidigt

## TESTNING & VERIFIERING (två lager — BÅDA krävs)
Logiklagret och det visuella lagret fångar olika fel. Inget ersätter det andra.

LOGIKLAGER — automatiserat (Claude Code i terminalen):
- node tests/test.js körs efter VARJE ändring och måste vara grönt.
- node tests/regression.js kompletterar: strukturell koll (testtäckning, trasiga filreferenser, Miso-container per sida) — den terminalbara halvan av det ockulära lagret. Kör tillsammans med test.js. Den andra halvan (skärmdumpssvep) kräver Fable + browserverktyg.
- All ren logik i logic/*.js ska ha assertions: exakta värden + invarianter per nivå, property-based (generatorn körs många varv).
- Ny logik = nya tester i SAMMA commit (även "varför"-motiveringarnas generator). Inget läggs till otestat.
- Alla moduler har egen testblock — ingen känd lucka. Utöka löpande om en lucka upptäcks.
- Webbläsar-API (t.ex. SVG-rendering) kan INTE testas i Node — verifieras i visuella lagret i stället.

VISUELLT / OCKULÄRT LAGER — kräver browser-verktyg (terminalen ser INTE renderingen):
- Verifieras i Brave mot npx serve-URL:en via Claude-extensionen (eller skärmdumpar).
- Checklista per sida: instruktionen en mening i taget · worked example första gången på en nivå · rätt/fel med ikon + text (inte bara färg) · Miso renderas och firar utan att störa · ingen timer/nedräkning · layout matchar övriga sidor · inga konsolfel.
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
- [ ] node tests/regression.js grönt
- [ ] Ockulär verifiering i Brave (npx serve via Claude-extensionen) — checklistan ovan passerad
- [ ] /code-review high utförd

## RÖDA FLAGGOR
- Använd INTE --dangerously-skip-permissions. Kör med auto mode (auto-accept edits).
- npx serve . i egen terminal, inte Claude Code-terminalen.
- Ren logik hör hemma i logic/*.js (testbar) — kör node tests/test.js efter ändring.
- Lägg inte till navigeringsknappar eller extra features utan att Mats bett om det.
- Stoppa design-tangenter innan funktionen är klar.
- Abstrahera inte för tidigt — håll template.html som skelett; bygg klart en riktig modul innan mönster bryts ut på nytt.
- Miso DOM-placering: container måste ligga omedelbart före </script>-taggen.
- Bygg aldrig mer än ett steg åt gången utan Mats godkännande.
- Kvalitet före tempo: ingen deadline att forcera mot. Bygg färdigt och rätt.
- Betyget (C/D) är en FÖLJD av djup förståelse — bygg för förståelse, metodval och resonemang, inte för att bocka av innehåll. E är golvet; sätt aldrig press på Avalin.
