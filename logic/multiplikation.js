/* ═══════════════════════════════════════════════
   logic/multiplikation.js – ren logik för multiplikation.html (M1–M5)
   SINGMA 5A kap 2: multiplikation och division med hela tal och decimaltal.
   Inga DOM-anrop här. Nivå skickas in som parameter (level: 0,1,2).
   Ritning (SVG) och händelsehantering ligger kvar i multiplikation.html.
   UMD: globala i webbläsaren, module.exports i Node (för tester).
═══════════════════════════════════════════════ */
(function (root, factory) {
    const dep = (typeof require !== 'undefined' && typeof module !== 'undefined')
        ? require('./shared.js') : root;
    const api = factory(dep);
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else Object.assign(root, api);
}(typeof window !== 'undefined' ? window : globalThis, function (shared) {
    const rnd = shared.rnd;

    /* Plockar n distinkta distraktorer ur en kandidatlista (tal eller strängar).
       Hoppar över dubbletter och själva facit. */
    function pickDistractors(correct, candidates, n) {
        n = n || 3;
        const seen = new Set([correct]);
        const out = [];
        for (const c of candidates) {
            if (c === null || c === undefined) continue;
            if (!seen.has(c)) { seen.add(c); out.push(c); }
            if (out.length >= n) break;
        }
        return out;
    }

    /* ════════ Modul 1 – Multiplikation som grupper (array) ════════ */

    function genM1Task(level) {
        const rmax = level === 0 ? 5 : level === 1 ? 6 : 9;
        const rows = rnd(2, rmax), cols = rnd(2, rmax);
        const correct = rows * cols;

        const cand = [
            correct + 1, correct - 1, correct + 2, correct - 2,
            correct + rows, correct - cols, rows + cols,
            correct + cols, correct - rows
        ].filter(v => v > 0 && v !== correct);

        const distractors = pickDistractors(correct, cand);
        return { rows, cols, correct, distractors, label: rows + ' × ' + cols };
    }

    /* ════════ Modul 2 – Multiplikation med hela tal ════════ */

    function genM2Task(level) {
        let a, b;
        if (level === 0)      { a = rnd(2, 9);  b = rnd(2, 9); }
        else if (level === 1) { a = rnd(11, 99); b = rnd(2, 9); }
        else                  { a = rnd(11, 99); b = rnd(11, 30); }

        const correct = a * b;
        const cand = [
            correct + a, correct - a, correct + b, correct - b,
            correct + 10, correct - 10, correct + 1, correct - 1
        ].filter(v => v > 0 && v !== correct);

        const distractors = pickDistractors(correct, cand);
        return { a, b, correct, distractors, label: a + ' × ' + b + ' = ?' };
    }

    /* ════════ Modul 3 – Division med hela tal ════════ */

    function genM3Task(level) {
        if (level < 2) {
            let b, q;
            if (level === 0) { b = rnd(2, 9); q = rnd(2, 9); }
            else             { b = rnd(2, 9); q = rnd(10, 20); }
            const a = b * q;
            const correctStr = '' + q;
            const cand = [q + 1, q - 1, q + 2, q - 2, b, q + 10, q - 10]
                .filter(v => v > 0 && v !== q).map(String);
            return {
                a, b, correctStr, hasRest: false,
                distractors: pickDistractors(correctStr, cand),
                label: a + ' ÷ ' + b + ' = ?'
            };
        }

        /* Nivå 3 – division med rest */
        const b = rnd(3, 9), q = rnd(2, 9), r = rnd(1, b - 1);
        const a = b * q + r;
        const correctStr = q + ' rest ' + r;
        const cand = [];
        [q + 1, q, q - 1].forEach(qq => {
            [r, r + 1, r - 1].forEach(rr => {
                if (qq > 0 && rr >= 0 && rr < b) cand.push(qq + ' rest ' + rr);
            });
        });
        return {
            a, b, correctStr, hasRest: true,
            distractors: pickDistractors(correctStr, cand),
            label: a + ' ÷ ' + b + ' = ?'
        };
    }

    /* ════════ Modul 4 – Multiplicera och dividera med 10, 100, 1000 ════════ */

    /* Formaterar ett tal givet i hundradelar (heltal) till svensk sträng
       utan onödiga nollor. T.ex. 250 -> "2,5", 2500 -> "25", 25 -> "0,25". */
    function fmtH(h) {
        const whole = Math.floor(h / 100);
        const rem   = h % 100;
        if (rem === 0) return '' + whole;
        const digits = String(rem).padStart(2, '0').replace(/0+$/, '');
        return whole + ',' + digits;
    }

    function genM4Task(level) {
        let label, hC, hIn;

        if (level === 0) {
            const base = rnd(2, 99);
            const pow  = Math.random() < 0.5 ? 10 : 100;
            hIn = base * 100; hC = hIn * pow;
            label = base + ' × ' + pow + ' = ?';

        } else if (level === 1) {
            if (Math.random() < 0.5) {
                const pow = Math.random() < 0.5 ? 10 : 100;
                const q   = rnd(2, 99);
                hIn = q * pow * 100; hC = hIn / pow;
                label = (q * pow) + ' ÷ ' + pow + ' = ?';
            } else {
                const base = rnd(2, 20);
                hIn = base * 100; hC = hIn * 1000;
                label = base + ' × 1000 = ?';
            }

        } else {
            const mode = rnd(0, 2);
            if (mode === 0) {                 /* decimaltal × 10 (en decimal in) */
                hIn = rnd(1, 49) * 10; hC = hIn * 10;
                label = fmtH(hIn) + ' × 10 = ?';
            } else if (mode === 1) {          /* decimaltal × 100 */
                hIn = rnd(1, 99); hC = hIn * 100;
                label = fmtH(hIn) + ' × 100 = ?';
            } else {                          /* decimaltal ÷ 10 (komma flyttar vänster) */
                hIn = rnd(1, 99) * 10; hC = hIn / 10;
                label = fmtH(hIn) + ' ÷ 10 = ?';
            }
        }

        const correctStr = fmtH(hC);
        const cand = [
            hC * 10, hIn, (hC % 10 === 0 ? hC / 10 : null),
            hC * 100, hC * 2, hC * 5, hC * 20
        ].filter(v => v !== null && v > 0 && v !== hC).map(fmtH);

        return { label, correctStr, distractors: pickDistractors(correctStr, cand) };
    }

    /* ════════ Modul 5 – Multiplikation och division med decimaltal ════════ */

    /* Formaterar tiondelar (heltal) till svensk sträng. 6 -> "0,6", 42 -> "4,2", 20 -> "2". */
    function fmtT(t) {
        const whole = Math.floor(t / 10);
        const r     = t % 10;
        return r === 0 ? '' + whole : whole + ',' + r;
    }

    function genM5Task(level) {
        let label, correctT, inputStr;

        if (level === 0) {                    /* 0,a × b */
            const a = rnd(1, 9), b = rnd(2, 9);
            correctT = a * b; inputStr = '0,' + a;
            label = inputStr + ' × ' + b + ' = ?';

        } else if (level === 1) {             /* x,y × b (med växling) */
            const v = rnd(11, 49), b = rnd(2, 6);
            correctT = v * b; inputStr = fmtT(v);
            label = inputStr + ' × ' + b + ' = ?';

        } else {                              /* decimaltal ÷ b (jämnt) */
            const b = rnd(2, 6), q = rnd(2, 15);
            correctT = q; inputStr = fmtT(q * b);
            label = inputStr + ' ÷ ' + b + ' = ?';
        }

        const correctStr = fmtT(correctT);
        const cand = [1, -1, 2, -2, 10, -10, 3, -3, 5, -5]
            .map(d => correctT + d)
            .filter(v => v > 0 && v !== correctT)
            .map(fmtT);

        return { label, correctStr, distractors: pickDistractors(correctStr, cand) };
    }

    /* ════════ Mönster v2, lager 11a + 11c ════════
       workedSteps(mod, task): 3 stegrader (löst exempel).
       whyQuestion(mod, task): "Varför stämmer det?" + 1 korrekt + 2 distraktorer
       enligt distraktor-doktrinen. Ren text, testas som vanligt. */

    function workedSteps(mod, t) {
        switch (mod) {
            case 1:
                return [
                    t.rows + ' × ' + t.cols + ' betyder ' + t.rows + ' rader med ' + t.cols + ' i varje.',
                    'Räkna alla prickar: ' + t.rows + ' grupper om ' + t.cols + '.',
                    t.rows + ' × ' + t.cols + ' = ' + t.correct + '.'
                ];
            case 2:
                return [
                    'Multiplikation är upprepad addition: ' + t.a + ' taget ' + t.b + ' gånger.',
                    'Dela upp det större talet om det blir lättare att räkna.',
                    t.a + ' × ' + t.b + ' = ' + t.correct + '.'
                ];
            case 3:
                return [
                    'Dela upp ' + t.a + ' i lika stora grupper om ' + t.b + '.',
                    t.hasRest
                        ? 'Det blir några hela grupper och en rest som blir över.'
                        : 'Räkna hur många hela grupper det blir.',
                    t.a + ' ÷ ' + t.b + ' = ' + t.correctStr + '.'
                ];
            case 4:
                return [
                    'Räkna ' + t.label.replace(' = ?', '') + '.',
                    'Vid × flyttar kommat åt höger, vid ÷ åt vänster — lika många steg som nollor.',
                    'Svaret är ' + t.correctStr + '.'
                ];
            case 5:
                return [
                    'Räkna ' + t.label.replace(' = ?', '') + '.',
                    'Räkna som med heltal först, sätt sedan tillbaka kommat.',
                    'Svaret är ' + t.correctStr + '.'
                ];
            default:
                return [];
        }
    }

    const WHY = {
        1: {
            correct: 'Multiplikation är rader gånger antal i varje rad.',
            distractors: [
                'Man lägger ihop raderna och kolumnerna.',         // adderar i stället (rows+cols)
                'Man räknar bara en rad.'                          // delberäkning
            ]
        },
        2: {
            correct: 'Multiplikation är upprepad addition — talet taget flera gånger.',
            distractors: [
                'Man adderar de två talen.',                       // fel räknesätt (a+b)
                'Man räknar bara det större talet.'                // delberäkning
            ]
        },
        3: {
            correct: 'Division delar upp talet i lika stora grupper.',
            distractors: [
                'Division är samma som att lägga ihop talen.',     // fel räknesätt
                'Resten kan vara större än talet man delar med.'   // ogiltig rest
            ]
        },
        4: {
            correct: 'Kommat flyttar lika många steg som det finns nollor.',
            distractors: [
                'Man lägger bara till nollor i slutet.',           // funkar ej för decimaltal
                'Kommat flyttar alltid åt höger.'                  // omvänd riktning vid ÷
            ]
        },
        5: {
            correct: 'Räkna som med heltal och sätt sedan tillbaka kommat.',
            distractors: [
                'Man räknar heltalen och struntar i kommat i svaret.', // tappar kommat
                'Man multiplicerar bara siffran före kommat.'          // delberäkning
            ]
        }
    };

    function whyQuestion(mod, t) {
        const w = WHY[mod];
        return { prompt: 'Varför stämmer det?', correct: w.correct, distractors: w.distractors.slice() };
    }

    return {
        pickDistractors,
        genM1Task,
        genM2Task,
        genM3Task,
        fmtH, genM4Task,
        fmtT, genM5Task,
        workedSteps, whyQuestion
    };
}));
