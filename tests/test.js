/* ═══════════════════════════════════════════════
   tests/test.js – Avalins Matematikverkstad
   Beroendefri testsvit. Körs med:  node tests/test.js
   Testar den rena logiken i logic/*.js (inga DOM-anrop).
═══════════════════════════════════════════════ */

let pass = 0, fail = 0;
const fails = [];

function ok(cond, msg) {
    if (cond) { pass++; }
    else { fail++; fails.push(msg); }
}
function eq(actual, expected, msg) {
    ok(actual === expected, msg + ' — väntade "' + expected + '", fick "' + actual + '"');
}

/* Kör en generator många gånger och kontrollera en invariant varje gång. */
function forEachRun(gen, level, n, check) {
    for (let i = 0; i < n; i++) check(gen(level), i);
}
function distinct(arr) { return new Set(arr).size === arr.length; }

const RUNS = 3000;

/* ═══════════ decimaltal ═══════════ */
const dec = require('../logic/decimaltal.js');

/* — M5: exakta värden (kärnan i modulens pedagogik) — */
eq(dec.m5FmtAny(250, 100),  '2,5',  'm5FmtAny 250cm');
eq(dec.m5FmtAny(25, 100),   '0,25', 'm5FmtAny 25cm');
eq(dec.m5FmtAny(275, 100),  '2,75', 'm5FmtAny 275cm');
eq(dec.m5FmtAny(250, 1000), '0,25', 'm5FmtAny 250g');
eq(dec.m5FmtAny(1250, 1000),'1,25', 'm5FmtAny 1250g');
eq(dec.m5FmtAny(1500, 1000),'1,5',  'm5FmtAny 1500g');
eq(dec.m5FmtAny(2000, 1000),'2',    'm5FmtAny 2000g (heltal)');

/* — M4: fmtOp exakta värden — */
eq(dec.fmtOp(125), '1,25', 'fmtOp 125');
eq(dec.fmtOp(130), '1,3',  'fmtOp 130');
eq(dec.fmtOp(200), '2,0',  'fmtOp 200');

/* — M1: invarianter (alla nivåer) — */
[0,1,2].forEach(lvl => forEachRun(dec.genM1Task, lvl, RUNS, t => {
    ok(t.distractors.length === 3, 'M1 nivå'+lvl+': exakt 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correct, ...t.distractors]), 'M1 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'M1 nivå'+lvl+': facit ej bland distraktorer');
    ok(typeof t.correct === 'string' && t.correct.length > 0, 'M1 nivå'+lvl+': facit ej tomt');
}));

/* — M2: invarianter — */
[0,1,2].forEach(lvl => forEachRun(dec.genM2Task, lvl, RUNS, t => {
    ok(t.optA !== t.optB, 'M2 nivå'+lvl+': två olika alternativ');
    ok(t.correctDisp === t.optA || t.correctDisp === t.optB, 'M2 nivå'+lvl+': facit är ett av alternativen');
}));

