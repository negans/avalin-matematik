/* ═══════════════════════════════════════════════
   logic/statistik.js – ren logik för statistik.html (M1–M5)
   SINGMA 5B kap 6: diagram, medelvärde, sannolikhet, kombinatorik, typvärde.
   Inga DOM-anrop här. Nivå skickas in som parameter (level: 0,1,2).
   Ritning (SVG) och händelsehantering ligger kvar i statistik.html.
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

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = rnd(0, i);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /* Vanligaste värdet om det är unikt, annars null. */
    function uniqueMode(arr) {
        const freq = {};
        arr.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
        let best = null, bestC = 0, tie = false;
        for (const k in freq) {
            if (freq[k] > bestC) { best = +k; bestC = freq[k]; tie = false; }
            else if (freq[k] === bestC) { tie = true; }
        }
        return tie ? null : best;
    }

    /* ════════ Modul 1 – Läsa stapeldiagram ════════ */

    const M1_CATS = ['Katt', 'Hund', 'Fågel', 'Fisk', 'Häst', 'Kanin'];

    function genM1Task(level) {
        const names = shuffle(M1_CATS.slice()).slice(0, 4);
        let values;
        do {
            values = names.map(() => rnd(1, 10));
            var mx = Math.max(...values), mn = Math.min(...values);
        } while ((level === 1 && values.filter(v => v === mx).length !== 1) ||
                 (level === 2 && mx === mn));

        let question, correct, distractors;
        if (level === 0) {
            const i = rnd(0, 3);
            question = 'Hur många valde ' + names[i] + '?';
            correct = values[i];
            const cand = [...values.filter((v, j) => j !== i), correct + 1, correct - 1, correct + 2, correct + 3]
                .filter(v => v > 0 && v !== correct);
            distractors = pickDistractors(correct, cand, 3);
        } else if (level === 1) {
            const i = values.indexOf(mx);
            question = 'Vilket djur valde flest?';
            correct = names[i];
            distractors = names.filter((_, j) => j !== i).slice(0, 3);
        } else {
            const order = names.map((nm, k) => ({ nm, v: values[k] })).sort((a, b) => b.v - a.v);
            const A = order[0], B = order[order.length - 1];
            question = 'Hur många fler valde ' + A.nm + ' än ' + B.nm + '?';
            correct = A.v - B.v;
            const cand = [A.v + B.v, correct + 1, correct - 1, A.v, B.v, correct + 2, correct + 3]
                .filter(v => v > 0 && v !== correct);
            distractors = pickDistractors(correct, cand, 3);
        }
        return { names, values, question, correct, distractors };
    }

    /* ════════ Modul 2 – Medelvärde ════════ */

    function genM2Task(level) {
        const n    = level === 0 ? rnd(2, 3) : level === 1 ? rnd(3, 4) : rnd(4, 5);
        const maxv = level === 0 ? 8 : level === 1 ? 10 : 12;
        let nums, sum;
        do {
            nums = Array.from({ length: n }, () => rnd(1, maxv));
            sum  = nums.reduce((a, b) => a + b, 0);
        } while (sum % n !== 0);
        const correct = sum / n;

        const cand = [
            sum,                                    // glömmer att dela
            correct + 1, correct - 1, correct + 2, correct - 2, correct + 3,
            2 * correct, sum + 1, Math.max(...nums)
        ].filter(v => v > 0 && v !== correct && Number.isInteger(v));

        return { nums, sum, n, correct, distractors: pickDistractors(correct, cand, 3) };
    }

    /* ════════ Modul 3 – Sannolikhet ════════ */

    const COLORS = [
        { name: 'röda',  sing: 'röd',  hex: '#C0614A' },
        { name: 'blå',   sing: 'blå',  hex: '#5B8DB8' },
        { name: 'gröna', sing: 'grön', hex: '#6B9E6B' },
        { name: 'gula',  sing: 'gul',  hex: '#E0B341' }
    ];

    function genM3Task(level) {
        const numColors = level === 2 ? 3 : 2;
        const palette = shuffle(COLORS.slice()).slice(0, numColors);
        const counts = palette.map(() => rnd(1, 5));
        const total = counts.reduce((a, b) => a + b, 0);
        const i = rnd(0, numColors - 1);
        const k = counts[i];
        const correct = k + ' av ' + total;

        const cand = [
            total + ' av ' + total,
            (total - k) + ' av ' + total,
            k + ' av ' + (total + 1),
            (k + 1) + ' av ' + total,
            (k - 1) + ' av ' + total,
            k + ' av ' + k
        ].filter(s => !s.startsWith('-') && !s.startsWith('0 av') && s !== correct);

        return {
            colors: palette.map((c, j) => ({ name: c.name, hex: c.hex, count: counts[j] })),
            askName: palette[i].name, askSing: palette[i].sing, k, total, correct,
            distractors: pickDistractors(correct, cand, 3)
        };
    }

    /* ════════ Modul 4 – Kombinatorik ════════ */

    function genM4Task(level) {
        if (level < 2) {
            const hi = level === 0 ? 3 : 4;
            const a = rnd(2, hi), b = rnd(2, hi);
            const correct = a * b;
            const cand = [a + b, correct + 1, correct - 1, a * b + a, a * b - b, correct + 2, 2 * correct]
                .filter(v => v > 0 && v !== correct);
            return { a, b, c: null, items: ['tröjor', 'byxor'], correct, distractors: pickDistractors(correct, cand, 3) };
        }
        const a = rnd(2, 3), b = rnd(2, 3), c = rnd(2, 3);
        const correct = a * b * c;
        const cand = [a + b + c, a * b, b * c, a * c, correct + 1, correct - 1, correct + 2, correct + a]
            .filter(v => v > 0 && v !== correct);
        return { a, b, c, items: ['tröjor', 'byxor', 'mössor'], correct, distractors: pickDistractors(correct, cand, 3) };
    }

    /* ════════ Modul 5 – Typvärde (vanligaste värdet) ════════ */

    function genM5Task(level) {
        const size   = level === 0 ? 5 : level === 1 ? 7 : 9;
        const maxVal = level === 0 ? 5 : level === 1 ? 6 : 8;
        let data, mode;
        do {
            data = Array.from({ length: size }, () => rnd(1, maxVal));
            mode = uniqueMode(data);
        } while (mode === null);
        const correct = mode;

        const others = [...new Set(data.filter(v => v !== mode))];
        const cand = [...others, correct + 1, correct - 1, correct + 2, correct + 3]
            .filter(v => v > 0 && v !== correct);

        return { data, correct, distractors: pickDistractors(correct, cand, 3) };
    }

    /* ════════ Modul 6 – Median (mittersta talet i sorterad ordning) ════════
       Udda antal tal → medianen är exakt ETT mittvärde, alltid heltal (ingen
       delning av två mittersta). Isolerar färdigheten "sortera → ta mitten".
       Datan tvingas vara oordnad (osorterat mittvärde ≠ median) så att
       sorteringssteget alltid spelar roll och "glömde sortera" alltid är en
       giltig distraktor. */
    function genM6Task(level) {
        const size   = level === 0 ? 3 : level === 1 ? 5 : 7;
        const maxVal = level === 0 ? 8 : level === 1 ? 10 : 12;
        const mid    = (size - 1) / 2;
        let data, sorted, median, unsortedMid, mean;
        do {
            data        = Array.from({ length: size }, () => rnd(1, maxVal));
            sorted      = [...data].sort((a, b) => a - b);
            median      = sorted[mid];
            unsortedMid = data[mid];
            mean        = data.reduce((a, b) => a + b, 0) / size;
        } while (unsortedMid === median ||          // sorteringen måste ändra svaret
                 sorted[0] === sorted[size - 1]);    // inte alla lika (median=max=min)
        const correct = median;

        const cand = [
            unsortedMid,                            // glömmer sortera – tar mittersta i ursprunglig ordning
            Number.isInteger(mean) ? mean : null,   // förväxlar median med medelvärde
            sorted[size - 1],                       // tar största talet
            sorted[0],                              // tar minsta talet
            sorted[mid - 1],                        // off-by-one: ett steg för tidigt i sorterad ordning
            sorted[mid + 1],                        // off-by-one: ett steg för sent
            correct + 1, correct + 2, correct + 3   // generiska närvärden (garanterad reserv)
        ].filter(v => v !== null && v !== undefined && v > 0 && Number.isInteger(v) && v !== correct);

        return { data, sorted, correct, distractors: pickDistractors(correct, cand, 3) };
    }

    /* ════════ Mönster v2, lager 11a + 11c ════════
       workedSteps(mod, task): 3 stegrader (löst exempel).
       whyQuestion(mod, task): "Varför stämmer det?" + 1 korrekt + 2 distraktorer
       enligt distraktor-doktrinen. Ren text, testas som vanligt. */

    function workedSteps(mod, t) {
        switch (mod) {
            case 1:
                return [
                    'Läs frågan: "' + t.question + '"',
                    'Titta på staplarnas höjd i diagrammet.',
                    'Svaret är ' + t.correct + '.'
                ];
            case 2:
                return [
                    'Lägg ihop alla tal: ' + t.nums.join(' + ') + ' = ' + t.sum + '.',
                    'Dela summan med antalet tal: ' + t.sum + ' ÷ ' + t.n + '.',
                    'Medelvärdet är ' + t.correct + '.'
                ];
            case 3:
                return [
                    'Räkna hur många ' + t.askName + ' det finns: ' + t.k + '.',
                    'Räkna hur många kulor det finns totalt: ' + t.total + '.',
                    'Sannolikheten är ' + t.correct + '.'
                ];
            case 4:
                return [
                    'Varje ' + t.items[0] + ' kan sättas ihop med varje ' + t.items[1] + (t.c ? ' och varje ' + t.items[2] : '') + '.',
                    'Multiplicera antalet i varje grupp: ' + t.a + ' × ' + t.b + (t.c ? ' × ' + t.c : '') + '.',
                    'Det blir ' + t.correct + ' olika sätt.'
                ];
            case 5:
                return [
                    'Titta på talen: ' + t.data.join(', ') + '.',
                    'Vilket tal kommer flest gånger?',
                    'Typvärdet är ' + t.correct + '.'
                ];
            case 6:
                return [
                    'Sortera talen: ' + t.data.join(', ') + ' → ' + t.sorted.join(', ') + '.',
                    'Ta talet som står i mitten.',
                    'Medianen är ' + t.correct + '.'
                ];
            default:
                return [];
        }
    }

    const WHY = {
        1: {
            correct: 'Man läser av höjden på staplarna i diagrammet.',
            distractors: [
                'Man räknar antalet staplar.',             // fel storhet
                'Bara färgen spelar roll, inte höjden.'    // ignorerar värdet
            ]
        },
        2: {
            correct: 'Medelvärde = summan av talen delat med antalet tal.',
            distractors: [
                'Medelvärde är samma som summan.',         // glömmer att dela
                'Medelvärde är det största talet.'         // fel begrepp
            ]
        },
        3: {
            correct: 'Sannolikhet = antalet du vill ha av det totala antalet.',
            distractors: [
                'Sannolikhet = antalet du inte vill ha av totalen.', // omvänd
                'Sannolikheten är alltid hälften.'                    // fel regel
            ]
        },
        4: {
            correct: 'Man multiplicerar antalet val i varje grupp.',
            distractors: [
                'Man adderar antalet val i grupperna.',    // fel räknesätt (a+b)
                'Man räknar bara den största gruppen.'     // delberäkning
            ]
        },
        5: {
            correct: 'Typvärdet är talet som förekommer flest gånger.',
            distractors: [
                'Typvärdet är det största talet.',         // fel begrepp
                'Typvärdet är talet i mitten.'             // förväxlar med median
            ]
        },
        6: {
            correct: 'Medianen är mittersta talet när talen står i storleksordning.',
            distractors: [
                'Medianen är summan delat med antalet.',   // förväxlar med medelvärde
                'Medianen är talet som syns flest gånger.' // förväxlar med typvärde
            ]
        }
    };

    function whyQuestion(mod, t) {
        const w = WHY[mod];
        return { prompt: 'Varför stämmer det?', correct: w.correct, distractors: w.distractors.slice() };
    }

    return {
        pickDistractors, shuffle, uniqueMode,
        genM1Task, genM2Task, genM3Task, genM4Task, genM5Task, genM6Task,
        workedSteps, whyQuestion
    };
}));
