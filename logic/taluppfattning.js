/* ═══════════════════════════════════════════════
   logic/taluppfattning.js – ren logik för taluppfattning.html (M1–M8)
   Inga DOM-anrop. Nivå skickas in som parameter där det behövs.
   Display/ritning (posLabel, posPlace, formatNum, fmtSeq, drawM7) ligger
   kvar i taluppfattning.html.
   UMD: globala i webbläsaren, module.exports i Node (för tester).
═══════════════════════════════════════════════ */
(function (root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else Object.assign(root, api);
}(typeof window !== 'undefined' ? window : globalThis, function () {

    /* Heltal i [a, b] (lokal hjälpare; övriga moduler använder Math.random direkt). */
    function rnd(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

    /* ════════ Modul 1 & 2 – positionssystemet ════════ */

    function makeDistractors(digitVal, posValue, numStr, pos, correct) {
        const seen = new Set([correct]);
        const result = [];
        function add(v) {
            if (result.length >= 3) return;
            const n = Math.round(v);
            if (n > 0 && Number.isInteger(v) && !seen.has(n)) { seen.add(n); result.push(n); }
        }
        add(digitVal);
        add(digitVal * posValue * 10);
        if (pos + 1 < numStr.length) add(parseInt(numStr.slice(pos, pos + 2)));
        if (pos > 0)                 add(parseInt(numStr.slice(pos - 1, pos + 1)));
        add(digitVal * posValue / 10);
        add(digitVal * posValue * 100);
        add(digitVal * posValue / 100);
        /* Säkerhetsnät: garantera alltid 3 distraktorer (annars < 4 alternativ) */
        for (let ex = 1; result.length < 3; ex++) {
            const v = correct + posValue * ex;
            if (v > 0 && !seen.has(v)) { seen.add(v); result.push(v); }
        }
        return result;
    }

    function genM1Task() {
        const use3 = Math.random() < 0.5;
        const num  = use3
            ? Math.floor(Math.random() * 900) + 100
            : Math.floor(Math.random() * 90)  + 10;
        const numStr = String(num);
        const len    = numStr.length;

        let pos, attempts = 0;
        do {
            pos = Math.floor(Math.random() * len);
            attempts++;
        } while (attempts < 50 && (numStr[pos] === '0' || numStr.split(numStr[pos]).length > 2));

        const digitVal = parseInt(numStr[pos], 10);
        const posValue = Math.pow(10, len - 1 - pos);
        const correct  = digitVal * posValue;
        const distractors = makeDistractors(digitVal, posValue, numStr, pos, correct);

        return { numStr, len, pos, digitVal, posValue, correct, distractors };
    }

    function genM2Task() {
        const digits = Math.floor(Math.random() * 3) + 4;
        let num;
        if (digits === 4)      num = Math.floor(Math.random() * 9000)   + 1000;
        else if (digits === 5) num = Math.floor(Math.random() * 90000)  + 10000;
        else                   num = Math.floor(Math.random() * 900000) + 100000;

        const numStr = String(num);
        const len    = numStr.length;

        let pos, attempts = 0;
        do {
            pos = Math.floor(Math.random() * len);
            attempts++;
        } while (attempts < 50 && (numStr[pos] === '0' || numStr.split(numStr[pos]).length > 2));

        const digitVal = parseInt(numStr[pos], 10);
        const posValue = Math.pow(10, len - 1 - pos);
        const correct  = digitVal * posValue;
        const distractors = makeDistractors(digitVal, posValue, numStr, pos, correct);

        return { numStr, len, pos, digitVal, posValue, correct, distractors };
    }

    /* ════════ Modul 3 – talföljder ════════ */

    const M3_LEVELS = [
        { steps: [10, 100] },
        { steps: [1000, 10000] },
        { steps: [100000] }
    ];

    function genM3Task(level) {
        const cfg  = M3_LEVELS[level];
        const step = cfg.steps[Math.floor(Math.random() * cfg.steps.length)];
        const len  = Math.random() < 0.5 ? 3 : 4;

        const startK  = Math.floor(Math.random() * 8) + 1;
        const offset  = level === 2
            ? (Math.floor(Math.random() * 9) + 1) * (step / 20)
            : 0;
        const start = step * startK + offset;

        const series = Array.from({ length: len }, (_, i) => start + step * i);

        const missingIdx = Math.floor(Math.random() * len);
        const correct    = series[missingIdx];

        const distCands = [
            correct + step, correct - step,
            correct + 2 * step, correct - 2 * step
        ].filter(v => v > 0 && v !== correct);

        for (let i = distCands.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [distCands[i], distCands[j]] = [distCands[j], distCands[i]];
        }
        let ex = 3;
        while (distCands.length < 2) { distCands.push(correct + step * ex++); }

        return { series, missingIdx, correct, step, distractors: distCands.slice(0, 2) };
    }

    /* ════════ Modul 4 – jämföra tal ════════ */

    const M4_LEVELS = [
        { min: 10,     max: 999,    deltaMin: 10,   deltaMax: 90    },
        { min: 1000,   max: 99999,  deltaMin: 50,   deltaMax: 1000  },
        { min: 100000, max: 999999, deltaMin: 1000, deltaMax: 50000 }
    ];

    function genM4Task(level) {
        const cfg = M4_LEVELS[level];

        const safeMin = cfg.min + cfg.deltaMax;
        const safeMax = cfg.max - cfg.deltaMax;
        const A = Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;

        const delta = Math.floor(Math.random() * (cfg.deltaMax - cfg.deltaMin + 1)) + cfg.deltaMin;
        const B     = Math.random() < 0.5 ? A + delta : A - delta;

        const correct = Math.max(A, B);
        return { A, B, correct };
    }

    /* ════════ Modul 5 – läsa tal ════════ */

    const M5_LEVELS = [
        { min: 10,     max: 999    },
        { min: 1000,   max: 99999  },
        { min: 100000, max: 999999 }
    ];

    const SV_ONES = ['', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio',
                     'tio', 'elva', 'tolv', 'tretton', 'fjorton', 'femton', 'sexton',
                     'sjutton', 'arton', 'nitton'];
    const SV_TENS = ['', '', 'tjugo', 'trettio', 'fyrtio', 'femtio', 'sextio', 'sjuttio', 'åttio', 'nittio'];

    function numToSv(n) {
        if (n === 0) return '';
        if (n < 20)  return SV_ONES[n];
        if (n < 100) return SV_TENS[Math.floor(n / 10)] + (n % 10 !== 0 ? SV_ONES[n % 10] : '');
        if (n < 1000) {
            const h   = Math.floor(n / 100);
            const rem = n % 100;
            return (h === 1 ? 'en' : SV_ONES[h]) + 'hundra' + (rem ? numToSv(rem) : '');
        }
        const th  = Math.floor(n / 1000);
        const rem = n % 1000;
        const thW = th === 1 ? 'ett' : numToSv(th);
        return thW + 'tusen' + (rem ? numToSv(rem) : '');
    }

    function genM5Task(level) {
        const cfg = M5_LEVELS[level];
        const n   = Math.floor(Math.random() * (cfg.max - cfg.min + 1)) + cfg.min;

        const distractors = [];
        const seen   = new Set([n]);
        const digits = String(n).split('').map(Number);
        const len    = digits.length;

        for (let i = 0; i < len - 1 && distractors.length < 3; i++) {
            if (digits[i] !== digits[i + 1]) {
                const sw = [...digits];
                [sw[i], sw[i + 1]] = [sw[i + 1], sw[i]];
                if (sw[0] !== 0) {
                    const c = parseInt(sw.join(''));
                    if (!seen.has(c) && c >= cfg.min && c <= cfg.max) {
                        distractors.push(c); seen.add(c);
                    }
                }
            }
        }

        const positions = Array.from({ length: len }, (_, i) => i).sort(() => Math.random() - 0.5);
        outer:
        for (const pos of positions) {
            for (const delta of [1, -1, 2, -2, 3, -3]) {
                const nd = digits[pos] + delta;
                if (nd < 0 || nd > 9 || (pos === 0 && nd === 0)) continue;
                const nd2 = [...digits]; nd2[pos] = nd;
                const c   = parseInt(nd2.join(''));
                if (!seen.has(c) && c >= cfg.min && c <= cfg.max) {
                    distractors.push(c); seen.add(c);
                    if (distractors.length >= 3) break outer;
                }
            }
        }

        let att = 0;
        while (distractors.length < 3 && att++ < 300) {
            const r = Math.floor(Math.random() * (cfg.max - cfg.min + 1)) + cfg.min;
            if (!seen.has(r)) { distractors.push(r); seen.add(r); }
        }

        return { n, word: numToSv(n), distractors: distractors.slice(0, 3) };
    }

    /* ════════ Modul 6 – avrundning ════════ */

    const M6_LEVELS = [
        { label: 'närmaste tiotal',    step: 10,   min: 11,   max: 999   },
        { label: 'närmaste hundratal', step: 100,  min: 101,  max: 9999  },
        { label: 'närmaste tusental',  step: 1000, min: 1001, max: 99999 }
    ];

    function genM6Task(level) {
        const cfg = M6_LEVELS[level];

        let n;
        do {
            n = Math.floor(Math.random() * (cfg.max - cfg.min + 1)) + cfg.min;
        } while (n % cfg.step === 0);

        const flr      = Math.floor(n / cfg.step) * cfg.step;
        const cel      = Math.ceil(n / cfg.step) * cfg.step;
        const correct  = (n % cfg.step >= cfg.step / 2) ? cel : flr;
        const wrongDir = (correct === flr) ? cel : flr;

        const wrongSteps = cfg.step === 10
            ? [Math.round(n / 100) * 100,   Math.round(n / 1000) * 1000]
            : cfg.step === 100
            ? [Math.round(n / 10) * 10,     Math.round(n / 1000) * 1000]
            : [Math.round(n / 100) * 100,   Math.round(n / 10000) * 10000];

        const seen = new Set([correct, n]);
        const distractors = [];
        for (const v of [wrongDir, correct - cfg.step, correct + cfg.step, ...wrongSteps]) {
            if (v > 0 && !seen.has(v)) { seen.add(v); distractors.push(v); }
            if (distractors.length >= 3) break;
        }
        let extra = 2;
        while (distractors.length < 3) {
            const v = correct + cfg.step * extra++;
            if (!seen.has(v)) { seen.add(v); distractors.push(v); }
        }

        return { n, correct, distractors: distractors.slice(0, 3), cfg };
    }

    /* ════════ Modul 7 – negativa tal på tallinjen ════════ */

    const M7_LEVELS = [
        { range: 11, offset: 5,  rangeMin: -5,  rangeMax: 5,  anchors: [-5, 0, 5]    },
        { range: 21, offset: 10, rangeMin: -10, rangeMax: 10, anchors: [-10, 0, 10] },
        { range: 21, offset: 10, rangeMin: -10, rangeMax: 10, anchors: [0]           }
    ];

    function genM7Distractors(correct, rangeMin, rangeMax) {
        const minSep = (rangeMax - rangeMin) > 10 ? 2 : 1;
        const seen = new Set([correct]);
        const result = [];
        for (let d = minSep; d <= 15 && result.length < 3; d++) {
            for (const sign of [1, -1]) {
                const candidate = correct + sign * d;
                if (candidate < rangeMin || candidate > rangeMax || seen.has(candidate)) continue;
                let ok = true;
                if (minSep > 1) {
                    for (const x of seen) {
                        if (Math.abs(x - candidate) < minSep) { ok = false; break; }
                    }
                }
                if (ok) { seen.add(candidate); result.push(candidate); }
                if (result.length >= 3) break;
            }
        }
        return result;
    }

    function genM7Task(level) {
        const cfg = M7_LEVELS[level];
        const target = Math.floor(Math.random() * cfg.range) - cfg.offset;
        const distractors = genM7Distractors(target, cfg.rangeMin, cfg.rangeMax);
        const allPositions = [target, ...distractors];
        for (let i = allPositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allPositions[i], allPositions[j]] = [allPositions[j], allPositions[i]];
        }
        const correctPt = allPositions.indexOf(target) + 1;
        return { target, rangeMin: cfg.rangeMin, rangeMax: cfg.rangeMax, anchors: cfg.anchors, allPositions, correctPt };
    }

    /* ════════ Modul 8 – jämföra negativa tal ════════ */

    function genM8Task(level) {
        let numbers, correct;
        if (level === 0) {
            const neg = -(Math.floor(Math.random() * 9) + 1);
            const pos =   Math.floor(Math.random() * 9) + 1;
            numbers = [neg, pos];
            correct = Math.max(neg, pos);
        } else if (level === 1) {
            let a = -(Math.floor(Math.random() * 9) + 1);
            let b;
            do { b = -(Math.floor(Math.random() * 9) + 1); } while (b === a);
            numbers = [a, b];
            correct = Math.max(a, b);
        } else {
            const a = -(Math.floor(Math.random() * 9) + 1);
            let b, c;
            do { b = Math.floor(Math.random() * 19) - 9; } while (b === a);
            do { c = Math.floor(Math.random() * 19) - 9; } while (c === a || c === b);
            numbers = [a, b, c];
            correct = Math.max(a, b, c);
        }
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
        return { numbers, correct };
    }

    /* ════════ Modul 9 – Överslagsräkning (avrunda och uppskatta) ════════ */

    function genM9Task(level) {
        const roundTo = level === 0 ? 10 : 100;
        let parts;
        if (level === 0)      parts = [rnd(21, 89), rnd(21, 89)];
        else if (level === 1) parts = [rnd(120, 880), rnd(120, 880)];
        else                  parts = [rnd(120, 880), rnd(120, 880), rnd(120, 880)];

        const exact   = parts.reduce((s, x) => s + x, 0);
        const rounded = parts.map(x => Math.round(x / roundTo) * roundTo);
        const est     = rounded.reduce((s, x) => s + x, 0);

        const seen = new Set([est]);
        const distractors = [];
        for (const d of [est + roundTo, est - roundTo, est + 2 * roundTo, est - 2 * roundTo]) {
            if (d > 0 && !seen.has(d)) { seen.add(d); distractors.push(d); }
            if (distractors.length >= 3) break;
        }
        return { parts, roundTo, rounded, exact, est, correct: est, distractors: distractors.slice(0, 3) };
    }

    /* ════════ Modul 10 – Romerska siffror (läsa) ════════ */

    function toRoman(n) {
        const map = [[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
        let s = '', x = n;
        for (const [v, sym] of map) { while (x >= v) { s += sym; x -= v; } }
        return s;
    }

    function genM10Task(level) {
        const min = level === 0 ? 1  : level === 1 ? 21 : 51;
        const max = level === 0 ? 20 : level === 1 ? 50 : 100;
        const n = rnd(min, max);
        const seen = new Set([n]);
        const distractors = [];
        for (const d of [n + 1, n - 1, n + 2, n - 2, n + 10, n - 10, n + 5]) {
            if (d > 0 && !seen.has(d)) { seen.add(d); distractors.push(d); }
            if (distractors.length >= 3) break;
        }
        return { n, roman: toRoman(n), correct: n, distractors: distractors.slice(0, 3) };
    }

    /* ════════ Mönster v2, lager 11a + 11c – delad logik per modul ════════
       workedSteps(mod, task): exakt 3 stegrader (löst exempel).
       whyQuestion(mod, task): "Varför stämmer det?" + 1 korrekt + 2 distraktorer
       enligt distraktor-doktrinen. Ren text, testas som vanligt. */

    const PLACE_NAME = {
        1: 'entalsplatsen', 10: 'tiotalsplatsen', 100: 'hundratalsplatsen',
        1000: 'tusentalsplatsen', 10000: 'tiotusentalsplatsen', 100000: 'hundratusentalsplatsen'
    };

    function workedSteps(mod, t) {
        switch (mod) {
            case 1:
            case 2:
                return [
                    'Siffran ' + t.digitVal + ' står på ' + PLACE_NAME[t.posValue] + '.',
                    'Där är varje siffra värd ' + t.posValue + '.',
                    t.digitVal + ' × ' + t.posValue + ' = ' + t.correct + '.'
                ];
            case 3:
                return [
                    'Talen ändras lika mycket varje steg: ' + t.step + '.',
                    'Vid luckan lägger du till (eller drar bort) ' + t.step + '.',
                    'Det saknade talet är ' + t.correct + '.'
                ];
            case 4:
                return [
                    'Jämför talen siffra för siffra från vänster.',
                    'Det tal som har en större siffra först är störst.',
                    t.correct + ' är störst.'
                ];
            case 5:
                return [
                    'Dela upp talet i tusental, hundratal, tiotal och ental.',
                    'Säg varje del och sätt ihop dem till ett ord.',
                    t.n + ' uttalas "' + t.word + '".'
                ];
            case 6:
                return [
                    'Du ska avrunda ' + t.n + ' till ' + t.cfg.label + '.',
                    'Är resten minst halva steget (' + (t.cfg.step / 2) + ')? Avrunda uppåt, annars nedåt.',
                    t.n + ' avrundas till ' + t.correct + '.'
                ];
            case 7:
                return [
                    'Börja vid 0 på tallinjen.',
                    t.target < 0
                        ? 'Gå ' + (-t.target) + ' steg åt vänster (minus).'
                        : (t.target > 0 ? 'Gå ' + t.target + ' steg åt höger.' : 'Stå kvar på 0.'),
                    'Talet ' + t.target + ' ligger på Punkt ' + t.correctPt + '.'
                ];
            case 8:
                return [
                    'Tänk på tallinjen: längre åt höger = större.',
                    'Positiva tal är störst; av två negativa är den närmast 0 störst.',
                    t.correct + ' är störst.'
                ];
            case 9:
                return [
                    'Avrunda varje tal till närmaste ' + (t.roundTo === 10 ? 'tiotal' : 'hundratal') +
                        ': ' + t.parts.join(', ') + ' ≈ ' + t.rounded.join(', ') + '.',
                    'Lägg ihop de avrundade talen: ' + t.rounded.join(' + ') + '.',
                    'Överslaget är ungefär ' + t.est + '.'
                ];
            case 10:
                return [
                    'Romerska siffror: I = 1, V = 5, X = 10, L = 50, C = 100.',
                    'Räkna ihop tecknen (ett mindre tecken före ett större betyder minus).',
                    t.roman + ' är ' + t.n + '.'
                ];
            default:
                return [];
        }
    }

    const WHY = {
        1: {
            correct: 'Siffrans värde = siffran gånger platsens värde.',
            distractors: [
                'Siffrans värde är samma som siffran själv.',          // ignorerar positionen
                'Man räknar platsernas värde från vänster med 1.'      // fel riktning
            ]
        },
        3: {
            correct: 'Skillnaden mellan talen är lika stor hela tiden.',
            distractors: [
                'Man lägger till en siffra varje gång.',               // förväxlar steg med siffra
                'Talen ökar olika mycket i varje steg.'                // missar mönstret
            ]
        },
        4: {
            correct: 'Talet med en större siffra först (från vänster) är störst.',
            distractors: [
                'Talet med störst sista siffra är störst.',            // fel position
                'Det tal som har färst siffror är störst.'             // omvänd riktning
            ]
        },
        5: {
            correct: 'Man läser talet i grupper: tusental, hundratal, tiotal, ental.',
            distractors: [
                'Man läser bara den första siffran.',                  // delberäkning
                'Siffrornas ordning spelar ingen roll.'                // ignorerar position
            ]
        },
        6: {
            correct: 'Är resten minst halva steget avrundar man uppåt, annars nedåt.',
            distractors: [
                'Man avrundar alltid uppåt.',                          // glömt regeln
                'Man tittar på första siffran i talet.'                // fel siffra
            ]
        },
        7: {
            correct: 'Minus betyder steg åt vänster om 0, plus åt höger.',
            distractors: [
                'Minus betyder steg åt höger om 0.',                   // omvänd riktning
                'Talet ligger lika långt åt höger oavsett tecken.'     // ignorerar minus
            ]
        },
        8: {
            correct: 'Ju längre åt höger på tallinjen, desto större tal.',
            distractors: [
                'Ju större siffra (utan tecken), desto större tal.',   // ignorerar minustecknet
                'Negativa tal är alltid större än positiva.'           // omvänd riktning
            ]
        },
        9: {
            correct: 'Man avrundar talen först och räknar sedan med de enkla talen.',
            distractors: [
                'Man räknar exakt och avrundar svaret sist.',          // missar poängen med överslag
                'Man avrundar alltid uppåt.'                           // fel avrundningsregel
            ]
        },
        10: {
            correct: 'Ett mindre tecken före ett större betyder minus (IV = 5 − 1).',
            distractors: [
                'Tecknen läggs alltid ihop, aldrig minus.',            // missar subtraktiv notation
                'Romerska siffror läses från höger till vänster.'      // fel läsriktning
            ]
        }
    };
    WHY[2] = WHY[1];   // M2 = samma positionsresonemang som M1

    function whyQuestion(mod, t) {
        const w = WHY[mod];
        return { prompt: 'Varför stämmer det?', correct: w.correct, distractors: w.distractors.slice() };
    }

    return {
        makeDistractors, genM1Task, genM2Task,
        M3_LEVELS, genM3Task,
        M4_LEVELS, genM4Task,
        M5_LEVELS, SV_ONES, SV_TENS, numToSv, genM5Task,
        M6_LEVELS, genM6Task,
        M7_LEVELS, genM7Distractors, genM7Task,
        genM8Task,
        genM9Task,
        toRoman, genM10Task,
        PLACE_NAME, workedSteps, whyQuestion
    };
}));