/* — M3: invarianter — */
[0,1,2].forEach(lvl => forEachRun(dec.genM3Task, lvl, RUNS, t => {
    ok(t.distractors.length === 3, 'M3 nivå'+lvl+': exakt 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correct, ...t.distractors]), 'M3 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'M3 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.pos >= 1 && t.pos <= 9, 'M3 nivå'+lvl+': pos 1–9');
}));

/* — M4: invarianter — */
[0,1,2].forEach(lvl => forEachRun(dec.genM4Task, lvl, RUNS, t => {
    ok(t.result > 0, 'M4 nivå'+lvl+': resultat > 0');
    ok(t.distractors.length === 3, 'M4 nivå'+lvl+': exakt 3 distraktorer (fick '+t.distractors.length+')');
    ok(t.distractors.every(d => d > 0), 'M4 nivå'+lvl+': inga negativa distraktorer');
    ok(distinct([t.result, ...t.distractors]), 'M4 nivå'+lvl+': 4 distinkta alternativ');
    ok(t.label.includes('=') , 'M4 nivå'+lvl+': etikett innehåller =');
}));

/* — M5: invarianter + matematisk korrekthet — */
[0,1,2].forEach(lvl => forEachRun(dec.genM5Task, lvl, RUNS, t => {
    ok(t.distractors.length === 3, 'M5 nivå'+lvl+': exakt 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correctStr, ...t.distractors]), 'M5 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correctStr), 'M5 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.fromUnit !== t.toUnit, 'M5 nivå'+lvl+': från- och till-enhet skiljer sig');
    /* Korrekt omvandling: liten enhet -> stor enligt faktor */
    const fac = dec.M5_FACTOR[t.smallUnit];
    const expectBig = dec.m5FmtAny(t.smallInt, fac);
    const expected = (t.toUnit === dec.M5_BIG[t.smallUnit]) ? expectBig : '' + t.smallInt;
    eq(t.correctStr, expected, 'M5 nivå'+lvl+': facit matchar omvandlingen ('+t.smallInt+' '+t.smallUnit+')');
}));

/* — Mönster v2, lager 11a + 11c: workedSteps + whyQuestion (M1–M5) — */
{
    const DEC_GEN = { 1: dec.genM1Task, 2: dec.genM2Task, 3: dec.genM3Task, 4: dec.genM4Task, 5: dec.genM5Task };
    [1,2,3,4,5].forEach(mod => [0,1,2].forEach(lvl => forEachRun(DEC_GEN[mod], lvl, 300, t => {
        const steps = dec.workedSteps(mod, t);
        ok(steps.length === 3, 'Dec WE mod'+mod+' nivå'+lvl+': exakt 3 steg');
        ok(steps.every(s => typeof s === 'string' && s.length > 0), 'Dec WE mod'+mod+' nivå'+lvl+': alla steg ifyllda');
        /* sista steget bär facit */
        if (mod === 2)      ok(steps[2].includes(t.correctDisp), 'Dec WE mod2: sista steget bär facit');
        else if (mod === 3) ok(steps[2].includes(t.correct),     'Dec WE mod3: sista steget bär facit');
        else if (mod === 5) ok(steps[2].includes(t.correctStr),  'Dec WE mod5: sista steget bär facit');

        const q = dec.whyQuestion(mod, t);
        ok(typeof q.prompt === 'string' && q.prompt.length > 0, 'Dec WHY mod'+mod+': prompt ifylld');
        ok(typeof q.correct === 'string' && q.correct.length > 0, 'Dec WHY mod'+mod+': korrekt rad ifylld');
        ok(q.distractors.length === 2, 'Dec WHY mod'+mod+': exakt 2 distraktorer');
        ok(distinct([q.correct, ...q.distractors]), 'Dec WHY mod'+mod+': 3 distinkta alternativ');
        ok(!q.distractors.includes(q.correct), 'Dec WHY mod'+mod+': facit ej bland distraktorer');
    })));
}

/* ═══════════ multiplikation ═══════════ */
const mul = require('../logic/multiplikation.js');

/* — fmtH / fmtT: exakta värden — */
eq(mul.fmtH(250),  '2,5',  'fmtH 250');
eq(mul.fmtH(2500), '25',   'fmtH 2500');
eq(mul.fmtH(25),   '0,25', 'fmtH 25');
eq(mul.fmtH(300),  '3',    'fmtH 300');
eq(mul.fmtT(6),    '0,6',  'fmtT 6');
eq(mul.fmtT(42),   '4,2',  'fmtT 42');
eq(mul.fmtT(20),   '2',    'fmtT 20');

/* — M1: array-produkt — */
[0,1,2].forEach(lvl => forEachRun(mul.genM1Task, lvl, RUNS, t => {
    ok(t.correct === t.rows * t.cols, 'Mul M1 nivå'+lvl+': facit = rows·cols');
    ok(t.distractors.length === 3, 'Mul M1 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correct, ...t.distractors]), 'Mul M1 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Mul M1 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Mul M1 nivå'+lvl+': positiva heltal');
}));

/* — M2: produkt med hela tal — */
[0,1,2].forEach(lvl => forEachRun(mul.genM2Task, lvl, RUNS, t => {
    ok(t.correct === t.a * t.b, 'Mul M2 nivå'+lvl+': facit = a·b');
    ok(t.distractors.length === 3, 'Mul M2 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correct, ...t.distractors]), 'Mul M2 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Mul M2 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Mul M2 nivå'+lvl+': positiva heltal');
}));

/* — M3: division (kvot, samt rest på nivå 3) — */
[0,1,2].forEach(lvl => forEachRun(mul.genM3Task, lvl, RUNS, t => {
    ok(t.distractors.length === 3, 'Mul M3 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correctStr, ...t.distractors]), 'Mul M3 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correctStr), 'Mul M3 nivå'+lvl+': facit ej bland distraktorer');
    if (!t.hasRest) {
        ok(t.a === t.b * Number(t.correctStr), 'Mul M3 nivå'+lvl+': a = b·kvot (jämnt)');
    } else {
        const parts = t.correctStr.split(' ');   // "q rest r"
        const q = Number(parts[0]), r = Number(parts[2]);
        ok(t.a === t.b * q + r, 'Mul M3 nivå'+lvl+': a = b·q + r');
        ok(r >= 1 && r < t.b, 'Mul M3 nivå'+lvl+': 1 <= rest < b');
    }
}));

/* — M4: ×/÷ med 10,100,1000 — */
[0,1,2].forEach(lvl => forEachRun(mul.genM4Task, lvl, RUNS, t => {
    ok(t.distractors.length === 3, 'Mul M4 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correctStr, ...t.distractors]), 'Mul M4 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correctStr), 'Mul M4 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.label.includes('=') , 'Mul M4 nivå'+lvl+': etikett innehåller =');
}));

/* — M5: ×/÷ med decimaltal — */
[0,1,2].forEach(lvl => forEachRun(mul.genM5Task, lvl, RUNS, t => {
    ok(t.distractors.length === 3, 'Mul M5 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correctStr, ...t.distractors]), 'Mul M5 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correctStr), 'Mul M5 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.label.includes('=') , 'Mul M5 nivå'+lvl+': etikett innehåller =');
}));

/* — Mönster v2, lager 11a + 11c: workedSteps + whyQuestion (M1–M5) — */
{
    const MUL_GEN = { 1: mul.genM1Task, 2: mul.genM2Task, 3: mul.genM3Task, 4: mul.genM4Task, 5: mul.genM5Task };
    [1,2,3,4,5].forEach(mod => [0,1,2].forEach(lvl => forEachRun(MUL_GEN[mod], lvl, 300, t => {
        const steps = mul.workedSteps(mod, t);
        ok(steps.length === 3, 'Mul WE mod'+mod+' nivå'+lvl+': exakt 3 steg');
        ok(steps.every(s => typeof s === 'string' && s.length > 0), 'Mul WE mod'+mod+' nivå'+lvl+': alla steg ifyllda');
        /* sista steget bär facit */
        if (mod === 1 || mod === 2) ok(steps[2].includes(String(t.correct)), 'Mul WE mod'+mod+': sista steget bär facit');
        else                        ok(steps[2].includes(t.correctStr),      'Mul WE mod'+mod+': sista steget bär facit');

        const q = mul.whyQuestion(mod, t);
        ok(typeof q.prompt === 'string' && q.prompt.length > 0, 'Mul WHY mod'+mod+': prompt ifylld');
        ok(typeof q.correct === 'string' && q.correct.length > 0, 'Mul WHY mod'+mod+': korrekt rad ifylld');
        ok(q.distractors.length === 2, 'Mul WHY mod'+mod+': exakt 2 distraktorer');
        ok(distinct([q.correct, ...q.distractors]), 'Mul WHY mod'+mod+': 3 distinkta alternativ');
        ok(!q.distractors.includes(q.correct), 'Mul WHY mod'+mod+': facit ej bland distraktorer');
    })));
}

/* ═══════════ koordinat ═══════════ */
const koord = require('../logic/koordinat.js');

/* — fmtPt: exakt format — */
eq(koord.fmtPt(3, 2),   '(3, 2)',   'fmtPt (3,2)');
eq(koord.fmtPt(0, 0),   '(0, 0)',   'fmtPt origo');
eq(koord.fmtPt(-4, 5),  '(-4, 5)',  'fmtPt negativ x');

/* — M1: läs av punkt (första kvadranten) — */
[0,1,2].forEach(lvl => forEachRun(koord.genM1Task, lvl, RUNS, t => {
    ok(t.x >= 0 && t.x <= t.gridMax, 'Koord M1 nivå'+lvl+': x inom [0,gridMax]');
    ok(t.y >= 0 && t.y <= t.gridMax, 'Koord M1 nivå'+lvl+': y inom [0,gridMax]');
    ok(t.correctStr === koord.fmtPt(t.x, t.y), 'Koord M1 nivå'+lvl+': facit = fmtPt(x,y)');
    ok(t.distractors.length === 3, 'Koord M1 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correctStr, ...t.distractors]), 'Koord M1 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correctStr), 'Koord M1 nivå'+lvl+': facit ej bland distraktorer');
}));

/* — M2: hitta rätt punkt (A–D) — */
[0,1,2].forEach(lvl => forEachRun(koord.genM2Task, lvl, RUNS, t => {
    ok(t.points.length === 4, 'Koord M2 nivå'+lvl+': 4 punkter');
    ok(distinct(t.points.map(p => p.x + ',' + p.y)), 'Koord M2 nivå'+lvl+': distinkta punkter');
    ok(distinct(t.points.map(p => p.label)), 'Koord M2 nivå'+lvl+': distinkta etiketter');
    ok(t.points.every(p => p.x >= 0 && p.x <= t.gridMax && p.y >= 0 && p.y <= t.gridMax),
        'Koord M2 nivå'+lvl+': punkter inom rutnätet');
    const tgt = t.points.find(p => p.label === t.targetLabel);
    ok(tgt && tgt.x === t.x && tgt.y === t.y, 'Koord M2 nivå'+lvl+': targetLabel pekar på (x,y)');
}));

/* — M3: plotta punkt — */
[0,1,2].forEach(lvl => forEachRun(koord.genM3Task, lvl, RUNS, t => {
    ok(t.x >= 0 && t.x <= t.gridMax, 'Koord M3 nivå'+lvl+': x inom rutnätet');
    ok(t.y >= 0 && t.y <= t.gridMax, 'Koord M3 nivå'+lvl+': y inom rutnätet');
    ok(t.label === koord.fmtPt(t.x, t.y), 'Koord M3 nivå'+lvl+': label = fmtPt(x,y)');
}));

/* — M4: negativa koordinater (fyra kvadranter) — */
[0,1,2].forEach(lvl => forEachRun(koord.genM4Task, lvl, RUNS, t => {
    ok(t.x >= t.gridMin && t.x <= t.gridMax, 'Koord M4 nivå'+lvl+': x inom intervall');
    ok(t.y >= t.gridMin && t.y <= t.gridMax, 'Koord M4 nivå'+lvl+': y inom intervall');
    ok(t.x < 0 || t.y < 0, 'Koord M4 nivå'+lvl+': minst en koordinat negativ');
    ok(t.correctStr === koord.fmtPt(t.x, t.y), 'Koord M4 nivå'+lvl+': facit = fmtPt(x,y)');
    ok(t.distractors.length === 3, 'Koord M4 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correctStr, ...t.distractors]), 'Koord M4 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correctStr), 'Koord M4 nivå'+lvl+': facit ej bland distraktorer');
}));

