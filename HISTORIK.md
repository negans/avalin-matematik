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

## Fas 5 — Nya innehållsfiler (KLAR; steg 14–17b)
14. ✅ skala.html — förminskning/förstoring, elevnära. Modul 1 förstoring/förminskning (kattteckning i rutor + skala a:b) · 2 skalfaktor på en längd (förstoring n:1 ×, förminskning 1:n ÷) · 3 karta↔verklighet (1 cm = M m). logic/skala.js testad (genM1–3Task, workedSteps, whyQuestion). Knyter till katter/rita via 🐱-teckning.
15. ✅ proportionalitet.html — proportionella samband (y = k·x), elevnära. Modul 1 lika mycket per styck (total = antal × styckpris) · 2 hur mycket kostar ett? (styckpris = total ÷ antal, alltid heltal) · 3 samma förhållande (värdetabell a→b, c→?; konstanten k). logic/proportionalitet.js testad (art+plural i ITEMS för korrekt svensk grammatik). Generaliserar skala (steg 14) + procent (brak M10).
16. ✅ grafer för proportionella samband — proportionalitet.html M4 "Läs av grafen" (Mats val: prop-filen, inte koordinat.html — håller y=k·x-tråden). Rät linje genom origo, y-skala = multiplar av k med "?" på facit-raden, streckade avläs-guider + punkt. genM4Task (3 nivåer), workedSteps case 4, WHY[4]. Granskningsfynd åtgärdat: första versionen saknade y-skala → grafen var oavläsbar (linjen normaliserades identiskt för alla k); fixat med stödlinjer + y-siffror. Byggd via /ny-modul-skillen, Fable ockulär-pass + /code-review high 2026-07-03.
17. ✅ 3D-former — geometri.html M9. Känn igen kub/rätblock/klot/cylinder/kon/pyramid (isometrisk ritning, kontur bär formen). genM9Task (nivå 0 = fyra tydliga; 1–2 = alla sex), kategorival som M2. SHAPES_3D + SHAPE3D_DESC + WHY[9]. PR #4/#5.
17b. ✅ Volym — geometri.html M10 (2026-07-06). Lgr22-gap standardenheter. Nivå 0 = räkna enhetskuber → cm³ (isometrisk kub-stapel med rutnät, volym = l·b·h) · nivå 1 = liter→deciliter (1 l = 10 dl; enliterskartonger i rad) · nivå 2 = jämför fyra behållare i blandade enheter (l/dl/cl), vilken rymmer mest (vätskehöjd ∝ volym + textetikett). Distraktorer: add-i-st-f-mult, bara bottenlagret/en sida, fel enhetsfaktor (cl-faktor för dl), och på nivå 2 en taljämförelse-fälla (stort tal, liten volym). genM10Task + workedSteps case 10 + WHY[10] (nivå 2: "gör om till samma enhet först"). Bygd via /ny-modul: logik+tester grön (3,3M assertions), regression grön, DOM-harness-verifiering (alla 3 ritfunktioner + interaktion + why-panel), /code-review high (0 fynd). **Fable ockulär sign-off 2026-07-06** (granskningsgrid som eval:ar produktionskoden ur geometri.html — geometri.htmls egen rendering gav stale frames i CDP): 3 fynd, alla fixade: (a) kub-stapelns sidoyta saknade djupindelning → k-loop tillagd, alla tre ytor nu fullt kubrutnät; (b) kartongstorlek skalade med antalet (2 l jättelik, 9 l oläslig) → konstant storlek, femgruppering med radbrytning (tiorams-analog); (c) 90 cl vs 1 liter visuellt oskiljbart (90 % vs 100 % fyllnad) → hs-tak 2..7 i logiken (distraktor ≤ 70 % av facit, ny testinvariant).

