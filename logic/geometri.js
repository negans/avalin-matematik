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

    /* ════════ Modul 6 – Triangelns area (bas × höjd ÷ 2) ════════ */

    function genM6Task(level) {
        let b, h;
        if (level === 0) {
            b = rnd(2, 6) * 2;                 // jämn bas → b·h jämnt → heltalsarea
            h = rnd(2, 6);
        } else if (level === 1) {
            do { b = rnd(3, 10); h = rnd(3, 9); } while ((b * h) % 2 !== 0);
        } else {
            do { b = rnd(6, 14); h = rnd(4, 12); } while ((b * h) % 2 !== 0);
        }
        const correct = b * h / 2;
        const cand = [
            b * h,                              // glömmer dela med 2 (klassiskt fel)
            b + h,                              // adderar i stället
            correct + b, correct - h, correct + 1, correct - 1, correct + h
        ].filter(v => v > 0 && v !== correct && Number.isInteger(v));
        return { b, h, unit: 'cm²', correct, distractors: pickDistractors(correct, cand, 3) };
    }

    /* ════════ Modul 7 – Cirkelns delar (radie, diameter, medelpunkt) ════════
       Nivå 0: känna igen delen · nivå 1: diameter = 2·radie · nivå 2: radie = diameter/2. */

    function genM7Task(level) {
        if (level === 0) {
            const parts = [
                { key: 'radie',      correct: 'Radie' },
                { key: 'diameter',   correct: 'Diameter' },
                { key: 'medelpunkt', correct: 'Medelpunkt' }
            ];
            const p = parts[rnd(0, 2)];
            return { kind: 'id', part: p.key, correct: p.correct, choices: ['Radie', 'Diameter', 'Medelpunkt'] };
        }
        if (level === 1) {
            const r = rnd(2, 12), correct = 2 * r;
            const cand = [r, r + 2, 4 * r, correct + 1, correct - 1].filter(v => v > 0 && v !== correct);
            return { kind: 'r2d', r, unit: 'cm', correct, distractors: pickDistractors(correct, cand, 3) };
        }
        const r = rnd(2, 12), d = 2 * r, correct = r;
        const cand = [d, d + 2, correct + 1, correct - 1, correct + 2].filter(v => v > 0 && v !== correct);
        return { kind: 'd2r', d, unit: 'cm', correct, distractors: pickDistractors(correct, cand, 3) };
    }

    const M7_PART_DESC = {
        radie: 'från mitten ut till kanten',
        diameter: 'rakt igenom, från kant till kant via mitten',
        medelpunkt: 'pricken i mitten'
    };

    /* ════════ Modul 8 – Sammansatta figurer (L-form = två rektanglar) ════════
       L-formen = en överrektangel (b×d) ovanpå vänstra delen av en
       underrektangel (a×c). Area = a·c + b·d. */

    function genM8Task(level) {
        let a, b, c, d;
        if (level === 0)      { a = rnd(3, 5); c = rnd(2, 3); d = rnd(2, 3); }
        else if (level === 1) { a = rnd(4, 7); c = rnd(2, 4); d = rnd(2, 4); }
        else                  { a = rnd(5, 9); c = rnd(3, 6); d = rnd(2, 5); }
        b = rnd(2, a - 1);                       // överdelen smalare än underdelen
        const r1 = a * c, r2 = b * d, correct = r1 + r2;
        const cand = [
            a * (c + d),                         // hela rektangeln (glömmer urtaget)
            r1, r2,                              // bara en rektangel
            correct + a, correct - b, correct + 2
        ].filter(v => v > 0 && v !== correct);
        return { a, b, c, d, r1, r2, unit: 'cm²', correct, distractors: pickDistractors(correct, cand, 3) };
    }

    /* ════════ Modul 9 – 3D-former (känna igen) ════════
       Lgr22 åk 4–6: grundläggande tredimensionella objekt. Nivå 0 = fyra
       tydligt olika former; nivå 1–2 = alla sex (kub/rätblock och
       cylinder/kon blir förväxlingsbara). Kategorival, som M2. */

    const SHAPES_3D = {
        kub:      { name: 'Kub',      art: 'en' },
        ratblock: { name: 'Rätblock', art: 'ett' },
        klot:     { name: 'Klot',     art: 'ett' },
        cylinder: { name: 'Cylinder', art: 'en' },
        kon:      { name: 'Kon',      art: 'en' },
        pyramid:  { name: 'Pyramid',  art: 'en' }
    };

    const SHAPE3D_DESC = {
        kub:      'har 6 lika stora kvadratiska sidor',
        ratblock: 'är som en låda – 6 sidor, men inte alla lika stora',
        klot:     'är helt rund, som en boll',
        cylinder: 'har två runda platta sidor och är rund runt om, som en burk',
        kon:      'har en rund botten och smalnar av till en spets, som en glasstrut',
        pyramid:  'har en fyrkantig botten och smalnar av till en spets på toppen'
    };

    function genM9Task(level) {
        const pool = level === 0
            ? ['kub', 'klot', 'cylinder', 'kon']
            : ['kub', 'ratblock', 'klot', 'cylinder', 'kon', 'pyramid'];
        const key = pool[rnd(0, pool.length - 1)];
        const correct = SHAPES_3D[key].name;
        const others = shuffle(pool.filter(k => k !== key).map(k => SHAPES_3D[k].name));
        return { shape: key, art: SHAPES_3D[key].art, correct, distractors: others.slice(0, 3) };
    }

    /* ════════ Modul 10 – Volym (mäta och jämföra rymd) ════════
       Lgr22 åk 4–6: volym med standardenheter. Konkret → abstrakt.
       Nivå 0 = räkna enhetskuber (1 kub = 1 cm³) · nivå 1 = liter → deciliter
       (1 l = 10 dl) · nivå 2 = jämför volymer i blandade enheter (liter/dl/cl),
       vilken rymmer mest. Grundfakta: 1 l = 10 dl = 100 cl = 1000 cm³ = 1 dm³. */

    function genM10Task(level) {
        if (level === 0) {                              /* räkna enhetskuber → cm³ */
            const l = rnd(2, 4), b = rnd(2, 3), h = rnd(2, 3);
            const correct = l * b * h;                  // volym = längd × bredd × höjd
            const cand = [
                l + b + h,          // adderar i stället för att multiplicera
                l * b,              // bara bottenlagret – glömmer höjden
                l * h,              // bara en sida – glömmer djupet
                correct + l, correct - b, correct + 1, correct - 1
            ].filter(v => v > 0 && v !== correct && Number.isInteger(v));
            return { kind: 'cubes', l, b, h, unit: 'cm³', correct, distractors: pickDistractors(correct, cand, 3) };
        }
        if (level === 1) {                              /* liter → deciliter (1 l = 10 dl) */
            const liter = rnd(2, 9), correct = liter * 10;
            const cand = [
                liter,              // glömmer omvandla (behåller talet, faktor 1)
                liter + 10,         // adderar 10 i stället för att multiplicera
                liter * 100,        // fel enhetsfaktor (räknar cl i stället för dl)
                correct + 10, correct - 10, correct + 1
            ].filter(v => v > 0 && v !== correct && Number.isInteger(v));
            return { kind: 'l2dl', liter, unit: 'dl', correct, distractors: pickDistractors(correct, cand, 3) };
        }
        /* nivå 2 – jämför: vilken behållare rymmer mest? (blandade enheter) */
        const literBig = rnd(1, 2);                     // facit: hela liter → alltid störst volym
        const correctMl = literBig * 1000;
        /* tre distinkta hundratal 2..7 → max 70 % av facit: vätskehöjden
           måste synligt skilja sig från facit (bilden bär uppgiften) */
        const hs = [];
        while (hs.length < 3) { const x = rnd(2, 7); if (!hs.includes(x)) hs.push(x); }
        const trap = { text: (hs[0] * 10) + ' cl', ml: hs[0] * 100 };   // stort TAL, liten volym (taljämförelse-fälla)
        const optB = { text: hs[1] + ' dl', ml: hs[1] * 100 };
        const optC = { text: hs[2] + ' dl', ml: hs[2] * 100 };
        const correctText = literBig + ' liter';
        return {
            kind: 'compare', unit: '',
            options: [{ text: correctText, ml: correctMl }, trap, optB, optC],
            correctMl, correct: correctText,
            distractors: [trap.text, optB.text, optC.text]
        };
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
            case 6:
                return [
                    'Triangelns area = bas × höjd ÷ 2.',
                    'Räkna ' + t.b + ' × ' + t.h + ' ÷ 2 = ' + (t.b * t.h) + ' ÷ 2.',
                    'Arean är ' + t.correct + ' ' + t.unit + '.'
                ];
            case 8:
                return [
                    'Dela upp figuren i två rektanglar.',
                    'Rektangel 1: ' + t.a + ' × ' + t.c + ' = ' + t.r1 + '. Rektangel 2: ' + t.b + ' × ' + t.d + ' = ' + t.r2 + '.',
                    'Lägg ihop: ' + t.r1 + ' + ' + t.r2 + ' = ' + t.correct + ' ' + t.unit + '.'
                ];
            case 7:
                if (t.kind === 'id') {
                    return [
                        'Titta på den röda markeringen i cirkeln.',
                        'En ' + t.correct.toLowerCase() + ' är ' + M7_PART_DESC[t.part] + '.',
                        'Det är en ' + t.correct.toLowerCase() + '.'
                    ];
                }
                if (t.kind === 'r2d') {
                    return [
                        'Diametern är dubbelt så lång som radien.',
                        'Räkna 2 × ' + t.r + '.',
                        'Diametern är ' + t.correct + ' ' + t.unit + '.'
                    ];
                }
                return [
                    'Radien är hälften av diametern.',
                    'Räkna ' + t.d + ' ÷ 2.',
                    'Radien är ' + t.correct + ' ' + t.unit + '.'
                ];
            case 9:
                return [
                    'Titta på formen.',
                    'Den ' + SHAPE3D_DESC[t.shape] + '.',
                    'Det är ' + t.art + ' ' + t.correct.toLowerCase() + '.'
                ];
            case 10:
                if (t.kind === 'cubes') {
                    return [
                        'Volym är hur många kuber som får plats.',
                        'Räkna ' + t.l + ' × ' + t.b + ' × ' + t.h + '.',
                        'Volymen är ' + t.correct + ' ' + t.unit + '.'
                    ];
                }
                if (t.kind === 'l2dl') {
                    return [
                        '1 liter är samma som 10 deciliter.',
                        'Räkna ' + t.liter + ' × 10.',
                        t.liter + ' liter är ' + t.correct + ' dl.'
                    ];
                }
                return [
                    'Gör om alla till samma enhet först.',
                    '1 liter = 10 dl = 100 cl.',
                    t.correct + ' rymmer mest.'
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
        },
        6: {
            correct: 'Triangelns area är bas gånger höjd, delat med 2.',
            distractors: [
                'Triangelns area är bas gånger höjd.',             // glömmer ÷2
                'Triangelns area är alla sidorna ihoplagda.'       // förväxlar med omkrets
            ]
        },
        7: {
            correct: 'Diametern är dubbelt så lång som radien.',
            distractors: [
                'Diametern är lika lång som radien.',              // missar faktor 2
                'Radien går från kant till kant.'                  // förväxlar radie/diameter
            ]
        },
        8: {
            correct: 'Man delar upp figuren i rektanglar och lägger ihop areorna.',
            distractors: [
                'Man räknar hela rektangeln utan att ta bort urtaget.', // över-räknar
                'Man räknar bara en av rektanglarna.'                   // delberäkning
            ]
        },
        9: {
            correct: 'Man känner igen en 3D-form på hur många och vilka sidor och ytor den har.',
            distractors: [
                'Man känner igen 3D-former på deras färg.',    // irrelevant egenskap
                'Alla former som är runda någonstans är klot.' // överförenkling (cylinder/kon är också runda)
            ]
        },
        10: {
            correct: 'Man måste göra om till samma enhet innan man jämför.',
            distractors: [
                'Den med störst tal rymmer alltid mest, oavsett enhet.', // ytlig taljämförelse
                'En behållare med cl rymmer alltid mer än en med liter.'  // enhetsförväxling
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
        genM6Task,
        genM7Task, M7_PART_DESC,
        genM8Task,
        SHAPES_3D, SHAPE3D_DESC, genM9Task,
        genM10Task,
        workedSteps, whyQuestion
    };
}));
