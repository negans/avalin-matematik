/* ═══════════════════════════════════════════════
   logic/koordinat.js – ren logik för koordinat.html (M1–M4)
   SINGMA 5A kap 6: koordinatsystem, läsa av och plotta punkter.
   Inga DOM-anrop här. Nivå skickas in som parameter (level: 0,1,2).
   Ritning (SVG-grid) och händelsehantering ligger kvar i koordinat.html.
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

    /* Svensk koordinatsträng: (x, y). */
    function fmtPt(x, y) { return '(' + x + ', ' + y + ')'; }

    /* Bygger facit + 3 distraktorer för en punkt (x,y) inom [lo,hi].
       Vanligaste felen: x/y omkastade, samt ±1 på någon axel. */
    function buildPointChoices(x, y, lo, hi) {
        const correctStr = fmtPt(x, y);
        const raw = [
            [y, x],                                   // omkastade koordinater
            [x + 1, y], [x - 1, y],
            [x, y + 1], [x, y - 1],
            [x + 1, y + 1], [x - 1, y - 1],
            [x + 1, y - 1], [x - 1, y + 1],
            [y, x + 1]
        ];
        const cand = raw
            .filter(p => p[0] >= lo && p[0] <= hi && p[1] >= lo && p[1] <= hi)
            .map(p => fmtPt(p[0], p[1]));
        return { correctStr, distractors: pickDistractors(correctStr, cand) };
    }

    /* ════════ Modul 1 – Läs av koordinaterna (första kvadranten) ════════ */

    function genM1Task(level) {
        const gridMax = level === 0 ? 5 : level === 1 ? 8 : 10;
        const x = rnd(0, gridMax), y = rnd(0, gridMax);
        const ch = buildPointChoices(x, y, 0, gridMax);
        return {
            x, y, gridMax,
            correctStr: ch.correctStr,
            distractors: ch.distractors,
            label: fmtPt(x, y)
        };
    }

    /* ════════ Modul 2 – Vilken punkt ligger på (x, y)? (välj A–D) ════════ */

    const LABELS = ['A', 'B', 'C', 'D'];

    function genM2Task(level) {
        const gridMax = level === 0 ? 5 : level === 1 ? 8 : 10;
        const pts = [];
        while (pts.length < 4) {
            const x = rnd(0, gridMax), y = rnd(0, gridMax);
            if (!pts.some(p => p.x === x && p.y === y)) pts.push({ x, y });
        }
        const points = pts.map((p, i) => ({ label: LABELS[i], x: p.x, y: p.y }));
        const target = points[rnd(0, 3)];
        return {
            gridMax,
            points,
            targetLabel: target.label,
            x: target.x, y: target.y,
            label: fmtPt(target.x, target.y)
        };
    }

    /* ════════ Modul 3 – Plotta punkten (klicka på rätt skärningspunkt) ════════ */

    function genM3Task(level) {
        const gridMax = level === 0 ? 5 : level === 1 ? 8 : 10;
        const x = rnd(0, gridMax), y = rnd(0, gridMax);
        return { x, y, gridMax, label: fmtPt(x, y) };
    }

    /* ════════ Modul 4 – Koordinatsystem med negativa tal (fyra kvadranter) ════════ */

    function genM4Task(level) {
        const r = level === 0 ? 3 : level === 1 ? 5 : 6;
        let x, y;
        do { x = rnd(-r, r); y = rnd(-r, r); } while (x >= 0 && y >= 0); // minst en negativ
        const ch = buildPointChoices(x, y, -r, r);
        return {
            x, y, gridMin: -r, gridMax: r,
            correctStr: ch.correctStr,
            distractors: ch.distractors,
            label: fmtPt(x, y)
        };
    }

    return {
        pickDistractors,
        fmtPt,
        buildPointChoices,
        genM1Task,
        genM2Task,
        genM3Task,
        genM4Task
    };
}));
