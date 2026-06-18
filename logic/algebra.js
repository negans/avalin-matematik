/* ═══════════════════════════════════════════════
   logic/algebra.js – ren logik för algebra.html (M1–M5)
   SINGMA 5B kap 1: uttryck, variabler, enkla ekvationer.
   Inga DOM-anrop här. Nivå skickas in som parameter (level: 0,1,2).
   Ritning (SVG) och händelsehantering ligger kvar i algebra.html.
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

    /* ════════ Modul 1 – Beräkna uttryckets värde (substitution) ════════ */

    function genM1Task(level) {
        let a, b, op, x;
        if (level === 0) {
            a = 1; op = Math.random() < 0.5 ? '+' : '-'; b = rnd(1, 9);
            x = op === '-' ? rnd(b + 1, 12) : rnd(1, 12);
        } else if (level === 1) {
            a = rnd(2, 5); x = rnd(2, 9);
            if (Math.random() < 0.5) { b = 0; op = '+'; } else { b = rnd(1, 9); op = '+'; }
        } else {
            a = rnd(2, 6); x = rnd(2, 9); op = Math.random() < 0.5 ? '+' : '-';
            b = op === '-' ? rnd(1, Math.min(12, a * x - 1)) : rnd(1, 12);
        }
        const correct = op === '+' ? a * x + b : a * x - b;

        const coef = a === 1 ? '' : '' + a;
        let exprStr = coef + 'x';
        if (b !== 0) exprStr += ' ' + op + ' ' + b;

        const cand = [
            a + x,                                  // adderar koefficient och x
            a * x,                                  // glömmer konstanten
            op === '+' ? x + b : x - b,             // glömmer koefficienten
            correct + 1, correct - 1, correct + 2, correct + 3,
            correct + a, correct - a, correct + b, correct - b, correct + x
        ].filter(v => v > 0 && v !== correct && Number.isInteger(v));

        return { exprStr, x, a, b, op, correct, distractors: pickDistractors(correct, cand, 3) };
    }

    /* ════════ Modul 2 – Skriv uttrycket (ord → algebra) ════════ */

    function genM2Task(level) {
        const b = rnd(2, 9);
        let text, correct, pool;

        if (level === 0) {
            if (Math.random() < 0.5) { text = 'Ett tal x ökas med ' + b;   correct = 'x + ' + b; }
            else                     { text = 'Ett tal x minskas med ' + b; correct = 'x - ' + b; }
            pool = ['x + ' + b, 'x - ' + b, b + 'x', b + ' - x'];
        } else if (level === 1) {
            text = b + ' gånger så stort som ett tal x';
            correct = b + 'x';
            pool = [b + 'x', 'x + ' + b, 'x - ' + b, b + ' + x'];
        } else {
            const a = rnd(2, 4);
            text = b + ' mer än ' + a + ' gånger talet x';
            correct = a + 'x + ' + b;
            pool = [a + 'x + ' + b, a + 'x - ' + b, (a + b) + 'x', 'x + ' + (a + b)];
        }

        const distractors = pool.filter(p => p !== correct).slice(0, 3);
        return { text, correct, distractors };
    }

    /* ════════ Modul 3 – Förenkla (samla lika termer) ════════ */

    function genM3Task(level) {
        let terms, coef;
        if (level === 0) {
            const n = rnd(2, 4); terms = Array(n).fill('x'); coef = n;
        } else if (level === 1) {
            const a = rnd(2, 6), b = rnd(2, 6); terms = [a + 'x', b + 'x']; coef = a + b;
        } else {
            const a = rnd(2, 5), b = rnd(2, 5), c = rnd(2, 5); terms = [a + 'x', b + 'x', c + 'x']; coef = a + b + c;
        }
        const correctStr = coef + 'x';

        const cset = [coef + 1, coef - 1, coef + 2, coef * 2]
            .filter(k => k >= 2 && k !== coef)
            .map(k => k + 'x');
        cset.push('' + coef);                       // vanligt fel: tappar variabeln

        return { exprStr: terms.join(' + '), correctStr, coef, distractors: pickDistractors(correctStr, cset, 3) };
    }

    /* ════════ Modul 4 – Lös ekvationen ════════ */

    function genM4Task(level) {
        let eqStr, x, a, b, left;
        if (level === 0) {
            a = rnd(1, 9); x = rnd(1, 9); b = x + a;
            left = 'x + ' + a; eqStr = left + ' = ' + b;
        } else if (level === 1) {
            a = rnd(1, 9); const c = rnd(1, 9); x = a + c; b = c;
            left = 'x - ' + a; eqStr = left + ' = ' + c;
        } else {
            a = rnd(2, 5); x = rnd(2, 9); b = a * x;
            left = a + 'x'; eqStr = left + ' = ' + b;
        }
        const correct = x;
        const cand = [
            b, a,
            level === 0 ? b + a : b - a,            // räknar åt fel håll
            correct + 1, correct - 1, correct + 2, correct - 2, correct + 3,
            correct + a, b + 1
        ].filter(v => v > 0 && v !== correct && Number.isInteger(v));

        return { eqStr, left, right: b, x, a, correct, distractors: pickDistractors(correct, cand, 3) };
    }

    /* ════════ Modul 5 – Mönster och uttryck (figurmönster) ════════ */

    function genM5Task(level) {
        const start = rnd(1, 4);
        const step  = level === 0 ? rnd(1, 2) : level === 1 ? rnd(2, 3) : rnd(2, 4);
        const askIndex = level === 2 ? 6 : level === 1 ? 5 : 4;
        const figures = [1, 2, 3].map(k => start + step * (k - 1));
        const correct = start + step * (askIndex - 1);

        const cand = [
            correct + step, correct - step,         // ett steg fel
            correct + 1, correct - 1,
            correct + 2, correct - 2, correct + step * 2
        ].filter(v => v > 0 && v !== correct && Number.isInteger(v));

        return { start, step, askIndex, figures, correct, distractors: pickDistractors(correct, cand, 3) };
    }

    return {
        pickDistractors,
        genM1Task, genM2Task, genM3Task, genM4Task, genM5Task
    };
}));