/* — Mönster v2, lager 11a: löst exempel (workedSteps) — */
[1,2,3,4].forEach(mod => {
    const gen = mod === 1 ? koord.genM1Task : mod === 2 ? koord.genM2Task
              : mod === 3 ? koord.genM3Task : koord.genM4Task;
    [0,1,2].forEach(lvl => forEachRun(gen, lvl, RUNS, t => {
        const steps = koord.workedSteps(mod, t);
        ok(steps.length === 4, 'Koord WE mod'+mod+' nivå'+lvl+': exakt 4 steg');
        ok(steps.every(s => typeof s === 'string' && s.length > 0),
            'Koord WE mod'+mod+' nivå'+lvl+': alla steg ifyllda');
        /* x-steget speglar tecknet (höger/vänster/stå kvar) */
        const sx = steps[1];
        if (t.x > 0)      ok(sx.includes('höger'),   'Koord WE mod'+mod+' nivå'+lvl+': x>0 → höger');
        else if (t.x < 0) ok(sx.includes('vänster'), 'Koord WE mod'+mod+' nivå'+lvl+': x<0 → vänster');
        else              ok(sx.includes('Stå kvar'),'Koord WE mod'+mod+' nivå'+lvl+': x=0 → stå kvar');
        /* y-steget speglar tecknet (uppåt/nedåt/stå kvar) */
        const sy = steps[2];
        if (t.y > 0)      ok(sy.includes('uppåt'),   'Koord WE mod'+mod+' nivå'+lvl+': y>0 → uppåt');
        else if (t.y < 0) ok(sy.includes('nedåt'),   'Koord WE mod'+mod+' nivå'+lvl+': y<0 → nedåt');
        else              ok(sy.includes('Stå kvar'),'Koord WE mod'+mod+' nivå'+lvl+': y=0 → stå kvar');
        /* sista steget bär facit/uppmaningen */
        const last = steps[3];
        if (mod === 2)      ok(last.includes(t.targetLabel), 'Koord WE mod2: sista steget nämner rätt punkt');
        else if (mod === 3) ok(last.includes('Klicka'),      'Koord WE mod3: sista steget uppmanar klick');
        else                ok(last.includes(t.correctStr),  'Koord WE mod'+mod+': sista steget bär facit');
    }));
});

/* — Mönster v2, lager 11c: resonemang (whyQuestion) — */
[1,2,3,4].forEach(mod => {
    const gen = mod === 1 ? koord.genM1Task : mod === 2 ? koord.genM2Task
              : mod === 3 ? koord.genM3Task : koord.genM4Task;
    [0,1,2].forEach(lvl => forEachRun(gen, lvl, 200, t => {
        const q = koord.whyQuestion(mod, t);
        ok(typeof q.prompt === 'string' && q.prompt.length > 0, 'Koord WHY mod'+mod+': prompt ifylld');
        ok(typeof q.correct === 'string' && q.correct.length > 0, 'Koord WHY mod'+mod+': korrekt rad ifylld');
        ok(q.distractors.length === 2, 'Koord WHY mod'+mod+': exakt 2 distraktorer');
        ok(distinct([q.correct, ...q.distractors]), 'Koord WHY mod'+mod+': 3 distinkta alternativ');
        ok(!q.distractors.includes(q.correct), 'Koord WHY mod'+mod+': facit ej bland distraktorer');
        ok(q.distractors.every(d => typeof d === 'string' && d.length > 0), 'Koord WHY mod'+mod+': distraktorer ifyllda');
    }));
});

/* ═══════════ geometri ═══════════ */
const geo = require('../logic/geometri.js');

/* — classifyAngle: exakta gränser — */
eq(geo.classifyAngle(45),  'Spetsig', 'classifyAngle 45');
eq(geo.classifyAngle(89),  'Spetsig', 'classifyAngle 89');
eq(geo.classifyAngle(90),  'Rät',     'classifyAngle 90');
eq(geo.classifyAngle(120), 'Trubbig', 'classifyAngle 120');
eq(geo.classifyAngle(179), 'Trubbig', 'classifyAngle 179');
eq(geo.classifyAngle(180), 'Rak',     'classifyAngle 180');

/* — M1: vinkeltyp matchar gradtalet — */
[0,1,2].forEach(lvl => forEachRun(geo.genM1Task, lvl, RUNS, t => {
    ok(t.choices.length === 4, 'Geo M1 nivå'+lvl+': 4 alternativ');
    ok(distinct(t.choices), 'Geo M1 nivå'+lvl+': distinkta alternativ');
    ok(t.choices.includes(t.correct), 'Geo M1 nivå'+lvl+': facit finns bland alternativen');
    ok(geo.classifyAngle(t.deg) === t.correct, 'Geo M1 nivå'+lvl+': typ stämmer med gradtal ('+t.deg+'°)');
    ok(t.deg > 0 && t.deg <= 180, 'Geo M1 nivå'+lvl+': gradtal i (0,180]');
    if (lvl === 0) ok(t.correct !== 'Rak', 'Geo M1 nivå0: ingen rak vinkel');
}));

