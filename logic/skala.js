/* ═══════════════════════════════════════════════
   logic/skala.js – ren logik för skala.html (M1–M3)
   Fas 5, steg 14: förminskning/förstoring, elevnära (teckning, karta).
   Konkret ingång till proportionalitet.
   Inga DOM-anrop här. Nivå skickas in som parameter (level: 0,1,2).
   Ritning (SVG) och händelsehantering ligger i skala.html.
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

    /* Plockar n distinkta distraktorer ur en kandidatlista. Hoppar över
       facit, dubbletter och ogiltiga värden (≤0 eller icke-heltal). */
    function pickDistractors(correct, candidates, n) {
        n = n || 3;
        const seen = new Set([correct]);
        const out = [];
        for (const c of candidates) {
            if (c === null || c === undefined) continue;
            if (!Number.isInteger(c) || c <= 0) continue;
            if (!seen.has(c)) { seen.add(c); out.push(c); }
            if (out.length >= n) break;
        }
        return out;
    }

    const CHOICES_M1 = ['Förstoring', 'Förminskning', 'Lika stor'];

    /* Avgör kategorin när bilden går från `orig` till `ny` (antal rutor)
       eller när skalan är a:b. */
    function classify(orig, ny) {
        if (ny > orig) return 'Förstoring';
        if (ny < orig) return 'Förminskning';
        return 'Lika stor';
    }

    /* ════════ Modul 1 – Förstoring eller förminskning? (känna igen) ════════
       Nivå 0: bild — en teckning ritas om med fler/färre rutor.
       Nivå 1–2: skala-notation a:b.
       Vi väljer kategorin FÖRST och bygger figuren så att alla tre
       svaren (även "Lika stor") är nåbara. */
    function genM1Task(level) {
        const target = CHOICES_M1[rnd(0, 2)];

        if (level === 0) {
            /* Bildläge: rutor. */
            let orig, ny;
            if (target === 'Förstoring')       { orig = rnd(2, 5); ny = orig + rnd(2, 4); }
            else if (target === 'Förminskning') { orig = rnd(5, 8); ny = orig - rnd(2, 4); }
            else                                { orig = rnd(2, 6); ny = orig; }
            return { mode: 'pic', orig, ny, correct: classify(orig, ny), choices: CHOICES_M1.slice() };
        }

        /* Skalläge: a:b. */
        const big = level === 2 ? [2, 3, 4, 5, 10, 100] : [2, 3, 4, 5];
        let a, b;
        if (target === 'Förstoring')       { a = big[rnd(0, big.length - 1)]; b = 1; }
        else if (target === 'Förminskning') { a = 1; b = big[rnd(0, big.length - 1)]; }
        else                                { a = 1; b = 1; }
        return { mode: 'scale', a, b, correct: classify(a, b), choices: CHOICES_M1.slice() };
    }

    /* ════════ Modul 2 – Hur många gånger? (skalfaktor på en längd) ════════
       Förstoring n:1 → bild = n × original.
       Förminskning 1:n → bild = original ÷ n (original väljs delbart). */
    function genM2Task(level) {
        const unit = 'cm';
        if (level === 0) {
            /* Bara förstoring, små tal. */
            const n = rnd(2, 3);
            const orig = rnd(2, 6);
            return enlargeTask(n, orig, unit);
        }
        if (level === 1) {
            /* Bara förminskning, original delbart med n. */
            const n = rnd(2, 3);
            return reduceTask(n, rnd(2, 6), unit);
        }
        /* Nivå 2: blandat, lite större skaltal. */
        if (rnd(0, 1) === 0) return enlargeTask(rnd(2, 5), rnd(2, 8), unit);
        return reduceTask(rnd(2, 5), rnd(2, 6), unit);
    }

    /* Förstoring n:1 på en längd `orig`. Diagnostiska distraktorer först,
       generiska närvärden som garanterad reserv. */
    function enlargeTask(n, orig, unit) {
        const correct = n * orig;
        const cand = [
            n + orig,         // fel räknesätt: addition
            orig,             // glömde förstora
            (n + 1) * orig,   // off-by-one på skaltalet
            (n - 1) * orig,   // off-by-one åt andra hållet
            correct + 1, correct - 1, correct + 2, correct + orig
        ];
        return { type: 'forstoring', n, orig, unit, correct,
                 distractors: pickDistractors(correct, cand, 3) };
    }

    /* Förminskning 1:n på en längd som väljs delbar (orig = n·q). */
    function reduceTask(n, q, unit) {
        const orig = n * q;
        const correct = q;
        const cand = [
            orig * n,         // omvänd riktning: multiplicerade
            orig - n,         // fel räknesätt: subtraktion
            orig,             // glömde förminska
            correct + 1, correct - 1, correct + 2, q + n
        ];
        return { type: 'forminskning', n, orig, unit, correct,
                 distractors: pickDistractors(correct, cand, 3) };
    }

    /* ════════ Modul 3 – Karta: verklig längd (abstrakt tillämpning) ════════
       1 cm på kartan = M meter i verkligheten.
       Sträckan är k cm på kartan → verklig = k × M meter.
       Allt i hela meter; ingen enhetsväxling inuti räkningen. */
    function genM3Task(level) {
        const Mset = level === 0 ? [1, 2] : level === 1 ? [2, 5, 10] : [10, 20, 50, 100];
        const M = Mset[rnd(0, Mset.length - 1)];
        const k = level === 0 ? rnd(2, 6) : level === 1 ? rnd(2, 8) : rnd(2, 9);
        const correct = k * M;
        const cand = [
            k + M,            // fel räknesätt: addition
            k,                // glömde skalan
            k * M - M,        // delberäkning / off-by-one
            k * (M + 1),      // fel skaltal
            correct + 1, correct - 1, correct + M, correct + 2
        ];
        return { M, k, unit: 'm', correct,
                 distractors: pickDistractors(correct, cand, 3) };
    }

    /* ════════ Mönster v2, lager 11a + 11c ════════
       workedSteps(mod, task): 3 stegrader (löst exempel).
       whyQuestion(mod): "Varför stämmer det?" + 1 korrekt + 2 distraktorer. */
    function workedSteps(mod, t) {
        switch (mod) {
            case 1:
                if (t.mode === 'pic') {
                    return [
                        'Bilden var ' + t.orig + ' rutor och blev ' + t.ny + ' rutor.',
                        t.ny > t.orig ? 'Den blev fler rutor — alltså större.'
                            : t.ny < t.orig ? 'Den blev färre rutor — alltså mindre.'
                            : 'Lika många rutor — lika stor.',
                        t.correct === 'Lika stor' ? 'Bilden är lika stor.'
                            : 'Det är en ' + t.correct.toLowerCase() + '.'
                    ];
                }
                return [
                    'Skalan är ' + t.a + ':' + t.b + '.',
                    t.a > t.b ? 'Första talet är störst — bilden blir större.'
                        : t.a < t.b ? 'Andra talet är störst — bilden blir mindre.'
                        : 'Talen är lika — lika stor.',
                    t.correct === 'Lika stor' ? 'Bilden är lika stor.'
                        : 'Det är en ' + t.correct.toLowerCase() + '.'
                ];
            case 2:
                if (t.type === 'forstoring') {
                    return [
                        'Skalan ' + t.n + ':1 betyder ' + t.n + ' gånger så stor.',
                        'Räkna ' + t.n + ' × ' + t.orig + '.',
                        'På bilden blir den ' + t.correct + ' ' + t.unit + '.'
                    ];
                }
                return [
                    'Skalan 1:' + t.n + ' betyder ' + t.n + ' gånger mindre.',
                    'Räkna ' + t.orig + ' ÷ ' + t.n + '.',
                    'På bilden blir den ' + t.correct + ' ' + t.unit + '.'
                ];
            case 3:
                return [
                    '1 cm på kartan är ' + t.M + ' meter i verkligheten.',
                    'Räkna ' + t.k + ' × ' + t.M + '.',
                    'I verkligheten är den ' + t.correct + ' ' + t.unit + '.'
                ];
            default:
                return [];
        }
    }

    const WHY = {
        1: {
            correct: 'En förstoring gör bilden större, en förminskning gör den mindre.',
            distractors: [
                'En förstoring gör alltid bilden mindre.',          // omvänd riktning
                'En bild i skala är alltid lika stor som verkligheten.' // ignorerar skalan
            ]
        },
        2: {
            correct: 'I en förstoring multiplicerar man längden med skaltalet.',
            distractors: [
                'I en förstoring adderar man skaltalet till längden.',  // fel räknesätt
                'I en förminskning blir längden större.'                // omvänd riktning
            ]
        },
        3: {
            correct: 'Man multiplicerar kartans längd med vad 1 cm motsvarar.',
            distractors: [
                'Man adderar kartans längd och skaltalet.',         // fel räknesätt
                'I verkligheten är sträckan lika lång som på kartan.' // ignorerar skalan
            ]
        }
    };

    function whyQuestion(mod) {
        const w = WHY[mod];
        return { prompt: 'Varför stämmer det?', correct: w.correct, distractors: w.distractors.slice() };
    }

    return {
        pickDistractors, classify, CHOICES_M1,
        genM1Task, genM2Task, genM3Task,
        workedSteps, whyQuestion
    };
}));
