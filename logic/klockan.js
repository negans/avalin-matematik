/* ═══════════════════════════════════════════════
   logic/klockan.js – ren logik för klockan.html
   Klockans övriga logik (validering av inmatning) är DOM-bunden och
   ligger kvar i klockan.html. Här finns bara den rena vinkelmatematiken.
   UMD: global i webbläsaren, module.exports i Node (för tester).
═══════════════════════════════════════════════ */
(function (root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else Object.assign(root, api);
}(typeof window !== 'undefined' ? window : globalThis, function () {

    /* Vinkel (grader, medurs från 12) för tim- och minutvisare vid tiden h:m.
       Timvisaren rör sig kontinuerligt med minuterna. */
    function clockHandAngles(h, m) {
        return {
            hrDeg:  ((h % 12) + m / 60) / 12 * 360,
            minDeg: m / 60 * 360
        };
    }

    function pad(n) { return String(n).padStart(2, '0'); }

    /* ════════ Mönster v2, lager 11a – löst exempel (steg för steg) ════════
       Tre rader för tiden h:m, ETT steg per rad. Konkret → symbolisk:
       HTML visar klockan (bilden), dessa rader bär läsningen. */

    /* Minutsteget. m = 0 hanteras särskilt (visaren pekar rakt upp på 12). */
    function minuteStep(m) {
        if (m === 0) return 'Den långa visaren pekar rakt upp på 12. Det betyder 0 minuter.';
        return 'Den långa visaren pekar på ' + (m / 5) + '. ' + (m / 5) + ' × 5 = ' + m + ' minuter.';
    }

    function workedSteps(h, m) {
        return [
            'Den korta visaren har precis passerat ' + h + '. Timmen är ' + h + '.',
            minuteStep(m),
            'Klockan är ' + h + ':' + pad(m) + '.'
        ];
    }

    /* ════════ Mönster v2, lager 11c – resonemang ("Varför stämmer det?") ════════
       En korrekt resonemangsrad + 2 distraktorer enligt distraktor-doktrinen:
       omvänd riktning (visarna förväxlade) och delberäkning (minut = siffran rakt av). */
    function whyQuestion(h, m) {
        return {
            prompt: 'Varför stämmer det?',
            correct: 'Den korta visaren visar timmen, den långa visar minuterna (siffran × 5).',
            distractors: [
                'Den långa visaren visar timmen, den korta visar minuterna.',   // visarna förväxlade
                'Minuterna är samma som siffran den långa visaren pekar på.'     // delberäkning (glömd ×5)
            ]
        };
    }

    /* ════════ Modul 2 – säg klockan i ord ════════
       Vardaglig svensk tidsangivelse ("halv fem", "kvart i tre") för alla
       m ∈ {0,5,...,55}. Egen modul med egna 3 nivåer (konkret → abstrakt),
       oberoende av Modul 1:s klocka – precis som andra sidors moduler. */

    const HOUR_WORD = ['', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex',
                        'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv'];

    /* Håller timmen i 1–12 (wrap 12→1, 0→12). */
    function wrapH(x) { return ((x - 1 + 12) % 12) + 1; }

    function timeToSv(h, m) {
        const nextH = wrapH(h + 1);
        if (m === 0)  return 'Klockan är ' + HOUR_WORD[h];
        if (m === 30) return 'Halv ' + HOUR_WORD[nextH];
        if (m === 15) return 'Kvart över ' + HOUR_WORD[h];
        if (m === 45) return 'Kvart i ' + HOUR_WORD[nextH];
        if (m === 25) return 'Fem i halv ' + HOUR_WORD[nextH];
        if (m === 35) return 'Fem över halv ' + HOUR_WORD[nextH];
        if (m < 30) {
            const word = m === 5 ? 'Fem' : m === 10 ? 'Tio' : 'Tjugo';
            return word + ' över ' + HOUR_WORD[h];
        }
        const word = m === 40 ? 'Tjugo' : m === 50 ? 'Tio' : 'Fem';
        return word + ' i ' + HOUR_WORD[nextH];
    }

    /* 3 distraktorer enligt distraktor-doktrinen: riktning fel, fel timme (off-by-one),
       delberäkning (minuterna glöms). Vid m=0/30 skulle "fel timme" annars bli en
       ordagrann dubblett av riktnings-raden (båda reducerar till samma HOUR_WORD) –
       då används två steg bort (h∓2) i stället så alla tre alltid är distinkta
       (verifierat för alla h∈1–12, m∈{0,5,...,55} i tests/test.js). */
    function sayDistractors(h, m) {
        const correct = timeToSv(h, m);
        const seen = new Set([correct]);
        const result = [];
        function add(phrase) {
            if (phrase && !seen.has(phrase)) { seen.add(phrase); result.push(phrase); }
        }

        const wholeOrHalf = m === 0 || m === 30;

        if (m === 0) {
            add(timeToSv(wrapH(h + 1), 0));               // fel granntimme
        } else if (m === 30) {
            add('Halv ' + HOUR_WORD[h]);                    // halv pekar bakåt i stället för framåt
        } else {
            add(timeToSv(h, (60 - m) % 60));                // i/över (eller halv-riktning) omvänd
        }

        add(timeToSv(wrapH(h - (wholeOrHalf ? 2 : 1)), m)); // fel timme, samma minutform

        if (m !== 0) add('Klockan är ' + HOUR_WORD[h]);     // delberäkning: minuterna glöms
        else         add(timeToSv(wrapH(h + 2), 0));        // ytterligare fel granntimme (m=0 har inget att glömma)

        return result;
    }

    /* 3 nivåer, konkret → abstrakt: styr vilka minutvärden som lottas. */
    const SAY_LEVELS = [
        { minutes: [0, 30] },
        { minutes: [0, 15, 30, 45] },
        { minutes: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] }
    ];

    function genSayTask(level) {
        const cfg = SAY_LEVELS[level];
        const h = Math.floor(Math.random() * 12) + 1;
        const m = cfg.minutes[Math.floor(Math.random() * cfg.minutes.length)];
        return { h, m, correct: timeToSv(h, m), distractors: sayDistractors(h, m) };
    }

    /* Löst exempel (Mönster v2, lager 11a) – 3 steg: vad minuterna betyder,
       vilken timme frasen pekar mot (nuvarande vs nästa), facit. */
    const MINUTE_LABEL = {
        0: 'hel timme', 5: "'fem över'", 10: "'tio över'", 15: "'kvart över'",
        20: "'tjugo över'", 25: "'fem i halv'", 30: "'halv'", 35: "'fem över halv'",
        40: "'tjugo i'", 45: "'kvart i'", 50: "'tio i'", 55: "'fem i'"
    };
    function sayWorkedSteps(h, m) {
        const nextH = wrapH(h + 1);
        const usesNextHour = m >= 25;
        return [
            m === 0
                ? 'Klockan är jämnt – ingen minutdel att uttala.'
                : 'Minuterna är ' + m + ' – det uttalas ' + MINUTE_LABEL[m] + '.',
            usesNextHour
                ? '"Halv"/"i" pekar mot NÄSTA timme: ' + nextH + '.'
                : 'Timmen är ' + h + '.',
            'Klockan ' + h + ':' + pad(m) + ' sägs "' + timeToSv(h, m) + '".'
        ];
    }

    /* "Varför?" (Mönster v2, lager 11c) – bara toppnivån, oberoende av h/m. */
    function sayWhyQuestion() {
        return {
            prompt: 'Varför stämmer det?',
            correct: '"Halv" och "i" pekar framåt mot nästa hela timme.',
            distractors: [
                '"Halv" och "i" pekar bakåt mot timmen som varit.',   // omvänd riktning
                'Det spelar ingen roll vilken timme man säger.'        // ignorerar regeln
            ]
        };
    }

    return {
        clockHandAngles, pad, minuteStep, workedSteps, whyQuestion,
        HOUR_WORD, timeToSv, sayDistractors,
        SAY_LEVELS, genSayTask, sayWorkedSteps, sayWhyQuestion
    };
}));
