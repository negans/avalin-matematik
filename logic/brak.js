/* ═══════════════════════════════════════════════
   logic/brak.js – ren logik för brak.html
   Inga DOM-anrop. Nivå skickas in som parameter där det behövs.
   Täcker: formaterare (M1) + svarsgenererande funktioner för
   M3, Del av antal 1–2, M7, M8, M9, M10.
   M2/M5/M6 är DOM-/datatunga och ligger kvar i brak.html.
   UMD: globala i webbläsaren, module.exports i Node (för tester).
═══════════════════════════════════════════════ */
(function (root, factory) {
    const dep = (typeof require !== 'undefined' && typeof module !== 'undefined')
        ? require('./shared.js') : root;
    const api = factory(dep);
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else Object.assign(root, api);
}(typeof window !== 'undefined' ? window : globalThis, function (shared) {
    const gcd = shared.gcd;
    function simplify(n, d) { const g = gcd(n, d); return { n: n / g, d: d / g }; }

    /* ════════ Modul 1 – formaterare (bråk → decimal/procent) ════════ */

    function isTerminating(den) {
        let d = den;
        while (d % 2 === 0) d /= 2;
        while (d % 5 === 0) d /= 5;
        return d === 1;
    }

    function decPlaces(den) {
        let d = den, p2 = 0, p5 = 0;
        while (d % 2 === 0) { d /= 2; p2++; }
        d = den;
        while (d % 5 === 0) { d /= 5; p5++; }
        return Math.max(p2, p5);
    }

    function fmtDec(num, den) {
        const v = num / den;
        if (!isTerminating(den)) return '≈ ' + v.toFixed(2).replace('.', ',');
        let s = v.toFixed(decPlaces(den)).replace('.', ',');
        s = s.replace(/,(\d+)$/, (_, d) => { const t = d.replace(/0+$/, ''); return t ? ',' + t : ''; });
        return s || '0';
    }

    function fmtPct(num, den) {
        const p = num / den * 100;
        const approx = !isTerminating(den);
        const r = Math.round(p * 10) / 10;
        const s = Number.isInteger(r) ? String(r) : r.toFixed(1).replace('.', ',');
        return (approx ? '≈ ' : '') + s + '%';
    }

    /* ════════ Modul 3 – addera/subtrahera bråk (samma nämnare) ════════ */

    const M3_DENOMS = [3, 4, 5, 6, 8, 10];

    function genM3Task() {
        const d = M3_DENOMS[Math.floor(Math.random() * M3_DENOMS.length)];
        const isAdd = Math.random() > 0.35;
        let a, b;
        if (isAdd) {
            a = 1 + Math.floor(Math.random() * (d - 2));
            b = 1 + Math.floor(Math.random() * (d - 1 - a));
        } else {
            a = 2 + Math.floor(Math.random() * (d - 2));
            b = 1 + Math.floor(Math.random() * (a - 1));
        }
        return { d, a, b, isAdd, ans: isAdd ? a + b : a - b };
    }

    /* ════════ Del av antal 1 – hitta helheten ════════ */

    const DA1_FRACS = [
        {n:1,d:2},{n:1,d:3},{n:1,d:4},{n:1,d:5},
        {n:2,d:3},{n:3,d:4},{n:2,d:5},{n:3,d:5}
    ];

    function genDa1Task() {
        const frac = DA1_FRACS[Math.floor(Math.random() * DA1_FRACS.length)];
        const k    = Math.floor(Math.random() * 6) + 2;
        const whole = frac.d * k;
        const part  = frac.n * k;

        const cands = new Set();
        cands.add(part);
        cands.add(part * frac.d);
        if (Number.isInteger(part / frac.n) && part / frac.n !== whole)
            cands.add(part / frac.n);
        cands.add(whole + frac.d);
        cands.delete(whole);

        const dist = [...cands].filter(v => v > 0 && Number.isInteger(v));
        let extra = 1;
        while (dist.length < 3) {
            if (extra !== whole && !dist.includes(extra)) dist.push(extra);
            extra++;
        }
        return { frac, whole, part, k, distractors: dist.slice(0, 3) };
    }

    /* ════════ Del av antal 2 – bråk gånger heltal ════════ */

    const DA2_FRACS = [
        {n:1,d:2},{n:1,d:3},{n:2,d:3},{n:1,d:4},{n:3,d:4},{n:2,d:5},{n:3,d:5}
    ];

    function genDa2Task() {
        const frac    = DA2_FRACS[Math.floor(Math.random() * DA2_FRACS.length)];
        const k       = Math.floor(Math.random() * 6) + 1;
        const integer = frac.d * k;
        const result  = frac.n * k;

        const cands = new Set();
        cands.add(integer);
        cands.add(frac.n * integer);
        cands.add(k);
        cands.add(result + 1);
        cands.delete(result);

        const dist = [...cands].filter(v => v > 0 && Number.isInteger(v));
        let extra = 1;
        while (dist.length < 3) {
            if (extra !== result && !dist.includes(extra)) dist.push(extra);
            extra++;
        }
        return { frac, integer, result, distractors: dist.slice(0, 3) };
    }

    /* ════════ Modul 7 – addition med bråk ════════ */

    function genM7Task(level) {
        const D1 = [2, 3, 4, 5];
        const D2 = [2, 3, 4, 5, 6, 8, 10];
        const D3 = [4, 6, 8, 9, 10];
        let d, a, b, attempts = 0;

        if (level === 1) {
            d = D1[Math.floor(Math.random() * D1.length)];
            a = 1 + Math.floor(Math.random() * (d - 1));
            b = 1 + Math.floor(Math.random() * (d - a || 1));
            if (a + b > d) b = d - a;
            if (b < 1) b = 1;
        } else if (level === 2) {
            d = D2[Math.floor(Math.random() * D2.length)];
            a = 1 + Math.floor(Math.random() * (d - 1));
            b = 1 + Math.floor(Math.random() * (d - 1));
        } else {
            do {
                d = D3[Math.floor(Math.random() * D3.length)];
                a = 1 + Math.floor(Math.random() * (d - 1));
                b = 1 + Math.floor(Math.random() * (d - 1));
                attempts++;
            } while (gcd(a + b, d) <= 1 && attempts < 60);
        }

        const rawN = a + b;
        const ans  = simplify(rawN, d);
        return { d, a, b, rawN, ansN: ans.n, ansD: ans.d };
    }

    function m7Distractors(task) {
        const { d, a, b, rawN, ansN, ansD } = task;
        const cands = [
            simplify(ansN + 1, ansD),
            ansN > 1 ? simplify(ansN - 1, ansD) : null,
            simplify(rawN, d * 2),
            (rawN !== ansN || d !== ansD) ? { n: rawN, d } : null,
            simplify(a, d),
            simplify(b, d),
        ].filter(Boolean);

        const seen = new Set([ansN + '/' + ansD]);
        const out  = [];
        for (const fr of cands) {
            if (fr.n <= 0 || fr.d <= 0) continue;
            const s = simplify(fr.n, fr.d);
            const k = s.n + '/' + s.d;
            if (seen.has(k)) continue;
            seen.add(k);
            out.push(s);
            if (out.length === 3) break;
        }
        for (let ex = 1; out.length < 3; ex++) {
            const k = ex + '/' + ansD;
            if (!seen.has(k)) { seen.add(k); out.push({ n: ex, d: ansD }); }
        }
        return out;
    }

    /* ════════ Modul 8 – subtraktion med bråk ════════ */

    function genM8Task(level) {
        const D1 = [3, 4, 5];
        const D2 = [3, 4, 5, 6, 8, 10];
        const D3 = [4, 6, 8, 9, 10];
        let d, a, b, attempts = 0;

        if (level === 1) {
            d = D1[Math.floor(Math.random() * D1.length)];
            a = 2 + Math.floor(Math.random() * (d - 2));
            b = 1 + Math.floor(Math.random() * (a - 1));
        } else if (level === 2) {
            d = D2[Math.floor(Math.random() * D2.length)];
            a = 2 + Math.floor(Math.random() * (d - 2));
            b = 1 + Math.floor(Math.random() * (a - 1));
        } else {
            do {
                d = D3[Math.floor(Math.random() * D3.length)];
                a = 2 + Math.floor(Math.random() * (d - 2));
                b = 1 + Math.floor(Math.random() * (a - 1));
                attempts++;
            } while (gcd(a - b, d) <= 1 && attempts < 60);
        }

        const rawN = a - b;
        const ans  = simplify(rawN, d);
        return { d, a, b, rawN, ansN: ans.n, ansD: ans.d };
    }

    function m8Distractors(task) {
        const { d, a, b, rawN, ansN, ansD } = task;
        const cands = [
            simplify(ansN + 1, ansD),
            ansN > 1 ? simplify(ansN - 1, ansD) : null,
            simplify(a + b, d),
            (rawN !== ansN || d !== ansD) ? { n: rawN, d } : null,
            simplify(a, d),
            simplify(b, d),
        ].filter(Boolean);

        const seen = new Set([ansN + '/' + ansD]);
        const out  = [];
        for (const fr of cands) {
            if (fr.n <= 0 || fr.d <= 0) continue;
            const s = simplify(fr.n, fr.d);
            const k = s.n + '/' + s.d;
            if (seen.has(k)) continue;
            seen.add(k);
            out.push(s);
            if (out.length === 3) break;
        }
        for (let ex = 1; out.length < 3; ex++) {
            const k = ex + '/' + ansD;
            if (!seen.has(k)) { seen.add(k); out.push({ n: ex, d: ansD }); }
        }
        return out;
    }

    /* ════════ Modul 9 – procent ════════ */

    const M9_L3_TASKS = [
        { q: 'En tröja kostar 200 kr. Du får 10% rabatt. Vad betalar du?',              ans: 180, unit: 'kr',          hint: '10% av 200 = 20 kr rabatt → 200 − 20 = 180',    distractors: [170, 190,  20] },
        { q: 'En bok kostar 100 kr. Du får 20% rabatt. Vad betalar du?',                ans:  80, unit: 'kr',          hint: '20% av 100 = 20 kr rabatt → 100 − 20 = 80',     distractors: [ 60,  75,  20] },
        { q: 'En jacka kostar 400 kr. Den är nedsatt med 25%. Vad kostar den nu?',      ans: 300, unit: 'kr',          hint: '25% av 400 = 100 kr rabatt → 400 − 100 = 300',  distractors: [350, 250, 100] },
        { q: 'Skor kostar 300 kr. Du får 10% rabatt. Vad betalar du?',                  ans: 270, unit: 'kr',          hint: '10% av 300 = 30 kr rabatt → 300 − 30 = 270',    distractors: [280, 260,  30] },
        { q: 'En cykel kostar 500 kr. Du får 20% rabatt. Vad betalar du?',              ans: 400, unit: 'kr',          hint: '20% av 500 = 100 kr rabatt → 500 − 100 = 400',  distractors: [450, 380, 100] },
        { q: 'Det är 40 elever i klassen. 50% är flickor. Hur många flickor är det?',  ans:  20, unit: 'flickor',     hint: '50% = hälften → 40 ÷ 2 = 20',                   distractors: [ 10,  30,  25] },
        { q: 'Det bor 200 djur i skogen. 25% är rävar. Hur många rävar är det?',        ans:  50, unit: 'rävar',       hint: '25% = en fjärdedel → 200 ÷ 4 = 50',             distractors: [ 25,  75, 100] },
        { q: 'En klass har 30 elever. 10% är sjuka. Hur många är sjuka?',               ans:   3, unit: 'elever',      hint: '10% = tiondel → 30 ÷ 10 = 3',                   distractors: [  6,  10,   1] },
        { q: 'Det finns 80 katter på djurhemmet. 50% är orange. Hur många är det?',     ans:  40, unit: 'katter',      hint: '50% = hälften → 80 ÷ 2 = 40',                   distractors: [ 20,  60,  50] },
        { q: 'En påse har 20 godisbitar. 25% är röda. Hur många röda är det?',          ans:   5, unit: 'godisbitar',  hint: '25% = en fjärdedel → 20 ÷ 4 = 5',               distractors: [  4,  10,   2] },
        { q: 'En pizza kostar 100 kr. Priset höjs med 10%. Vad kostar den nu?',         ans: 110, unit: 'kr',          hint: '10% av 100 = 10 kr mer → 100 + 10 = 110',       distractors: [ 90, 120,  10] },
        { q: 'En resa kostar 200 kr. Priset stiger med 50%. Vad kostar den nu?',        ans: 300, unit: 'kr',          hint: '50% av 200 = 100 kr mer → 200 + 100 = 300',     distractors: [250, 350, 100] },
        { q: 'Det är 60 bilar på parkeringen. 10% är röda. Hur många röda bilar?',      ans:   6, unit: 'bilar',       hint: '10% = tiondel → 60 ÷ 10 = 6',                   distractors: [ 10,  12,   3] },
        { q: 'En tröja kostar 150 kr. Du får 20% rabatt. Vad betalar du?',              ans: 120, unit: 'kr',          hint: '20% av 150 = 30 kr rabatt → 150 − 30 = 120',    distractors: [130, 100,  30] },
        { q: 'Det är 50 fåglar i trädet. 20% flyger iväg. Hur många är kvar?',          ans:  40, unit: 'fåglar',      hint: '20% av 50 = 10 flyger → 50 − 10 = 40',          distractors: [ 10,  45,  30] },
        { q: 'En lampa kostar 200 kr. Priset sänks med 50%. Vad kostar den nu?',        ans: 100, unit: 'kr',          hint: '50% av 200 = 100 kr rabatt → 200 − 100 = 100',  distractors: [ 50, 150, 200] },
    ];

    function genM9Task(level) {
        if (level === 1) {
            const pcts = [5, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90];
            const pct  = pcts[Math.floor(Math.random() * pcts.length)];
            return { level: 1, q: 'Vad är ' + pct + '% av 100?', ans: pct, pct, whole: 100, unit: '' };
        }
        if (level === 2) {
            const pcts   = [10, 20, 25, 50];
            const wholes = [20, 40, 60, 80, 100, 120, 150, 200, 300];
            let pct, whole, ans, tries = 0;
            do {
                pct   = pcts[Math.floor(Math.random() * pcts.length)];
                whole = wholes[Math.floor(Math.random() * wholes.length)];
                ans   = pct * whole / 100;
                tries++;
            } while (!Number.isInteger(ans) && tries < 60);
            return { level: 2, q: 'Vad är ' + pct + '% av ' + whole + '?', ans, pct, whole, unit: '' };
        }
        const t = M9_L3_TASKS[Math.floor(Math.random() * M9_L3_TASKS.length)];
        return { level: 3, pct: 0, whole: 0, ...t };
    }

    function m9NumDistractors(ans, pct, whole) {
        const seen = new Set([ans]);
        const cands = [
            ans + 5, ans - 5, ans + 10, ans - 10,
            pct, whole,
            Math.round(ans * 2),
            Math.round(ans / 2),
        ].filter(v => v > 0 && Number.isInteger(v) && !seen.has(v));
        const out = [];
        const dedup = new Set([ans]);
        for (const v of cands) {
            if (dedup.has(v)) continue;
            dedup.add(v);
            out.push(v);
            if (out.length === 3) break;
        }
        for (let ex = 1; out.length < 3; ex++) {
            const v = ans + ex * 5;
            if (!dedup.has(v)) { dedup.add(v); out.push(v); }
        }
        return out;
    }

    /* ════════ Modul 10 – samma tal, tre former ════════ */

    const M10_POOL = [
        { n: 1, d: 2 }, { n: 1, d: 4 }, { n: 3, d: 4 },
        { n: 1, d: 5 }, { n: 2, d: 5 }, { n: 3, d: 5 }, { n: 4, d: 5 },
        { n: 1, d: 10 }, { n: 3, d: 10 }, { n: 7, d: 10 }, { n: 9, d: 10 }
    ];
    const M10_FORMS = ['frac', 'dec', 'pct'];

    function m10Val(fr) { return fr.n / fr.d; }

    function genM10Task(level) {
        const fr = M10_POOL[Math.floor(Math.random() * M10_POOL.length)];
        let from, to;
        if (level === 1)      { from = 'frac'; to = 'dec'; }
        else if (level === 2) { from = 'frac'; to = 'pct'; }
        else {
            from = M10_FORMS[Math.floor(Math.random() * 3)];
            do { to = M10_FORMS[Math.floor(Math.random() * 3)]; } while (to === from);
        }
        return { n: fr.n, d: fr.d, from, to };
    }

    function m10Choices(task) {
        const others = M10_POOL.filter(fr => m10Val(fr) !== m10Val(task));
        for (let i = others.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [others[i], others[j]] = [others[j], others[i]];
        }
        const out = [{ n: task.n, d: task.d }, others[0], others[1], others[2]];
        for (let i = out.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [out[i], out[j]] = [out[j], out[i]];
        }
        return out;
    }

    /* ════════ Mönster v2, lager 11a + 11c (flervalsmodulerna) ════════
       Nyckel: 'da1','da2','m7','m8','m9','m10'. workedSteps → 3 stegrader,
       whyQuestion → 1 korrekt + 2 distraktorer enligt distraktor-doktrinen.
       Ren text, testas som vanligt. */

    const M10_FORM_LABEL = { frac: 'bråk', dec: 'decimaltal', pct: 'procent' };
    function m10Text(kind, n, d) {
        return kind === 'frac' ? n + '/' + d : kind === 'dec' ? fmtDec(n, d) : fmtPct(n, d);
    }

    function workedSteps(key, t) {
        switch (key) {
            case 'da1':
                return [
                    'Du vet att ' + t.frac.n + '/' + t.frac.d + ' av helheten är ' + t.part + '.',
                    'En del (1/' + t.frac.d + ') är ' + t.part + ' ÷ ' + t.frac.n + ' = ' + t.k + '.',
                    'Hela helheten är ' + t.frac.d + ' × ' + t.k + ' = ' + t.whole + '.'
                ];
            case 'da2': {
                const perPart = t.integer / t.frac.d;
                return [
                    'Dela ' + t.integer + ' i ' + t.frac.d + ' lika delar: ' + t.integer + ' ÷ ' + t.frac.d + ' = ' + perPart + '.',
                    'Ta ' + t.frac.n + ' av delarna: ' + t.frac.n + ' × ' + perPart + '.',
                    t.frac.n + '/' + t.frac.d + ' · ' + t.integer + ' = ' + t.result + '.'
                ];
            }
            case 'm7':
                return [
                    'Nämnaren är samma (' + t.d + '), så lägg bara ihop täljarna.',
                    t.a + ' + ' + t.b + ' = ' + t.rawN + ', alltså ' + t.rawN + '/' + t.d + '.',
                    (t.rawN !== t.ansN || t.d !== t.ansD)
                        ? 'Förenkla: ' + t.rawN + '/' + t.d + ' = ' + t.ansN + '/' + t.ansD + '.'
                        : 'Svaret är ' + t.ansN + '/' + t.ansD + '.'
                ];
            case 'm8':
                return [
                    'Nämnaren är samma (' + t.d + '), så ta bara skillnaden mellan täljarna.',
                    t.a + ' − ' + t.b + ' = ' + t.rawN + ', alltså ' + t.rawN + '/' + t.d + '.',
                    (t.rawN !== t.ansN || t.d !== t.ansD)
                        ? 'Förenkla: ' + t.rawN + '/' + t.d + ' = ' + t.ansN + '/' + t.ansD + '.'
                        : 'Svaret är ' + t.ansN + '/' + t.ansD + '.'
                ];
            case 'm9':
                return [
                    'Läs frågan: "' + t.q + '"',
                    t.level === 3
                        ? t.hint
                        : 'Procent betyder hundradelar: dela ' + t.whole + ' med 100 och ta ' + t.pct + ' delar.',
                    'Svaret är ' + t.ans + (t.unit ? ' ' + t.unit : '') + '.'
                ];
            case 'm10':
                return [
                    'Talet ' + m10Text(t.from, t.n, t.d) + ' ska skrivas som ' + M10_FORM_LABEL[t.to] + '.',
                    t.to === 'dec' ? 'Dela täljaren med nämnaren: ' + t.n + ' ÷ ' + t.d + '.'
                        : t.to === 'pct' ? 'Tänk hur många hundradelar talet är ("av hundra").'
                        : 'Leta bråket som har samma värde.',
                    m10Text(t.from, t.n, t.d) + ' = ' + m10Text(t.to, t.n, t.d) + '.'
                ];
            default:
                return [];
        }
    }

    const WHY = {
        da1: {
            correct: 'Först tar man reda på en del, sedan hela helheten.',
            distractors: [
                'Man multiplicerar delen med täljaren.',       // fel operation
                'Delen och helheten är samma sak.'             // missar begreppet
            ]
        },
        da2: {
            correct: 'Man delar i lika delar och tar så många man behöver.',
            distractors: [
                'Man multiplicerar hela talet med nämnaren.',  // fel operation
                'Man tar bara täljaren som svar.'              // delberäkning
            ]
        },
        m7: {
            correct: 'Med samma nämnare lägger man bara ihop täljarna.',
            distractors: [
                'Man adderar både täljare och nämnare.',       // klassisk bråk-missuppfattning
                'Man adderar nämnarna och behåller täljaren.'  // omvänd
            ]
        },
        m8: {
            correct: 'Med samma nämnare tar man bara skillnaden mellan täljarna.',
            distractors: [
                'Man subtraherar både täljare och nämnare.',   // klassisk bråk-missuppfattning
                'Man subtraherar nämnarna och behåller täljaren.' // omvänd
            ]
        },
        m9: {
            correct: 'Procent betyder hundradelar — så många delar av hundra.',
            distractors: [
                'Procent betyder samma som talet självt.',     // ignorerar /100
                'Man lägger procenten till talet.'             // fel operation
            ]
        },
        m10: {
            correct: 'Samma tal kan skrivas som bråk, decimal och procent.',
            distractors: [
                'Bråk och procent är alltid olika tal.',       // missar sambandet
                'Man byter form genom att byta siffrorna.'     // fel metod
            ]
        }
    };

    function whyQuestion(key, t) {
        const w = WHY[key];
        return { prompt: 'Varför stämmer det?', correct: w.correct, distractors: w.distractors.slice() };
    }

    return {
        simplify,
        isTerminating, decPlaces, fmtDec, fmtPct,
        m10Text, workedSteps, whyQuestion,
        M3_DENOMS, genM3Task,
        DA1_FRACS, genDa1Task,
        DA2_FRACS, genDa2Task,
        genM7Task, m7Distractors,
        genM8Task, m8Distractors,
        M9_L3_TASKS, genM9Task, m9NumDistractors,
        M10_POOL, M10_FORMS, m10Val, genM10Task, m10Choices
    };
}));