## Fas 6 — Retrieval- och problemlösningslager (steg 19 KLAR)
19. ✅ problemlösning — problemlosning.html + logic/problemlosning.js (2026-07-06). Elevnära textproblem där METODVAL är det som tränas (starkaste C/D-greppet), inte räkningen — talen hålls små och snälla (dyskalkyli) så svårigheten ligger i vilket räknesätt. Ett module (M1 "Lös problemet"), 3 nivåer konkret→abstrakt med räknesätts-variation INOM nivån (interleaving i miniatyr): nivå 0 = ett-stegs (+, −, ×, ÷) med stödbild (emoji-grupper, katt/pyssel-tema); nivå 1 = två-stegs (× följt av − eller +); nivå 2 = flerstegs (s + g·e) + överflödig information att sålla bort (h st av ett ANNAT föremål, ritas i grå "räknas inte"-ruta). genM1Task lottar generator per nivå (NIVA0/NIVA1/herring). Distraktorer per doktrin, kommenterade: fel räknesätt (add/mult i st f rätt), glömt steg (stannade vid delprodukten p), omvänd riktning, off-by-one, och på nivå 2 "använde överflödig info" (s+p+h). workedSteps bärs i t.we (byggs i generatorn); whyQuestion fast metodval-resonemang (visas bara nivå 2, ~var tredje): korrekt = "använd bara talen som frågan gäller", distraktorer = "räkna ihop alla tal" + "sista talet är svaret". Bilden avslöjar aldrig svaret (div visar total + tomma askar med "?"). Distraktor-doktrinen: ALLA distraktorer resultat av namngivna missuppfattningar, inga slumpnärmissar (svans c±1/c+2/c+3 bara som garanterad reserv). Tester: 3,46M assertions gröna (exakta facit per räknesätt, delbarhet i div, p=g·e i tvåstegs, h ingår ej i herring, alla räknesätt nåbara per nivå, WE 3 steg med facit i sista, WHY 2 distinkta distraktorer). Regression grön. Ockulär: DOM-event-harness (skärmdump hänger i CDP som i vision-passet) — exempel auto-först per nivå, story+4 alternativ, hadError-guard, dubbelklick-block, nivåprogression efter 3 rena, why-panel nivå 2, och emoji-antal per bild exakt (mul=g·e, div=t lösa + g "?"-askar, herring=s+g·e huvud + h annat föremål). /code-review high: 0 fynd. Avvägning: instruktion-en-mening gäller frågan; textproblem är flera korta presens-meningar utan bisats (inneboende i modulen, godkänt av Mats). Byggd via /ny-modul. **Fable ockulär sign-off 2026-07-06, 0 fynd** (granskningsgrid med alla 7 op-typer + kantfall via Brave/Claude-extensionen — preview-panelens skärmdump hängde även mot vit grid, extensionens computer-screenshot fungerade; även modulsidan live-granskad: WE auto-först, fel/rätt-feedback, grå räknas-inte-ruta tydlig, Miso ok, layout matchar övriga sidor). Självständigt innehåll — steg 18 (interleaving, väg A) återanvänder det.

## Fas 8 — första pass (2026-07-03; körs om som slutgrind)
22. ✅ Cross-page-svep på Fable (alla 12 sidor: DOM-probe + skärmdump + konsolkoll, riskordning). Fynd fixade i commit 94cb796 + 0453c00 (PR #1, #3): (a) "Visa mig"-knappen raderades i statistik M1/M3/M4 + algebra M5 — render skrev textContent på hela frågeelementet; frågetext nu i egen span mXQText. (b) statistik M3 grammatik "att den är röda"→"röd" (askSing i logic/statistik.js; hint böjer rätt vid k=1). (c) skala M1 WE "Det är en lika stor."→"Bilden är lika stor." (d) Uppföljning /code-review high: algebra M5:s numrerade fråga låg utanför m5Live → syntes bredvid exemplet (konvention 11a); m5Q flyttad in i m5Live.
25. ✅ Lgr22-avstämning åk 4–6 mot Skolverkets centrala innehåll. Täckt: nästan allt. Gap: median (byggd direkt, se nedan), volym (→ steg 17b), 3D (17), programmering (20), problemlösning (18–19). Detaljer i memory/lgr22_reconciliation_fas8.md.

### Statistik M6 — Median (Lgr22-gap, byggd 2026-07-03)
- ✅ statistik.html M6 + logic/statistik.js genM6Task. 3 nivåer = 3/5/7 tal (alltid udda → median alltid heltal; ingen delning av två mittersta — isolerar färdigheten "sortera → ta mitten", dyskalkyli-anpassat). Datan tvingas oordnad (osorterat mittvärde ≠ median) så sorteringssteget alltid krävs.
- Distraktorer: glömmer sortera (osorterat mittvärde) · förväxlar med medelvärde · största · minsta · off-by-one i sorterad ordning · generisk reserv.
- Fable-fynd åtgärdat: exemplet visade först bara den SORTERADE listan — transformationen demonstrerades inte. Nu bild-först: osorterat → "↓ sortera" → sorterat med [ mitten ] markerad (form+färg); WE steg 1 bär före→efter. Testinvariant för detta.
- /code-review high: 2 fynd fixade (bisats i instruktionen → "Vilket är det mittersta talet i storleksordning?", inaktuell "Alla 5 moduler"-kommentar).