/* — M2: former — */
[0,1,2].forEach(lvl => forEachRun(geo.genM2Task, lvl, RUNS, t => {
    ok(t.distractors.length === 3, 'Geo M2 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correct, ...t.distractors]), 'Geo M2 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Geo M2 nivå'+lvl+': facit ej bland distraktorer');
    ok(geo.SHAPES[t.shape].name === t.correct, 'Geo M2 nivå'+lvl+': facit = formens namn');
}));

/* — M3: symmetrilinjer — */
[0,1,2].forEach(lvl => forEachRun(geo.genM3Task, lvl, RUNS, t => {
    ok(t.distractors.length === 3, 'Geo M3 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correct, ...t.distractors]), 'Geo M3 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Geo M3 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v >= 0 && Number.isInteger(v)), 'Geo M3 nivå'+lvl+': icke-negativa heltal');
    ok(geo.SYM[t.shape].axes === t.correct, 'Geo M3 nivå'+lvl+': facit = formens antal axlar');
}));

/* — M4: omkrets (matematisk korrekthet) — */
[0,1,2].forEach(lvl => forEachRun(geo.genM4Task, lvl, RUNS, t => {
    ok(t.distractors.length === 3, 'Geo M4 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correct, ...t.distractors]), 'Geo M4 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Geo M4 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0), 'Geo M4 nivå'+lvl+': positiva distraktorer');
    const exp = t.shape === 'kvadrat' ? 4 * t.a
              : t.shape === 'rektangel' ? 2 * (t.a + t.b)
              : t.a + t.b + t.c;
    ok(t.correct === exp, 'Geo M4 nivå'+lvl+': facit = omkrets ('+t.shape+')');
}));

/* — M5: area (matematisk korrekthet) — */
[0,1,2].forEach(lvl => forEachRun(geo.genM5Task, lvl, RUNS, t => {
    ok(t.distractors.length === 3, 'Geo M5 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correct, ...t.distractors]), 'Geo M5 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Geo M5 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0), 'Geo M5 nivå'+lvl+': positiva distraktorer');
    ok(t.correct === t.a * t.b, 'Geo M5 nivå'+lvl+': facit = a·b');
}));

/* — Mönster v2, lager 11a + 11c: workedSteps + whyQuestion (M1–M5) — */
{
    const GEO_GEN = { 1: geo.genM1Task, 2: geo.genM2Task, 3: geo.genM3Task, 4: geo.genM4Task, 5: geo.genM5Task };
    [1,2,3,4,5].forEach(mod => [0,1,2].forEach(lvl => forEachRun(GEO_GEN[mod], lvl, 300, t => {
        const steps = geo.workedSteps(mod, t);
        ok(steps.length === 3, 'Geo WE mod'+mod+' nivå'+lvl+': exakt 3 steg');
        ok(steps.every(s => typeof s === 'string' && s.length > 0), 'Geo WE mod'+mod+' nivå'+lvl+': alla steg ifyllda');
        /* sista steget bär facit */
        if (mod === 1)      ok(steps[2].includes(t.correct.toLowerCase()), 'Geo WE mod1: sista steget bär vinkeltyp');
        else if (mod === 2) ok(steps[2].includes(t.correct.toLowerCase()), 'Geo WE mod2: sista steget bär formnamn');
        else                ok(steps[2].includes(String(t.correct)),       'Geo WE mod'+mod+': sista steget bär facit');

        const q = geo.whyQuestion(mod, t);
        ok(typeof q.prompt === 'string' && q.prompt.length > 0, 'Geo WHY mod'+mod+': prompt ifylld');
        ok(typeof q.correct === 'string' && q.correct.length > 0, 'Geo WHY mod'+mod+': korrekt rad ifylld');
        ok(q.distractors.length === 2, 'Geo WHY mod'+mod+': exakt 2 distraktorer');
        ok(distinct([q.correct, ...q.distractors]), 'Geo WHY mod'+mod+': 3 distinkta alternativ');
        ok(!q.distractors.includes(q.correct), 'Geo WHY mod'+mod+': facit ej bland distraktorer');
    })));
}

/* ═══════════ algebra ═══════════ */
const alg = require('../logic/algebra.js');

