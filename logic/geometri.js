/* ═══════════════════════════════════════════════
   logic/geometri.js – ren logik för geometri.html (M1–M5)
   SINGMA 5B kap 4–5: vinklar, former, symmetri, omkrets, area.
   Inga DOM-anrop här. Nivå skickas in som parameter (level: 0,1,2).
   Ritning (SVG) och händelsehantering ligger kvar i geometri.html.
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

    /* Plockar n distinkta distraktorer ur en kandidatlista (tal eller strängar). */
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

    /* Slumpa och avrunda till närmaste 5 (snyggare vinklar). */
    function round5(x) { return Math.round(x / 5) * 5; }

    /* ════════ Modul 1 – Vinklar (typ av vinkel) ════════ */

    const ANGLE_TYPES = ['Spetsig', 'Rät', 'Trubbig', 'Rak'];

    function classifyAngle(deg) {
        if (deg < 90)  return 'Spetsig';
        if (deg === 90) return 'Rät';
        if (deg < 180) return 'Trubbig';
        return 'Rak';
    }

    function genM1Task(level) {
        const types = level === 0
            ? ['Spetsig', 'Rät', 'Trubbig']
            : ['Spetsig', 'Rät', 'Trubbig', 'Rak'];
        const type = types[rnd(0, types.length - 1)];

        let deg;
        if (type === 'Rät')          deg = 90;
        else if (type === 'Rak')     deg = 180;
        else if (type === 'Spetsig') deg = level === 2 ? round5(rnd(25, 85)) : round5(rnd(20, 75));
        else /* Trubbig */           deg = level === 2 ? round5(rnd(95, 170)) : round5(rnd(105, 165));

        /* skydd så avrundningen aldrig hamnar på fel sida om gränsen */
        if (type === 'Spetsig' && deg >= 90)              deg = 85;
        if (type === 'Trubbig' && (deg <= 90 || deg >= 180)) deg = 105;

        return { deg, correct: type, choices: ANGLE_TYPES.slice() };
    }

    /* ════════ Modul 2 – Geometriska former (känna igen) ════════ */

    const SHAPES = {
        triangel:   { name: 'Triangel',   sides: 3 },
        kvadrat:    { name: 'Kvadrat',    sides: 4 },
        rektangel:  { name: 'Rektangel',  sides: 4 },
        cirkel:     { name: 'Cirkel',     sides: 0 },
        femhorning: { name: 'Femhörning', sides: 5 },
        sexhorning: { name: 'Sexhörning', sides: 6 }
    };

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = rnd(0, i);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function genM2Task(level) {
        const pool = level === 0
            ? ['triangel', 'kvadrat', 'rektangel', 'cirkel']
            : ['triangel', 'kvadrat', 'rektangel', 'cirkel', 'femhorning', 'sexhorning'];

        const key = pool[rnd(0, pool.length - 1)];
        const correct = SHAPES[key].name;
        const others = shuffle(pool.filter(k => k !== key).map(k => SHAPES[k].name));
        const distractors = others.slice(0, 3);
        return { shape: key, sides: SHAPES[key].sides, correct, distractors };
    }

    /* ════════ Modul 3 – Symmetri (antal symmetrilinjer) ════════ */

    const SYM = {
        rektangel:        { name: 'Rektangel',                axes: 2 },
        likbentTriangel:  { name: 'Likbent triangel',         axes: 1 },
        liksidigTriangel: { name: 'Liksidig triangel',        axes: 3 },
        kvadrat:          { name: 'Kvadrat',                  axes: 4 },
        femhorning:       { name: 'Regelbunden femhörning',   axes: 5 },
        sexhorning:       { name: 'Regelbunden sexhörning',   axes: 6 }
    };

    function genM3Task(level) {
        const pool = level === 0
            ? ['rektangel', 'liksidigTriangel', 'kvadrat']
            : level === 1
                ? ['rektangel', 'likbentTriangel', 'liksidigTriangel', 'kvadrat', 'femhorning']
                : ['rektangel', 'likbentTriangel', 'liksidigTriangel', 'kvadrat', 'femhorning', 'sexhorning'];

        const key = pool[rnd(0, pool.length - 1)];
        const correct = SYM[key].axes;
        const cand = [correct + 1, correct - 1, correct + 2, correct - 2, correct + 3]
            .filter(v => v >= 0 && v !== correct);
        return { shape: key, name: SYM[key].name, correct, distractors: pickDistractors(correct, cand, 3) };
    }

    /* ════════ Modul 4 – Omkrets ════════ */

    function genM4Task(level) {
        if (level === 0) {                          /* kvadrat */
            const s = rnd(2, 12), correct = 4 * s;
            const cand = [s * s, 3 * s, correct + s, correct - s, 2 * s, correct + 2, correct - 2]
                .filter(v => v > 0 && v !== correct);
            return { shape: 'kvadrat', a: s, b: s, unit: 'cm', correct, distractors: pickDistractors(correct, cand, 3) };
        }
        if (level === 1) {                          /* rektangel */
            let a = rnd(2, 12), b = rnd(2, 12); if (a === b) b = b + 1;
            const correct = 2 * (a + b);
            const cand = [a * b, a + b, 2 * a + b, a + 2 * b, correct + 2, correct - 2, correct + a, correct - b]
                .filter(v => v > 0 && v !== correct);
            return { shape: 'rektangel', a, b, unit: 'cm', correct, distractors: pickDistractors(correct, cand, 3) };
        }
        /* triangel (tre sidor) */
        const a = rnd(3, 12), b = rnd(3, 12), c = rnd(3, 12);
        const correct = a + b + c;
        const cand = [a + b, b + c, a + c, correct + 1, correct - 1, correct + 2, correct - 2, a * b]
            .filter(v => v > 0 && v !== correct);
        return { shape: 'triangel', a, b, c, unit: 'cm', correct, distractors: pickDistractors(correct, cand, 3) };
    }

    /* ════════ Modul 5 – Area ════════ */

    function genM5Task(level) {
        if (level === 0) {                          /* kvadrat med rutnät */
            const s = rnd(2, 5), correct = s * s;
            const cand = [4 * s, s + s, correct + 1, correct - 1, correct + s, correct - s, 2 * s]
                .filter(v => v > 0 && v !== correct);
            return { shape: 'kvadrat', a: s, b: s, grid: true, unit: 'cm²', correct, distractors: pickDistractors(correct, cand, 3) };
        }
        if (level === 1) {                          /* rektangel med rutnät */
            let a = rnd(2, 6), b = rnd(2, 6); if (a === b) b = b + 1;
            const correct = a * b;
            const cand = [2 * (a + b), a + b, correct + a, correct - b, correct + 1, correct - 1, a * a]
                .filter(v => v > 0 && v !== correct);
            return { shape: 'rektangel', a, b, grid: true, unit: 'cm²', correct, distractors: pickDistractors(correct, cand, 3) };
        }
        /* större rektangel utan rutnät */
        let a = rnd(4, 12), b = rnd(4, 12); if (a === b) b = b + 1;
        const correct = a * b;
        const cand = [2 * (a + b), a + b, correct + a, correct - b, correct + 10, correct - 10, correct + 2 * a]
            .filter(v => v > 0 && v !== correct);
        return { shape: 'rektangel', a, b, grid: false, unit: 'cm²', correct, distractors: pickDistractors(correct, cand, 3) };
    }

    /* ════════ Mönster v2, lager 11a + 11c ════════
       workedSteps(mod, task): 3 stegrader (löst exempel).
       whyQuestion(mod, task): "Varför stämmer det?" + 1 korrekt + 2 distraktorer
       enligt distraktor-doktrinen. Ren text, testas som vanligt. */

    function workedSteps(mod, t) {
        switch (mod) {
            case 1:
                return [
                    'Vinkeln är ' + t.deg + ' grader.',
                    'Mindre än 90° = spetsig, 90° = rät, mellan 90° och 180° = trubbig, 180° = rak.',
                    'Vinkeln är ' + t.correct.toLowerCase() + '.'
                ];
            case 2:
                return [
                    'Räkna formens hörn och sidor.',
                    t.sides > 0 ? 'Den här formen har ' + t.sides + ' sidor.' : 'Den här formen är rund och har inga hörn.',
                    'Det är en ' + t.correct.toLowerCase() + '.'
                ];
            case 3:
                return [
                    'Titta på ' + t.name.toLowerCase() + '.',
                    'En symmetrilinje delar formen i två exakt lika halvor.',
                    t.name + ' har ' + t.correct + ' symmetrilinjer.'
                ];
            case 4: {
                const expr = t.shape === 'kvadrat' ? '4 × ' + t.a
                    : t.shape === 'rektangel' ? '2 × (' + t.a + ' + ' + t.b + ')'
                    : t.a + ' + ' + t.b + ' + ' + t.c;
                return [
                    'Omkrets är hela vägen runt formen.',
                    'Lägg ihop alla sidor: ' + expr + '.',
                    'Omkretsen är ' + t.correct + ' ' + t.unit + '.'
                ];
            }
            case 5:
                return [
                    'Area är hur många rutor som får plats inuti.',
                    'Räkna längden gånger bredden: ' + t.a + ' × ' + t.b + '.',
                    'Arean är ' + t.correct + ' ' + t.unit + '.'
                ];
            default:
                return [];
        }
    }

    const WHY = {
        1: {
            correct: 'En vinkel under 90° är spetsig, 90° är rät, över 90° är trubbig.',
            distractors: [
                'Vinkelns typ beror på hur långa strålarna är.',   // klassisk missuppfattning
                'En större vinkel är alltid spetsig.'              // omvänd riktning
            ]
        },
        2: {
            correct: 'Man känner igen formen på antalet hörn och sidor.',
            distractors: [
                'Man känner igen formen på dess färg.',            // irrelevant egenskap
                'Man känner igen formen på dess storlek.'          // irrelevant egenskap
            ]
        },
        3: {
            correct: 'En symmetrilinje delar formen i två exakt lika halvor.',
            distractors: [
                'Antalet symmetrilinjer är alltid lika med antalet sidor.', // falskt för rektangel
                'Alla raka linjer genom mitten är symmetrilinjer.'          // missuppfattning
            ]
        },
        4: {
            correct: 'Omkrets är summan av alla sidor runt formen.',
            distractors: [
                'Omkrets är sidorna multiplicerade med varandra.', // förväxlar med area
                'Omkrets är bara två av sidorna.'                  // delberäkning
            ]
        },
        5: {
            correct: 'Area är längden gånger bredden — antalet rutor inuti.',
            distractors: [
                'Area är alla sidorna ihoplagda.',                 // förväxlar med omkrets
                'Area är längden plus bredden.'                    // fel räknesätt
            ]
        }
    };

    function whyQuestion(mod, t) {
        const w = WHY[mod];
        return { prompt: 'Varför stämmer det?', correct: w.correct, distractors: w.distractors.slice() };
    }

    return {
        pickDistractors, round5,
        ANGLE_TYPES, classifyAngle, genM1Task,
        SHAPES, genM2Task,
        SYM, genM3Task,
        genM4Task,
        genM5Task,
        workedSteps, whyQuestion
    };
}));