/* — M1: substitution (matematisk korrekthet) — */
[0,1,2].forEach(lvl => forEachRun(alg.genM1Task, lvl, RUNS, t => {
    const exp = t.op === '+' ? t.a * t.x + t.b : t.a * t.x - t.b;
    ok(t.correct === exp, 'Alg M1 nivå'+lvl+': facit = a·x ± b');
    ok(t.correct > 0, 'Alg M1 nivå'+lvl+': facit > 0');
    ok(t.distractors.length === 3, 'Alg M1 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correct, ...t.distractors]), 'Alg M1 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Alg M1 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Alg M1 nivå'+lvl+': positiva heltal');
}));

/* — M2: skriv uttryck (struktur) — */
[0,1,2].forEach(lvl => forEachRun(alg.genM2Task, lvl, RUNS, t => {
    ok(typeof t.correct === 'string' && t.correct.length > 0, 'Alg M2 nivå'+lvl+': facit ej tomt');
    ok(t.distractors.length === 3, 'Alg M2 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correct, ...t.distractors]), 'Alg M2 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Alg M2 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.text.includes('x'), 'Alg M2 nivå'+lvl+': frågetexten nämner x');
}));

/* — M3: förenkla (samla termer) — */
[0,1,2].forEach(lvl => forEachRun(alg.genM3Task, lvl, RUNS, t => {
    ok(t.correctStr === t.coef + 'x', 'Alg M3 nivå'+lvl+': facit = coef·x');
    ok(t.coef >= 2, 'Alg M3 nivå'+lvl+': coef >= 2');
    ok(t.distractors.length === 3, 'Alg M3 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correctStr, ...t.distractors]), 'Alg M3 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correctStr), 'Alg M3 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.exprStr.includes('x'), 'Alg M3 nivå'+lvl+': uttrycket innehåller x');
}));

/* — M4: lös ekvation (facit löser ekvationen) — */
[0,1,2].forEach(lvl => forEachRun(alg.genM4Task, lvl, RUNS, t => {
    ok(t.correct === t.x, 'Alg M4 nivå'+lvl+': facit = x');
    ok(t.distractors.length === 3, 'Alg M4 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correct, ...t.distractors]), 'Alg M4 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Alg M4 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Alg M4 nivå'+lvl+': positiva heltal');
    ok(t.eqStr.includes('=') && t.eqStr.includes('x'), 'Alg M4 nivå'+lvl+': ekvation med x och =');
}));

/* — M5: mönster (aritmetisk följd) — */
[0,1,2].forEach(lvl => forEachRun(alg.genM5Task, lvl, RUNS, t => {
    ok(t.figures.length === 3, 'Alg M5 nivå'+lvl+': 3 figurer');
    ok(t.figures.every((v,i) => i === 0 || v - t.figures[i-1] === t.step), 'Alg M5 nivå'+lvl+': konstant steg');
    ok(t.correct === t.start + t.step * (t.askIndex - 1), 'Alg M5 nivå'+lvl+': facit = start + steg·(n-1)');
    ok(t.distractors.length === 3, 'Alg M5 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correct, ...t.distractors]), 'Alg M5 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Alg M5 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Alg M5 nivå'+lvl+': positiva heltal');
}));

/* — Mönster v2, lager 11a + 11c: workedSteps + whyQuestion (M1–M5) — */
{
    const ALG_GEN = { 1: alg.genM1Task, 2: alg.genM2Task, 3: alg.genM3Task, 4: alg.genM4Task, 5: alg.genM5Task };
    [1,2,3,4,5].forEach(mod => [0,1,2].forEach(lvl => forEachRun(ALG_GEN[mod], lvl, 300, t => {
        const steps = alg.workedSteps(mod, t);
        ok(steps.length === 3, 'Alg WE mod'+mod+' nivå'+lvl+': exakt 3 steg');
        ok(steps.every(s => typeof s === 'string' && s.length > 0), 'Alg WE mod'+mod+' nivå'+lvl+': alla steg ifyllda');
        /* sista steget bär facit */
        if (mod === 2)      ok(steps[2].includes(t.correct),          'Alg WE mod2: sista steget bär uttrycket');
        else if (mod === 3) ok(steps[2].includes(t.correctStr),       'Alg WE mod3: sista steget bär facit');
        else                ok(steps[2].includes(String(t.correct)),  'Alg WE mod'+mod+': sista steget bär facit');

        const q = alg.whyQuestion(mod, t);
        ok(typeof q.prompt === 'string' && q.prompt.length > 0, 'Alg WHY mod'+mod+': prompt ifylld');
        ok(typeof q.correct === 'string' && q.correct.length > 0, 'Alg WHY mod'+mod+': korrekt rad ifylld');
        ok(q.distractors.length === 2, 'Alg WHY mod'+mod+': exakt 2 distraktorer');
        ok(distinct([q.correct, ...q.distractors]), 'Alg WHY mod'+mod+': 3 distinkta alternativ');
        ok(!q.distractors.includes(q.correct), 'Alg WHY mod'+mod+': facit ej bland distraktorer');
    })));
}

/* ═══════════ statistik ═══════════ */
const stat = require('../logic/statistik.js');

/* — uniqueMode: exakta fall — */
eq(stat.uniqueMode([1,2,2,3]), 2, 'uniqueMode entydig');
ok(stat.uniqueMode([1,1,2,2]) === null, 'uniqueMode oavgjort → null');

/* — M1: läsa diagram — */
[0,1,2].forEach(lvl => forEachRun(stat.genM1Task, lvl, RUNS, t => {
    ok(t.names.length === 4 && t.values.length === 4, 'Stat M1 nivå'+lvl+': 4 staplar');
    ok(t.values.every(v => v >= 1 && v <= 10), 'Stat M1 nivå'+lvl+': värden 1–10');
    ok(t.distractors.length === 3, 'Stat M1 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correct, ...t.distractors]), 'Stat M1 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Stat M1 nivå'+lvl+': facit ej bland distraktorer');
    if (lvl === 0) ok(t.values.includes(t.correct), 'Stat M1 nivå0: facit = någon stapels värde');
    if (lvl === 1) ok(t.names.includes(t.correct), 'Stat M1 nivå1: facit = ett djurnamn');
    if (lvl === 2) ok(t.correct === Math.max(...t.values) - Math.min(...t.values) && t.correct > 0,
        'Stat M1 nivå2: facit = max - min > 0');
}));

/* — M2: medelvärde — */
[0,1,2].forEach(lvl => forEachRun(stat.genM2Task, lvl, RUNS, t => {
    ok(t.correct === t.sum / t.n && Number.isInteger(t.correct), 'Stat M2 nivå'+lvl+': facit = sum/n (heltal)');
    ok(t.nums.length === t.n && t.nums.reduce((a,b)=>a+b,0) === t.sum, 'Stat M2 nivå'+lvl+': sum stämmer');
    ok(t.distractors.length === 3, 'Stat M2 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correct, ...t.distractors]), 'Stat M2 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Stat M2 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Stat M2 nivå'+lvl+': positiva heltal');
}));

/* — M3: sannolikhet — */
[0,1,2].forEach(lvl => forEachRun(stat.genM3Task, lvl, RUNS, t => {
    const sum = t.colors.reduce((a,c)=>a+c.count,0);
    ok(sum === t.total, 'Stat M3 nivå'+lvl+': total = summa av kulor');
    ok(t.correct === t.k + ' av ' + t.total, 'Stat M3 nivå'+lvl+': facit = k av total');
    ok(t.distractors.length === 3, 'Stat M3 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correct, ...t.distractors]), 'Stat M3 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Stat M3 nivå'+lvl+': facit ej bland distraktorer');
}));

/* — M4: kombinatorik — */
[0,1,2].forEach(lvl => forEachRun(stat.genM4Task, lvl, RUNS, t => {
    const exp = t.c == null ? t.a * t.b : t.a * t.b * t.c;
    ok(t.correct === exp, 'Stat M4 nivå'+lvl+': facit = produkten');
    ok(t.distractors.length === 3, 'Stat M4 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correct, ...t.distractors]), 'Stat M4 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Stat M4 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Stat M4 nivå'+lvl+': positiva heltal');
}));

/* — M5: typvärde — */
[0,1,2].forEach(lvl => forEachRun(stat.genM5Task, lvl, RUNS, t => {
    ok(t.correct === stat.uniqueMode(t.data), 'Stat M5 nivå'+lvl+': facit = entydigt typvärde');
    ok(t.data.includes(t.correct), 'Stat M5 nivå'+lvl+': typvärdet finns i datan');
    ok(t.distractors.length === 3, 'Stat M5 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correct, ...t.distractors]), 'Stat M5 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Stat M5 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Stat M5 nivå'+lvl+': positiva heltal');
}));

/* — Mönster v2, lager 11a + 11c: workedSteps + whyQuestion (M1–M5) — */
{
    const STAT_GEN = { 1: stat.genM1Task, 2: stat.genM2Task, 3: stat.genM3Task, 4: stat.genM4Task, 5: stat.genM5Task };
    [1,2,3,4,5].forEach(mod => [0,1,2].forEach(lvl => forEachRun(STAT_GEN[mod], lvl, 300, t => {
        const steps = stat.workedSteps(mod, t);
        ok(steps.length === 3, 'Stat WE mod'+mod+' nivå'+lvl+': exakt 3 steg');
        ok(steps.every(s => typeof s === 'string' && s.length > 0), 'Stat WE mod'+mod+' nivå'+lvl+': alla steg ifyllda');
        ok(steps[2].includes(String(t.correct)), 'Stat WE mod'+mod+' nivå'+lvl+': sista steget bär facit');

        const q = stat.whyQuestion(mod, t);
        ok(typeof q.prompt === 'string' && q.prompt.length > 0, 'Stat WHY mod'+mod+': prompt ifylld');
        ok(typeof q.correct === 'string' && q.correct.length > 0, 'Stat WHY mod'+mod+': korrekt rad ifylld');
        ok(q.distractors.length === 2, 'Stat WHY mod'+mod+': exakt 2 distraktorer');
        ok(distinct([q.correct, ...q.distractors]), 'Stat WHY mod'+mod+': 3 distinkta alternativ');
        ok(!q.distractors.includes(q.correct), 'Stat WHY mod'+mod+': facit ej bland distraktorer');
    })));
}

/* ═══════════ brak ═══════════ */
const brak = require('../logic/brak.js');
const APX = '≈ ';

/* — M1: fmtDec/fmtPct exakta värden — */
eq(brak.fmtDec(1,2), '0,5',  'fmtDec 1/2');
eq(brak.fmtDec(1,4), '0,25', 'fmtDec 1/4');
eq(brak.fmtDec(3,4), '0,75', 'fmtDec 3/4');
eq(brak.fmtDec(1,5), '0,2',  'fmtDec 1/5');
eq(brak.fmtDec(7,10),'0,7',  'fmtDec 7/10');
eq(brak.fmtDec(1,3), APX+'0,33', 'fmtDec 1/3 (approx)');
eq(brak.fmtDec(2,3), APX+'0,67', 'fmtDec 2/3 (approx)');
eq(brak.fmtPct(1,2), '50%', 'fmtPct 1/2');
eq(brak.fmtPct(1,4), '25%', 'fmtPct 1/4');
eq(brak.fmtPct(3,5), '60%', 'fmtPct 3/5');
eq(brak.fmtPct(3,4), '75%', 'fmtPct 3/4');
eq(brak.fmtPct(1,3), APX+'33,3%', 'fmtPct 1/3 (approx)');

const fkey = fr => fr.n + '/' + fr.d;

/* — M3: addition/subtraktion samma nämnare — */
forEachRun(brak.genM3Task, undefined, RUNS, t => {
    ok(t.a >= 1 && t.b >= 1, 'M3: a,b >= 1');
    ok(t.ans === (t.isAdd ? t.a + t.b : t.a - t.b), 'M3: ans = a±b');
    ok(t.ans >= 1 && t.ans < t.d, 'M3: 1 <= ans < d');
});

/* — Del av antal 1 & 2 — */
forEachRun(brak.genDa1Task, undefined, RUNS, t => {
    ok(t.distractors.length === 3, 'Da1: 3 distraktorer');
    ok(distinct([t.whole, ...t.distractors]), 'Da1: 4 distinkta alternativ');
    ok(!t.distractors.includes(t.whole), 'Da1: facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Da1: positiva heltal');
    ok(t.whole === t.frac.d * t.k && t.part === t.frac.n * t.k, 'Da1: helhet/del korrekt');
});
forEachRun(brak.genDa2Task, undefined, RUNS, t => {
    ok(t.distractors.length === 3, 'Da2: 3 distraktorer');
    ok(distinct([t.result, ...t.distractors]), 'Da2: 4 distinkta alternativ');
    ok(!t.distractors.includes(t.result), 'Da2: facit ej bland distraktorer');
    ok(t.result === t.frac.n * (t.integer / t.frac.d), 'Da2: resultat korrekt');
});

/* — M7 & M8: bråkaddition/subtraktion med distraktorer — */
[1,2,3].forEach(lvl => forEachRun(brak.genM7Task, lvl, RUNS, t => {
    const exp = brak.simplify(t.a + t.b, t.d);
    ok(t.ansN === exp.n && t.ansD === exp.d, 'M7 nivå'+lvl+': facit = simplify(a+b,d)');
    const ds = brak.m7Distractors(t);
    ok(ds.length === 3, 'M7 nivå'+lvl+': 3 distraktorer');
    const keys = [fkey({n:t.ansN,d:t.ansD}), ...ds.map(fkey)];
    ok(distinct(keys), 'M7 nivå'+lvl+': 4 distinkta alternativ');
    ok(!ds.some(d => d.n === t.ansN && d.d === t.ansD), 'M7 nivå'+lvl+': facit ej bland distraktorer');
    ok(ds.every(d => d.n > 0 && d.d > 0), 'M7 nivå'+lvl+': giltiga bråk');
}));
[1,2,3].forEach(lvl => forEachRun(brak.genM8Task, lvl, RUNS, t => {
    ok(t.a > t.b, 'M8 nivå'+lvl+': a > b (positivt svar)');
    const exp = brak.simplify(t.a - t.b, t.d);
    ok(t.ansN === exp.n && t.ansD === exp.d, 'M8 nivå'+lvl+': facit = simplify(a-b,d)');
    const ds = brak.m8Distractors(t);
    ok(ds.length === 3, 'M8 nivå'+lvl+': 3 distraktorer');
    const keys = [fkey({n:t.ansN,d:t.ansD}), ...ds.map(fkey)];
    ok(distinct(keys), 'M8 nivå'+lvl+': 4 distinkta alternativ');
    ok(!ds.some(d => d.n === t.ansN && d.d === t.ansD), 'M8 nivå'+lvl+': facit ej bland distraktorer');
}));

/* — M9: procent — */
[1,2,3].forEach(lvl => forEachRun(brak.genM9Task, lvl, RUNS, t => {
    ok(Number.isInteger(t.ans) && t.ans > 0, 'M9 nivå'+lvl+': heltalssvar > 0');
    const ds = (lvl === 3) ? t.distractors : brak.m9NumDistractors(t.ans, t.pct, t.whole);
    ok(ds.length === 3, 'M9 nivå'+lvl+': 3 distraktorer');
    ok(distinct([t.ans, ...ds]), 'M9 nivå'+lvl+': 4 distinkta alternativ');
    ok(!ds.includes(t.ans), 'M9 nivå'+lvl+': facit ej bland distraktorer');
}));
/* M9 nivå 2: svaret är alltid pct% av whole */
forEachRun(brak.genM9Task, 2, RUNS, t => {
    ok(t.ans === t.pct * t.whole / 100, 'M9 nivå2: ans = pct% av whole');
});

/* — M10: samma tal i tre former — */
[1,2,3].forEach(lvl => forEachRun(brak.genM10Task, lvl, RUNS, t => {
    ok(t.from !== t.to, 'M10 nivå'+lvl+': från ≠ till');
    const ch = brak.m10Choices(t);
    ok(ch.length === 4, 'M10 nivå'+lvl+': 4 alternativ');
    ok(distinct(ch.map(brak.m10Val)), 'M10 nivå'+lvl+': distinkta värden');
    ok(ch.some(fr => brak.m10Val(fr) === brak.m10Val(t)), 'M10 nivå'+lvl+': facit finns bland alternativen');
}));

/* — Mönster v2, lager 11a + 11c: workedSteps + whyQuestion (6 flervalsmoduler) — */
{
    const sub = s => s.replace('≈ ', '');   // m10-decimaler kan ha ≈-prefix i facit
    const cases = [
        { key: 'da1', gen: () => brak.genDa1Task(),  ans: t => String(t.whole) },
        { key: 'da2', gen: () => brak.genDa2Task(),  ans: t => String(t.result) },
        { key: 'm7',  gen: () => brak.genM7Task(2),  ans: t => t.ansN + '/' + t.ansD },
        { key: 'm8',  gen: () => brak.genM8Task(2),  ans: t => t.ansN + '/' + t.ansD },
        { key: 'm9',  gen: () => brak.genM9Task(2),  ans: t => String(t.ans) },
        { key: 'm10', gen: () => brak.genM10Task(3), ans: t => sub(brak.m10Text(t.to, t.n, t.d)) }
    ];
    cases.forEach(c => {
        for (let r = 0; r < 400; r++) {
            const t = c.gen();
            const steps = brak.workedSteps(c.key, t);
            ok(steps.length === 3, 'Brak WE ' + c.key + ': exakt 3 steg');
            ok(steps.every(s => typeof s === 'string' && s.length > 0), 'Brak WE ' + c.key + ': alla steg ifyllda');
            ok(sub(steps[2]).includes(c.ans(t)), 'Brak WE ' + c.key + ': sista steget bär facit');

            const q = brak.whyQuestion(c.key, t);
            ok(typeof q.prompt === 'string' && q.prompt.length > 0, 'Brak WHY ' + c.key + ': prompt ifylld');
            ok(typeof q.correct === 'string' && q.correct.length > 0, 'Brak WHY ' + c.key + ': korrekt rad ifylld');
            ok(q.distractors.length === 2, 'Brak WHY ' + c.key + ': exakt 2 distraktorer');
            ok(distinct([q.correct, ...q.distractors]), 'Brak WHY ' + c.key + ': 3 distinkta alternativ');
            ok(!q.distractors.includes(q.correct), 'Brak WHY ' + c.key + ': facit ej bland distraktorer');
        }
    });
}

/* ═══════════ taluppfattning ═══════════ */
const tal = require('../logic/taluppfattning.js');

/* — numToSv: exakta ord — */
eq(tal.numToSv(1),    'ett',                 'numToSv 1');
eq(tal.numToSv(21),   'tjugoett',            'numToSv 21');
eq(tal.numToSv(40),   'fyrtio',              'numToSv 40');
eq(tal.numToSv(100),  'enhundra',            'numToSv 100');
eq(tal.numToSv(342),  'trehundrafyrtiotvå',  'numToSv 342');
eq(tal.numToSv(1000), 'etttusen',            'numToSv 1000');
eq(tal.numToSv(2025), 'tvåtusentjugofem',    'numToSv 2025');

/* — M1 & M2: positionsvärde — */
[['M1', tal.genM1Task], ['M2', tal.genM2Task]].forEach(([nm, gen]) =>
    forEachRun(gen, undefined, RUNS, t => {
        ok(t.correct === t.digitVal * t.posValue, nm + ': correct = digit·platsvärde');
        ok(t.distractors.length === 3, nm + ': 3 distraktorer (fick ' + t.distractors.length + ')');
        ok(distinct([t.correct, ...t.distractors]), nm + ': 4 distinkta alternativ');
        ok(!t.distractors.includes(t.correct), nm + ': facit ej bland distraktorer');
        ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), nm + ': positiva heltal');
    }));

/* — M3: talföljder (correct + 2 distraktorer) — */
[0,1,2].forEach(lvl => forEachRun(tal.genM3Task, lvl, RUNS, t => {
    ok(t.correct === t.series[t.missingIdx], 'M3 nivå'+lvl+': facit = saknad position');
    ok(t.series.every((v,i) => i === 0 || v - t.series[i-1] === t.step), 'M3 nivå'+lvl+': konstant steg');
    ok(t.distractors.length === 2, 'M3 nivå'+lvl+': 2 distraktorer');
    ok(distinct([t.correct, ...t.distractors]), 'M3 nivå'+lvl+': distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'M3 nivå'+lvl+': facit ej bland distraktorer');
}));

/* — M4: jämföra (störst av A,B) — */
[0,1,2].forEach(lvl => forEachRun(tal.genM4Task, lvl, RUNS, t => {
    ok(t.A !== t.B, 'M4 nivå'+lvl+': olika tal');
    ok(t.correct === Math.max(t.A, t.B), 'M4 nivå'+lvl+': facit = störst');
}));

/* — M5: läsa tal — */
[0,1,2].forEach(lvl => forEachRun(tal.genM5Task, lvl, RUNS, t => {
    ok(t.word === tal.numToSv(t.n), 'M5 nivå'+lvl+': ord = numToSv(n)');
    ok(t.distractors.length === 3, 'M5 nivå'+lvl+': 3 distraktorer');
    ok(distinct([t.n, ...t.distractors]), 'M5 nivå'+lvl+': distinkta tal');
    ok(!t.distractors.includes(t.n), 'M5 nivå'+lvl+': facit ej bland distraktorer');
}));

/* — M6: avrundning — */
[0,1,2].forEach(lvl => forEachRun(tal.genM6Task, lvl, RUNS, t => {
    const step = t.cfg.step;
    const exp  = Math.round(t.n / step) * step;
    ok(t.correct === exp, 'M6 nivå'+lvl+': facit = avrundat n');
    ok(t.correct % step === 0, 'M6 nivå'+lvl+': facit jämnt delbart med steg');
    ok(t.distractors.length === 3, 'M6 nivå'+lvl+': 3 distraktorer');
    ok(distinct([t.correct, ...t.distractors]), 'M6 nivå'+lvl+': distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'M6 nivå'+lvl+': facit ej bland distraktorer');
}));

/* — M7: negativa tal på tallinjen — */
[0,1,2].forEach(lvl => forEachRun(tal.genM7Task, lvl, RUNS, t => {
    ok(t.allPositions.length === 4, 'M7 nivå'+lvl+': 4 punkter');
    ok(distinct(t.allPositions), 'M7 nivå'+lvl+': distinkta positioner');
    ok(t.allPositions[t.correctPt - 1] === t.target, 'M7 nivå'+lvl+': correctPt pekar på target');
    ok(t.allPositions.every(p => p >= t.rangeMin && p <= t.rangeMax), 'M7 nivå'+lvl+': inom intervall');
}));

/* — M8: jämföra negativa tal — */
[0,1,2].forEach(lvl => forEachRun(tal.genM8Task, lvl, RUNS, t => {
    ok(t.numbers.length === (lvl === 2 ? 3 : 2), 'M8 nivå'+lvl+': rätt antal tal');
    ok(distinct(t.numbers), 'M8 nivå'+lvl+': distinkta tal');
    ok(t.correct === Math.max(...t.numbers), 'M8 nivå'+lvl+': facit = störst');
    ok(t.numbers.includes(t.correct), 'M8 nivå'+lvl+': facit finns bland talen');
}));

/* — Mönster v2, lager 11a + 11c: workedSteps + whyQuestion (M1–M8) — */
const TAL_GEN = {
    1: () => tal.genM1Task(),  2: () => tal.genM2Task(),
    3: (l) => tal.genM3Task(l), 4: (l) => tal.genM4Task(l),
    5: (l) => tal.genM5Task(l), 6: (l) => tal.genM6Task(l),
    7: (l) => tal.genM7Task(l), 8: (l) => tal.genM8Task(l)
};
[1,2,3,4,5,6,7,8].forEach(mod => {
    for (let r = 0; r < 400; r++) {
        const lvl = mod <= 2 ? undefined : (r % 3);
        const t = TAL_GEN[mod](lvl);
        const steps = tal.workedSteps(mod, t);
        ok(steps.length === 3, 'Tal WE mod'+mod+': exakt 3 steg');
        ok(steps.every(s => typeof s === 'string' && s.length > 0), 'Tal WE mod'+mod+': alla steg ifyllda');
        /* sista steget bär facit/uppmaningen */
        if (mod === 5)      ok(steps[2].includes(t.word),                'Tal WE mod5: sista steget bär ordet');
        else if (mod === 7) ok(steps[2].includes('Punkt ' + t.correctPt),'Tal WE mod7: sista steget bär punkten');
        else                ok(steps[2].includes(String(t.correct)),     'Tal WE mod'+mod+': sista steget bär facit');

        const q = tal.whyQuestion(mod, t);
        ok(typeof q.prompt === 'string' && q.prompt.length > 0, 'Tal WHY mod'+mod+': prompt ifylld');
        ok(typeof q.correct === 'string' && q.correct.length > 0, 'Tal WHY mod'+mod+': korrekt rad ifylld');
        ok(q.distractors.length === 2, 'Tal WHY mod'+mod+': exakt 2 distraktorer');
        ok(distinct([q.correct, ...q.distractors]), 'Tal WHY mod'+mod+': 3 distinkta alternativ');
        ok(!q.distractors.includes(q.correct), 'Tal WHY mod'+mod+': facit ej bland distraktorer');
    }
});

/* ═══════════ klockan ═══════════ */
const klock = require('../logic/klockan.js');

/* — exakta visarvinklar — */
const A = (h,m) => klock.clockHandAngles(h,m);
eq(A(3,0).hrDeg,   90,  'klocka 3:00 timvinkel');
eq(A(3,0).minDeg,  0,   'klocka 3:00 minutvinkel');
eq(A(6,0).hrDeg,   180, 'klocka 6:00 timvinkel');
eq(A(12,0).hrDeg,  0,   'klocka 12:00 timvinkel (h%12=0)');
eq(A(6,30).minDeg, 180, 'klocka 6:30 minutvinkel');
eq(A(6,30).hrDeg,  195, 'klocka 6:30 timvinkel (halvvägs)');
eq(A(9,15).minDeg, 90,  'klocka 9:15 minutvinkel');
eq(A(9,15).hrDeg,  277.5, 'klocka 9:15 timvinkel');
eq(A(1,0).hrDeg,   30,  'klocka 1:00 timvinkel');

/* — invarianter över alla giltiga tider (h 1–12, m 0,5,…,55) — */
for (let h = 1; h <= 12; h++) {
    for (let m = 0; m < 60; m += 5) {
        const a = A(h, m);
        ok(a.minDeg === m * 6, 'klocka '+h+':'+m+' minutvinkel = m·6');
        ok(a.hrDeg >= 0 && a.hrDeg < 360, 'klocka '+h+':'+m+' timvinkel inom [0,360)');
        ok(a.minDeg >= 0 && a.minDeg < 360, 'klocka '+h+':'+m+' minutvinkel inom [0,360)');
    }
}

/* — Mönster v2, lager 11a: löst exempel (workedSteps) — */
eq(klock.pad(0), '00', 'klock pad 0');
eq(klock.pad(5), '05', 'klock pad 5');
eq(klock.minuteStep(0).includes('0 minuter'), true, 'klock minuteStep 0 → 0 minuter');
for (let h = 1; h <= 12; h++) {
    for (let m = 0; m < 60; m += 5) {
        const s = klock.workedSteps(h, m);
        ok(s.length === 3, 'klock WE '+h+':'+m+': exakt 3 steg');
        ok(s.every(x => typeof x === 'string' && x.length > 0), 'klock WE '+h+':'+m+': alla steg ifyllda');
        ok(s[0].includes(String(h)), 'klock WE '+h+':'+m+': steg 1 nämner timmen');
        if (m > 0) ok(s[1].includes(String(m)), 'klock WE '+h+':'+m+': steg 2 nämner minuterna');
        ok(s[2].includes(h + ':' + klock.pad(m)), 'klock WE '+h+':'+m+': steg 3 bär tiden');
    }
}

/* — Mönster v2, lager 11c: resonemang (whyQuestion) — */
{
    const q = klock.whyQuestion(3, 20);
    ok(typeof q.prompt === 'string' && q.prompt.length > 0, 'klock WHY: prompt ifylld');
    ok(typeof q.correct === 'string' && q.correct.length > 0, 'klock WHY: korrekt rad ifylld');
    ok(q.distractors.length === 2, 'klock WHY: exakt 2 distraktorer');
    ok(distinct([q.correct, ...q.distractors]), 'klock WHY: 3 distinkta alternativ');
    ok(!q.distractors.includes(q.correct), 'klock WHY: facit ej bland distraktorer');
    ok(q.distractors.every(d => typeof d === 'string' && d.length > 0), 'klock WHY: distraktorer ifyllda');
}

/* ═══════════ Resultat ═══════════ */
console.log('');
console.log('  PASS: ' + pass);
console.log('  FAIL: ' + fail);
if (fail > 0) {
    console.log('\n  Misslyckade kontroller (unika):');
    [...new Set(fails)].slice(0, 40).forEach(m => console.log('   ✗ ' + m));
    process.exit(1);
} else {
    console.log('\n  ✓ Alla tester gröna.\n');
}
