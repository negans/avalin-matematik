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

/* — M6: triangelns area (b·h/2) — */
[0,1,2].forEach(lvl => forEachRun(geo.genM6Task, lvl, RUNS, t => {
    ok(t.correct === t.b * t.h / 2, 'Geo M6 nivå'+lvl+': facit = b·h/2');
    ok(Number.isInteger(t.correct), 'Geo M6 nivå'+lvl+': heltalsarea');
    ok(t.distractors.length === 3, 'Geo M6 nivå'+lvl+': 3 distraktorer');
    ok(distinct([t.correct, ...t.distractors]), 'Geo M6 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Geo M6 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Geo M6 nivå'+lvl+': positiva heltal');
}));

/* — Mönster v2, lager 11a + 11c: workedSteps + whyQuestion (M1–M6) — */
{
    const GEO_GEN = { 1: geo.genM1Task, 2: geo.genM2Task, 3: geo.genM3Task, 4: geo.genM4Task, 5: geo.genM5Task, 6: geo.genM6Task };
    [1,2,3,4,5,6].forEach(mod => [0,1,2].forEach(lvl => forEachRun(GEO_GEN[mod], lvl, 300, t => {
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

/* — M7: cirkelns delar (radie/diameter/medelpunkt + d=2r) — */
[0,1,2].forEach(lvl => forEachRun(geo.genM7Task, lvl, RUNS, t => {
    if (lvl === 0) {
        ok(t.kind === 'id', 'Geo M7 nivå0: id-typ');
        ok(t.choices.length === 3 && t.choices.includes(t.correct), 'Geo M7 nivå0: facit bland 3 termer');
    } else if (lvl === 1) {
        ok(t.kind === 'r2d' && t.correct === 2 * t.r, 'Geo M7 nivå1: diameter = 2·radie');
        ok(t.distractors.length === 3 && distinct([t.correct, ...t.distractors]) && !t.distractors.includes(t.correct), 'Geo M7 nivå1: distraktorer ok');
    } else {
        ok(t.kind === 'd2r' && t.correct === t.d / 2, 'Geo M7 nivå2: radie = diameter/2');
        ok(t.distractors.length === 3 && distinct([t.correct, ...t.distractors]) && !t.distractors.includes(t.correct), 'Geo M7 nivå2: distraktorer ok');
    }
    const steps = geo.workedSteps(7, t);
    ok(steps.length === 3 && steps.every(s => typeof s === 'string' && s.length > 0), 'Geo M7 WE nivå'+lvl+': 3 steg ifyllda');
    const q = geo.whyQuestion(7, t);
    ok(q.distractors.length === 2 && distinct([q.correct, ...q.distractors]) && !q.distractors.includes(q.correct), 'Geo M7 WHY: doktrin');
}));

/* — M8: sammansatta figurer (a·c + b·d) — */
[0,1,2].forEach(lvl => forEachRun(geo.genM8Task, lvl, RUNS, t => {
    ok(t.correct === t.a * t.c + t.b * t.d, 'Geo M8 nivå'+lvl+': area = a·c + b·d');
    ok(t.r1 === t.a * t.c && t.r2 === t.b * t.d, 'Geo M8 nivå'+lvl+': delareor');
    ok(t.b < t.a, 'Geo M8 nivå'+lvl+': överdel smalare');
    ok(t.distractors.length === 3, 'Geo M8 nivå'+lvl+': 3 distraktorer');
    ok(distinct([t.correct, ...t.distractors]), 'Geo M8 nivå'+lvl+': distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Geo M8 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Geo M8 nivå'+lvl+': positiva heltal');
    const steps = geo.workedSteps(8, t);
    ok(steps.length === 3 && steps[2].includes(String(t.correct)), 'Geo M8 WE: 3 steg, sista bär facit');
    const q = geo.whyQuestion(8, t);
    ok(q.distractors.length === 2 && distinct([q.correct, ...q.distractors]) && !q.distractors.includes(q.correct), 'Geo M8 WHY: doktrin');
}));

/* — M9: 3D-former (känna igen) — */
const SHAPE3D_NAMES = ['Kub','Rätblock','Klot','Cylinder','Kon','Pyramid'];
const M9_EASY = ['Kub','Klot','Cylinder','Kon'];
{
    const seen = new Set();
    [0,1,2].forEach(lvl => forEachRun(geo.genM9Task, lvl, RUNS, t => {
        ok(SHAPE3D_NAMES.includes(t.correct), 'Geo M9 nivå'+lvl+': facit är en 3D-form');
        ok(['en','ett'].includes(t.art), 'Geo M9 nivå'+lvl+': art är en/ett');
        ok(geo.SHAPES_3D[t.shape].name === t.correct && geo.SHAPES_3D[t.shape].art === t.art, 'Geo M9 nivå'+lvl+': shape/namn/art konsistenta');
        if (lvl === 0) ok(M9_EASY.includes(t.correct), 'Geo M9 nivå0: bara de fyra tydliga formerna');
        ok(t.distractors.length === 3, 'Geo M9 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
        ok(t.distractors.every(d => SHAPE3D_NAMES.includes(d)), 'Geo M9 nivå'+lvl+': distraktorer är giltiga formnamn');
        ok(distinct([t.correct, ...t.distractors]), 'Geo M9 nivå'+lvl+': 4 distinkta alternativ');
        ok(!t.distractors.includes(t.correct), 'Geo M9 nivå'+lvl+': facit ej bland distraktorer');
        const steps = geo.workedSteps(9, t);
        ok(steps.length === 3 && steps.every(s => typeof s === 'string' && s.length > 0), 'Geo M9 WE nivå'+lvl+': 3 steg ifyllda');
        ok(steps[2].includes(t.correct.toLowerCase()) && steps[2].includes(t.art + ' '), 'Geo M9 WE: sista steget bär "art + formnamn"');
        const q = geo.whyQuestion(9, t);
        ok(q.distractors.length === 2 && distinct([q.correct, ...q.distractors]) && !q.distractors.includes(q.correct), 'Geo M9 WHY: doktrin');
        seen.add(t.correct);
    }));
    ok(SHAPE3D_NAMES.every(n => seen.has(n)), 'Geo M9: alla sex 3D-former nåbara (fick '+[...seen].join(',')+')');
}

/* — M10: volym (räkna kuber · liter→dl · jämför enheter) — */
/* nivå 0: räkna enhetskuber → cm³ */
forEachRun(geo.genM10Task, 0, RUNS, t => {
    ok(t.kind === 'cubes', 'Geo M10 nivå0: kind=cubes');
    ok(t.correct === t.l * t.b * t.h, 'Geo M10 nivå0: volym = l·b·h');
    ok(t.l >= 2 && t.b >= 2 && t.h >= 2, 'Geo M10 nivå0: snälla mått ≥2');
    ok(t.unit === 'cm³', 'Geo M10 nivå0: enhet cm³');
    ok(t.distractors.length === 3, 'Geo M10 nivå0: 3 distraktorer');
    ok(distinct([t.correct, ...t.distractors]), 'Geo M10 nivå0: distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Geo M10 nivå0: facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Geo M10 nivå0: positiva heltal');
});
/* nivå 1: liter → deciliter (1 l = 10 dl) */
forEachRun(geo.genM10Task, 1, RUNS, t => {
    ok(t.kind === 'l2dl', 'Geo M10 nivå1: kind=l2dl');
    ok(t.correct === t.liter * 10, 'Geo M10 nivå1: dl = liter·10');
    ok(t.unit === 'dl', 'Geo M10 nivå1: enhet dl');
    ok(t.distractors.length === 3, 'Geo M10 nivå1: 3 distraktorer');
    ok(distinct([t.correct, ...t.distractors]), 'Geo M10 nivå1: distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Geo M10 nivå1: facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Geo M10 nivå1: positiva heltal');
});
/* nivå 2: jämför volymer i blandade enheter – facit rymmer mest */
forEachRun(geo.genM10Task, 2, RUNS, t => {
    ok(t.kind === 'compare', 'Geo M10 nivå2: kind=compare');
    ok(t.options.length === 4, 'Geo M10 nivå2: fyra behållare');
    ok(t.correct === t.options[0].text && t.correctMl === t.options[0].ml, 'Geo M10 nivå2: facit = första behållaren');
    ok(t.options.every(o => o.ml <= t.correctMl), 'Geo M10 nivå2: facit har störst volym');
    ok(t.options.filter(o => o.ml === t.correctMl).length === 1, 'Geo M10 nivå2: unik största volym');
    ok(t.options.slice(1).every(o => o.ml <= 0.7 * t.correctMl), 'Geo M10 nivå2: distraktorer ≤ 70 % av facit (visuellt tydligt fullast)');
    ok(distinct(t.options.map(o => o.ml)), 'Geo M10 nivå2: distinkta volymer');
    ok(distinct(t.options.map(o => o.text)), 'Geo M10 nivå2: distinkta etiketter');
    ok(t.distractors.length === 3 && !t.distractors.includes(t.correct), 'Geo M10 nivå2: 3 distraktorer, facit ej bland');
    const num = s => parseInt(s, 10);
    ok(t.options.slice(1).some(o => num(o.text) > num(t.correct) && o.ml < t.correctMl), 'Geo M10 nivå2: taljämförelse-fälla finns');
});
/* mönster v2 för M10 */
[0,1,2].forEach(lvl => forEachRun(geo.genM10Task, lvl, RUNS, t => {
    const steps = geo.workedSteps(10, t);
    ok(steps.length === 3 && steps.every(s => typeof s === 'string' && s.length > 0), 'Geo M10 WE nivå'+lvl+': 3 steg ifyllda');
    const facit = t.kind === 'compare' ? t.correct : String(t.correct);
    ok(steps[2].includes(facit), 'Geo M10 WE nivå'+lvl+': sista steget bär facit');
    const q = geo.whyQuestion(10, t);
    ok(q.distractors.length === 2 && distinct([q.correct, ...q.distractors]) && !q.distractors.includes(q.correct), 'Geo M10 WHY: doktrin');
}));

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
    ok(['röd','blå','grön','gul'].includes(t.askSing), 'Stat M3 nivå'+lvl+': askSing är singularform');
    ok(['röda','blå','gröna','gula'].includes(t.askName), 'Stat M3 nivå'+lvl+': askName är pluralform');
    ok({röda:'röd',blå:'blå',gröna:'grön',gula:'gul'}[t.askName] === t.askSing, 'Stat M3 nivå'+lvl+': askSing matchar askName');
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

/* — M6: median — */
function medianOf(a) { const s = [...a].sort((x,y)=>x-y); return s[(s.length-1)/2]; }
[0,1,2].forEach(lvl => forEachRun(stat.genM6Task, lvl, RUNS, t => {
    const size = lvl === 0 ? 3 : lvl === 1 ? 5 : 7;
    ok(t.data.length === size, 'Stat M6 nivå'+lvl+': '+size+' tal (udda antal)');
    ok(t.correct === medianOf(t.data), 'Stat M6 nivå'+lvl+': facit = mittersta i sorterad ordning');
    ok(Number.isInteger(t.correct) && t.correct > 0, 'Stat M6 nivå'+lvl+': median heltal > 0');
    ok(t.data.includes(t.correct), 'Stat M6 nivå'+lvl+': medianen finns i datan');
    ok(t.sorted.join(',') === [...t.data].sort((a,b)=>a-b).join(','), 'Stat M6 nivå'+lvl+': sorted = datan sorterad stigande');
    ok(t.data[(size-1)/2] !== t.correct, 'Stat M6 nivå'+lvl+': osorterat mittvärde ≠ median (sortering krävs)');
    ok(t.distractors.length === 3, 'Stat M6 nivå'+lvl+': 3 distraktorer (fick '+t.distractors.length+')');
    ok(distinct([t.correct, ...t.distractors]), 'Stat M6 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Stat M6 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Stat M6 nivå'+lvl+': positiva heltal');
    const we6 = stat.workedSteps(6, t);
    ok(we6[0].includes(t.data.join(', ')) && we6[0].includes(t.sorted.join(', ')),
       'Stat M6 nivå'+lvl+': WE steg 1 visar osorterat → sorterat (transformationen)');
}));

/* — Mönster v2, lager 11a + 11c: workedSteps + whyQuestion (M1–M6) — */
{
    const STAT_GEN = { 1: stat.genM1Task, 2: stat.genM2Task, 3: stat.genM3Task, 4: stat.genM4Task, 5: stat.genM5Task, 6: stat.genM6Task };
    [1,2,3,4,5,6].forEach(mod => [0,1,2].forEach(lvl => forEachRun(STAT_GEN[mod], lvl, 300, t => {
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
    7: (l) => tal.genM7Task(l), 8: (l) => tal.genM8Task(l),
    9: (l) => tal.genM9Task(l), 10: (l) => tal.genM10Task(l)
};
[1,2,3,4,5,6,7,8,9,10].forEach(mod => {
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

/* — M9: överslagsräkning — */
[0,1,2].forEach(lvl => forEachRun(tal.genM9Task, lvl, RUNS, t => {
    ok(t.est === t.rounded.reduce((s,x)=>s+x,0), 'Tal M9 nivå'+lvl+': est = summa av avrundade');
    ok(t.rounded.every((r,i) => r === Math.round(t.parts[i]/t.roundTo)*t.roundTo), 'Tal M9 nivå'+lvl+': korrekt avrundning');
    ok(t.distractors.length === 3, 'Tal M9 nivå'+lvl+': 3 distraktorer');
    ok(distinct([t.correct, ...t.distractors]), 'Tal M9 nivå'+lvl+': distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Tal M9 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Tal M9 nivå'+lvl+': positiva heltal');
}));

/* — M10: romerska siffror — */
eq(tal.toRoman(4),  'IV',   'toRoman 4');
eq(tal.toRoman(9),  'IX',   'toRoman 9');
eq(tal.toRoman(14), 'XIV',  'toRoman 14');
eq(tal.toRoman(40), 'XL',   'toRoman 40');
eq(tal.toRoman(49), 'XLIX', 'toRoman 49');
eq(tal.toRoman(90), 'XC',   'toRoman 90');
eq(tal.toRoman(100),'C',    'toRoman 100');
[0,1,2].forEach(lvl => forEachRun(tal.genM10Task, lvl, RUNS, t => {
    ok(t.roman === tal.toRoman(t.n), 'Tal M10 nivå'+lvl+': roman = toRoman(n)');
    ok(t.correct === t.n, 'Tal M10 nivå'+lvl+': facit = n');
    ok(t.distractors.length === 3, 'Tal M10 nivå'+lvl+': 3 distraktorer');
    ok(distinct([t.correct, ...t.distractors]), 'Tal M10 nivå'+lvl+': distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Tal M10 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Tal M10 nivå'+lvl+': positiva heltal');
}));

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

/* — Modul 2: säga klockan (timeToSv + sayDistractors + genSayTask + nivåer) — */
eq(klock.timeToSv(3, 0),  'Klockan är tre',       'timeToSv 3:00');
eq(klock.timeToSv(5, 30), 'Halv sex',             'timeToSv 5:30');
eq(klock.timeToSv(3, 15), 'Kvart över tre',       'timeToSv 3:15');
eq(klock.timeToSv(3, 45), 'Kvart i fyra',         'timeToSv 3:45');
eq(klock.timeToSv(3, 25), 'Fem i halv fyra',      'timeToSv 3:25');
eq(klock.timeToSv(3, 35), 'Fem över halv fyra',   'timeToSv 3:35');
eq(klock.timeToSv(3, 5),  'Fem över tre',         'timeToSv 3:05');
eq(klock.timeToSv(3, 10), 'Tio över tre',         'timeToSv 3:10');
eq(klock.timeToSv(3, 20), 'Tjugo över tre',       'timeToSv 3:20');
eq(klock.timeToSv(3, 40), 'Tjugo i fyra',         'timeToSv 3:40');
eq(klock.timeToSv(3, 50), 'Tio i fyra',           'timeToSv 3:50');
eq(klock.timeToSv(3, 55), 'Fem i fyra',           'timeToSv 3:55');
eq(klock.timeToSv(12, 30), 'Halv ett',            'timeToSv 12:30 (wrap 12→1)');
eq(klock.timeToSv(12, 0),  'Klockan är tolv',     'timeToSv 12:00');

for (let h = 1; h <= 12; h++) {
    for (let m = 0; m < 60; m += 5) {
        const phrase = klock.timeToSv(h, m);
        ok(typeof phrase === 'string' && phrase.length > 0, 'klock timeToSv '+h+':'+m+': icke-tom fras');

        const dist = klock.sayDistractors(h, m);
        ok(dist.length === 3, 'klock sayDistractors '+h+':'+m+': exakt 3 distraktorer');
        ok(distinct([phrase, ...dist]), 'klock sayDistractors '+h+':'+m+': 4 distinkta alternativ');
        ok(!dist.includes(phrase), 'klock sayDistractors '+h+':'+m+': facit ej bland distraktorerna');
        ok(dist.every(d => typeof d === 'string' && d.length > 0), 'klock sayDistractors '+h+':'+m+': distraktorer ifyllda');
    }
}

eq(klock.SAY_LEVELS.length, 3, 'klock SAY_LEVELS: 3 nivåer');
[0, 1, 2].forEach(lvl => forEachRun(klock.genSayTask, lvl, RUNS, t => {
    ok(t.h >= 1 && t.h <= 12 && Number.isInteger(t.h), 'klock genSayTask nivå'+lvl+': h inom 1–12');
    ok(klock.SAY_LEVELS[lvl].minutes.includes(t.m), 'klock genSayTask nivå'+lvl+': m tillåten för nivån');
    ok(t.correct === klock.timeToSv(t.h, t.m), 'klock genSayTask nivå'+lvl+': correct = timeToSv(h,m)');
    ok(t.distractors.length === 3, 'klock genSayTask nivå'+lvl+': exakt 3 distraktorer');
    ok(distinct([t.correct, ...t.distractors]), 'klock genSayTask nivå'+lvl+': 4 distinkta alternativ');
}));

for (let h = 1; h <= 12; h++) {
    for (let m = 0; m < 60; m += 5) {
        const s = klock.sayWorkedSteps(h, m);
        ok(s.length === 3, 'klock sayWorkedSteps '+h+':'+m+': exakt 3 steg');
        ok(s.every(x => typeof x === 'string' && x.length > 0), 'klock sayWorkedSteps '+h+':'+m+': alla steg ifyllda');
        ok(s[2].includes(klock.timeToSv(h, m)), 'klock sayWorkedSteps '+h+':'+m+': sista steget bär frasen');
    }
}

{
    const q = klock.sayWhyQuestion();
    ok(typeof q.prompt === 'string' && q.prompt.length > 0, 'klock sayWHY: prompt ifylld');
    ok(typeof q.correct === 'string' && q.correct.length > 0, 'klock sayWHY: korrekt rad ifylld');
    ok(q.distractors.length === 2, 'klock sayWHY: exakt 2 distraktorer');
    ok(distinct([q.correct, ...q.distractors]), 'klock sayWHY: 3 distinkta alternativ');
    ok(!q.distractors.includes(q.correct), 'klock sayWHY: facit ej bland distraktorer');
    ok(q.distractors.every(d => typeof d === 'string' && d.length > 0), 'klock sayWHY: distraktorer ifyllda');
}

/* ═══════════ skala ═══════════ */
const ska = require('../logic/skala.js');

/* — classify: exakta gränser — */
eq(ska.classify(4, 8), 'Förstoring',   'classify 4→8');
eq(ska.classify(8, 4), 'Förminskning', 'classify 8→4');
eq(ska.classify(5, 5), 'Lika stor',    'classify 5→5');

/* — M1: förstoring/förminskning (känna igen) — */
[0,1,2].forEach(lvl => forEachRun(ska.genM1Task, lvl, RUNS, t => {
    ok(t.choices.length === 3, 'Skala M1 nivå'+lvl+': 3 alternativ');
    ok(distinct(t.choices), 'Skala M1 nivå'+lvl+': distinkta alternativ');
    ok(t.choices.includes(t.correct), 'Skala M1 nivå'+lvl+': facit finns bland alternativen');
    if (t.mode === 'pic') {
        ok(t.orig > 0 && t.ny > 0, 'Skala M1 nivå'+lvl+': positiva rutor');
        ok(ska.classify(t.orig, t.ny) === t.correct, 'Skala M1 nivå'+lvl+': facit = jämförelse rutor');
    } else {
        ok(t.a > 0 && t.b > 0, 'Skala M1 nivå'+lvl+': positiva skaltal');
        ok(ska.classify(t.a, t.b) === t.correct, 'Skala M1 nivå'+lvl+': facit = jämförelse a:b');
        if (lvl >= 1) ok(t.a === 1 || t.b === 1, 'Skala M1 nivå'+lvl+': ena talet är 1');
    }
}));
/* alla tre kategorier ska vara nåbara på varje nivå */
[0,1,2].forEach(lvl => {
    const seen = new Set();
    for (let i = 0; i < 2000; i++) seen.add(ska.genM1Task(lvl).correct);
    ska.CHOICES_M1.forEach(c => ok(seen.has(c), 'Skala M1 nivå'+lvl+': "'+c+'" är nåbar'));
});

/* — M2: skalfaktor på en längd (× / ÷) — */
[0,1,2].forEach(lvl => forEachRun(ska.genM2Task, lvl, RUNS, t => {
    const exp = t.type === 'forstoring' ? t.n * t.orig : t.orig / t.n;
    ok(t.correct === exp, 'Skala M2 nivå'+lvl+': facit = '+(t.type)+' ('+t.orig+', n='+t.n+')');
    ok(Number.isInteger(t.correct) && t.correct > 0, 'Skala M2 nivå'+lvl+': heltal > 0');
    if (t.type === 'forminskning') ok(t.orig % t.n === 0, 'Skala M2 nivå'+lvl+': original delbart med n');
    if (lvl === 0) ok(t.type === 'forstoring', 'Skala M2 nivå0: bara förstoring');
    if (lvl === 1) ok(t.type === 'forminskning', 'Skala M2 nivå1: bara förminskning');
    ok(t.distractors.length === 3, 'Skala M2 nivå'+lvl+': 3 distraktorer');
    ok(distinct([t.correct, ...t.distractors]), 'Skala M2 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Skala M2 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Skala M2 nivå'+lvl+': positiva heltal');
}));

/* — M3: karta, verklig längd (k × M) — */
[0,1,2].forEach(lvl => forEachRun(ska.genM3Task, lvl, RUNS, t => {
    ok(t.correct === t.k * t.M, 'Skala M3 nivå'+lvl+': facit = k × M');
    ok(Number.isInteger(t.correct) && t.correct > 0, 'Skala M3 nivå'+lvl+': heltal > 0');
    ok(t.distractors.length === 3, 'Skala M3 nivå'+lvl+': 3 distraktorer');
    ok(distinct([t.correct, ...t.distractors]), 'Skala M3 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Skala M3 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Skala M3 nivå'+lvl+': positiva heltal');
}));

/* — Mönster v2, lager 11a + 11c: workedSteps + whyQuestion (M1–M3) — */
{
    const SKA_GEN = { 1: ska.genM1Task, 2: ska.genM2Task, 3: ska.genM3Task };
    [1,2,3].forEach(mod => [0,1,2].forEach(lvl => forEachRun(SKA_GEN[mod], lvl, 300, t => {
        const steps = ska.workedSteps(mod, t);
        ok(steps.length === 3, 'Skala WE mod'+mod+' nivå'+lvl+': exakt 3 steg');
        ok(steps.every(s => typeof s === 'string' && s.length > 0), 'Skala WE mod'+mod+' nivå'+lvl+': alla steg ifyllda');
        if (mod === 1) ok(steps[2].includes(t.correct.toLowerCase()), 'Skala WE mod1: sista steget bär kategori');
        if (mod === 1) ok(!steps[2].includes('en lika stor'), 'Skala WE mod1: korrekt svenska vid "Lika stor" (inte "en lika stor")');
        else           ok(steps[2].includes(String(t.correct)),       'Skala WE mod'+mod+': sista steget bär facit');

        const q = ska.whyQuestion(mod);
        ok(typeof q.prompt === 'string' && q.prompt.length > 0, 'Skala WHY mod'+mod+': prompt ifylld');
        ok(typeof q.correct === 'string' && q.correct.length > 0, 'Skala WHY mod'+mod+': korrekt rad ifylld');
        ok(q.distractors.length === 2, 'Skala WHY mod'+mod+': exakt 2 distraktorer');
        ok(distinct([q.correct, ...q.distractors]), 'Skala WHY mod'+mod+': 3 distinkta alternativ');
        ok(!q.distractors.includes(q.correct), 'Skala WHY mod'+mod+': facit ej bland distraktorer');
    })));
}

/* ═══════════ proportionalitet ═══════════ */
const pro = require('../logic/proportionalitet.js');

/* — M1: lika mycket per styck (total = n × each) — */
[0,1,2].forEach(lvl => forEachRun(pro.genM1Task, lvl, RUNS, t => {
    ok(t.correct === t.n * t.each, 'Prop M1 nivå'+lvl+': facit = n × each');
    ok(Number.isInteger(t.correct) && t.correct > 0, 'Prop M1 nivå'+lvl+': heltal > 0');
    ok(t.n > 0 && t.each > 0, 'Prop M1 nivå'+lvl+': positiva tal');
    ok(t.distractors.length === 3, 'Prop M1 nivå'+lvl+': 3 distraktorer');
    ok(distinct([t.correct, ...t.distractors]), 'Prop M1 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Prop M1 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Prop M1 nivå'+lvl+': positiva heltal');
}));

/* — M2: enhetspris (each = total ÷ n, alltid helt) — */
[0,1,2].forEach(lvl => forEachRun(pro.genM2Task, lvl, RUNS, t => {
    ok(t.total === t.n * t.correct, 'Prop M2 nivå'+lvl+': total = n × facit');
    ok(t.total % t.n === 0, 'Prop M2 nivå'+lvl+': total delbart med n');
    ok(Number.isInteger(t.correct) && t.correct > 0, 'Prop M2 nivå'+lvl+': heltal > 0');
    ok(t.distractors.length === 3, 'Prop M2 nivå'+lvl+': 3 distraktorer');
    ok(distinct([t.correct, ...t.distractors]), 'Prop M2 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Prop M2 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Prop M2 nivå'+lvl+': positiva heltal');
}));

/* — M3: samma förhållande (b = a×k, facit = c×k, c ≠ a) — */
[0,1,2].forEach(lvl => forEachRun(pro.genM3Task, lvl, RUNS, t => {
    ok(t.b === t.a * t.k, 'Prop M3 nivå'+lvl+': b = a × k');
    ok(t.correct === t.c * t.k, 'Prop M3 nivå'+lvl+': facit = c × k');
    ok(t.c !== t.a, 'Prop M3 nivå'+lvl+': c skild från a');
    ok(Number.isInteger(t.correct) && t.correct > 0, 'Prop M3 nivå'+lvl+': heltal > 0');
    ok(t.distractors.length === 3, 'Prop M3 nivå'+lvl+': 3 distraktorer');
    ok(distinct([t.correct, ...t.distractors]), 'Prop M3 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Prop M3 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Prop M3 nivå'+lvl+': positiva heltal');
}));

/* — M4: läs av proportionell graf (facit = a × k) — */
[0,1,2].forEach(lvl => forEachRun(pro.genM4Task, lvl, RUNS, t => {
    ok(t.correct === t.a * t.k, 'Prop M4 nivå'+lvl+': facit = a × k');
    ok(Number.isInteger(t.correct) && t.correct > 0, 'Prop M4 nivå'+lvl+': heltal > 0');
    ok(t.a > 0 && t.k > 0, 'Prop M4 nivå'+lvl+': positiva tal');
    ok(t.distractors.length === 3, 'Prop M4 nivå'+lvl+': 3 distraktorer');
    ok(distinct([t.correct, ...t.distractors]), 'Prop M4 nivå'+lvl+': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), 'Prop M4 nivå'+lvl+': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), 'Prop M4 nivå'+lvl+': positiva heltal');
}));

/* — Mönster v2, lager 11a + 11c: workedSteps + whyQuestion (M1–M4) — */
{
    const PRO_GEN = { 1: pro.genM1Task, 2: pro.genM2Task, 3: pro.genM3Task, 4: pro.genM4Task };
    [1,2,3,4].forEach(mod => [0,1,2].forEach(lvl => forEachRun(PRO_GEN[mod], lvl, 300, t => {
        const steps = pro.workedSteps(mod, t);
        ok(steps.length === 3, 'Prop WE mod'+mod+' nivå'+lvl+': exakt 3 steg');
        ok(steps.every(s => typeof s === 'string' && s.length > 0), 'Prop WE mod'+mod+' nivå'+lvl+': alla steg ifyllda');
        ok(steps[2].includes(String(t.correct)), 'Prop WE mod'+mod+': sista steget bär facit');

        const q = pro.whyQuestion(mod);
        ok(typeof q.prompt === 'string' && q.prompt.length > 0, 'Prop WHY mod'+mod+': prompt ifylld');
        ok(typeof q.correct === 'string' && q.correct.length > 0, 'Prop WHY mod'+mod+': korrekt rad ifylld');
        ok(q.distractors.length === 2, 'Prop WHY mod'+mod+': exakt 2 distraktorer');
        ok(distinct([q.correct, ...q.distractors]), 'Prop WHY mod'+mod+': 3 distinkta alternativ');
        ok(!q.distractors.includes(q.correct), 'Prop WHY mod'+mod+': facit ej bland distraktorer');
    })));
}

/* ═══════════ problemlösning ═══════════ */
const pl = require('../logic/problemlosning.js');

/* Gemensam distraktor-kontroll för ett uppgiftsobjekt. */
function plDistr(t, tag) {
    ok(Number.isInteger(t.correct) && t.correct > 0, tag + ': facit heltal > 0');
    ok(t.distractors.length === 3, tag + ': 3 distraktorer');
    ok(distinct([t.correct, ...t.distractors]), tag + ': 4 distinkta alternativ');
    ok(!t.distractors.includes(t.correct), tag + ': facit ej bland distraktorer');
    ok(t.distractors.every(v => v > 0 && Number.isInteger(v)), tag + ': positiva heltal');
    ok(typeof t.story === 'string' && t.story.length > 0, tag + ': story ifylld');
}

/* — Ett-stegs (nivå 0): exakta facit-formler per räknesätt — */
forEachRun(pl.addTask, 0, RUNS, t => { ok(t.correct === t.a + t.b, 'PL add: facit = a + b'); plDistr(t, 'PL add'); });
forEachRun(pl.subTask, 0, RUNS, t => {
    ok(t.correct === t.a - t.b, 'PL sub: facit = a − b');
    ok(t.a > t.b, 'PL sub: a > b (positivt svar)');
    plDistr(t, 'PL sub');
});
forEachRun(pl.mulTask, 0, RUNS, t => { ok(t.correct === t.g * t.e, 'PL mul: facit = g × e'); plDistr(t, 'PL mul'); });
forEachRun(pl.divTask, 0, RUNS, t => {
    ok(t.correct === t.q, 'PL div: facit = q');
    ok(t.t === t.g * t.q, 'PL div: total = g × q (delbar)');
    ok(t.t % t.g === 0, 'PL div: total delbart med g');
    plDistr(t, 'PL div');
});

/* — Två-stegs (nivå 1): × följt av − eller + — */
forEachRun(pl.mulSubTask, 1, RUNS, t => {
    ok(t.p === t.g * t.e, 'PL mul_sub: p = g × e');
    ok(t.correct === t.p - t.r, 'PL mul_sub: facit = p − r');
    ok(t.p > t.r, 'PL mul_sub: p > r (positivt svar)');
    plDistr(t, 'PL mul_sub');
});
forEachRun(pl.mulAddTask, 1, RUNS, t => {
    ok(t.p === t.g * t.e, 'PL mul_add: p = g × e');
    ok(t.correct === t.p + t.r, 'PL mul_add: facit = p + r');
    plDistr(t, 'PL mul_add');
});

/* — Flerstegs + överflödig info (nivå 2) — */
forEachRun(pl.herringTask, 2, RUNS, t => {
    ok(t.p === t.g * t.e, 'PL herring: p = g × e');
    ok(t.correct === t.s + t.p, 'PL herring: facit = s + p (h ingår inte)');
    ok(t.item !== t.other, 'PL herring: överflödigt föremål är en annan kategori');
    plDistr(t, 'PL herring');
});

/* — genM1Task: rätt räknesätt per nivå + alla räknesätt nåbara — */
{
    const ops0 = new Set(), ops1 = new Set();
    for (let i = 0; i < 4000; i++) {
        const t0 = pl.genM1Task(0), t1 = pl.genM1Task(1), t2 = pl.genM1Task(2);
        ops0.add(t0.op); ops1.add(t1.op);
        ok(['add', 'sub', 'mul', 'div'].includes(t0.op), 'PL genM1 nivå0: ett-stegs räknesätt');
        ok(['mul_sub', 'mul_add'].includes(t1.op), 'PL genM1 nivå1: två-stegs räknesätt');
        ok(t2.op === 'herring', 'PL genM1 nivå2: överflödig info');
    }
    ok(['add', 'sub', 'mul', 'div'].every(o => ops0.has(o)), 'PL nivå0: alla fyra räknesätt nåbara');
    ok(['mul_sub', 'mul_add'].every(o => ops1.has(o)), 'PL nivå1: båda tvåstegstyperna nåbara');
}

/* — Mönster v2, lager 11a + 11c: workedSteps + whyQuestion — */
[0, 1, 2].forEach(lvl => forEachRun(pl.genM1Task, lvl, 400, t => {
    const steps = pl.workedSteps(1, t);
    ok(steps.length === 3, 'PL WE nivå' + lvl + ': exakt 3 steg');
    ok(steps.every(s => typeof s === 'string' && s.length > 0), 'PL WE nivå' + lvl + ': alla steg ifyllda');
    ok(steps[2].includes(String(t.correct)), 'PL WE nivå' + lvl + ': sista steget bär facit');
}));
{
    const q = pl.whyQuestion(1);
    ok(typeof q.prompt === 'string' && q.prompt.length > 0, 'PL WHY: prompt ifylld');
    ok(typeof q.correct === 'string' && q.correct.length > 0, 'PL WHY: korrekt rad ifylld');
    ok(q.distractors.length === 2, 'PL WHY: exakt 2 distraktorer');
    ok(distinct([q.correct, ...q.distractors]), 'PL WHY: 3 distinkta alternativ');
    ok(!q.distractors.includes(q.correct), 'PL WHY: facit ej bland distraktorer');
}

/* ═══════════ blandat (interleaving, Fas 6 steg 18) ═══════════
   Slumpar uppgifter tvärs BEFINTLIGA moduler. logic/blandat.js är
   beroendefritt (tar emot källmodulernas exports injicerade), så testfilen
   skickar in dem via require() precis som webbläsaren gör via fetch+eval. */
const blandat = require('../logic/blandat.js');
const engine = blandat.createEngine({ tal, dec, stat, alg, prop: pro, pl });

eq(blandat.sv(1234), '1 234', 'sv: tusental');
eq(blandat.sv(12), '12', 'sv: under tusen oförändrat');
eq(blandat.sv(-500), '-500', 'sv: negativt tal');
eq(blandat.sv(123456), '123 456', 'sv: hundratusental');

ok(engine.FAMILY_KEYS.length === 19, 'Blandat: 19 uppgiftsfamiljer registrerade (fick ' + engine.FAMILY_KEYS.length + ')');

/* Exakt antal svarsalternativ per familj (verifierat mot källmodulernas egna,
   redan testade distraktor-garantier ovan i denna fil). */
const EXPECTED_CHOICES = {
    'tal-pos': () => 4, 'tal-foljd': () => 3, 'tal-jamfor': () => 2,
    'tal-lasa': () => 4, 'tal-avrunda': () => 4,
    'tal-negativa': lvl => (lvl === 2 ? 3 : 2),
    'tal-overslag': () => 4, 'tal-romerska': () => 4,
    'dec-beskrivning': () => 4, 'dec-jamfor': () => 2, 'dec-add-sub': () => 4, 'dec-enhet': () => 4,
    'prop-per-styck': () => 4, 'prop-enhetspris': () => 4, 'prop-forhallande': () => 4,
    'alg-berakna': () => 4,
    'stat-medel': () => 4, 'stat-median': () => 4,
    'pl-los': () => 4
};

engine.FAMILY_KEYS.forEach(key => {
    [0, 1, 2].forEach(lvl => {
        for (let r = 0; r < 400; r++) {
            const task = engine.genTaskFor(key, lvl);
            const tag = 'Blandat ' + key + ' nivå' + lvl;

            ok(typeof task.question === 'string' && task.question.length > 0, tag + ': fråga ifylld');
            ok(typeof task.hint === 'string' && task.hint.length > 0, tag + ': hint ifylld');
            ok(task.sourceLabel.length > 0, tag + ': källetikett ifylld');

            const expectedN = EXPECTED_CHOICES[key](lvl);
            ok(task.choices.length === expectedN, tag + ': ' + expectedN + ' alternativ (fick ' + task.choices.length + ')');
            ok(task.labels.length === task.choices.length, tag + ': lika många etiketter som alternativ');
            ok(task.choices.includes(task.correct), tag + ': facit finns bland alternativen');
            ok(distinct(task.choices), tag + ': alternativen är distinkta');
            ok(distinct(task.labels), tag + ': etiketterna är distinkta');

            /* Mönster v2-passthrough: workedSteps + whyQuestion via källmodulens egna funktioner */
            const steps = engine.workedSteps(task);
            ok(steps.length === 3, tag + ': workedSteps ger exakt 3 steg');
            ok(steps.every(s => typeof s === 'string' && s.length > 0), tag + ': alla steg ifyllda');

            const why = engine.whyQuestion(task);
            ok(typeof why.prompt === 'string' && why.prompt.length > 0, tag + ': why-prompt ifylld');
            ok(why.distractors.length === 2, tag + ': why 2 distraktorer');
            ok(distinct([why.correct, ...why.distractors]), tag + ': why 3 distinkta alternativ');
            ok(!why.distractors.includes(why.correct), tag + ': why-facit ej bland why-distraktorer');
        }
    });
});

/* — genTask (slumpad familj): grundläggande sundhetskoll + alla familjer nåbara — */
{
    const seenKeys = new Set();
    for (let i = 0; i < 2000; i++) {
        const task = engine.genTask(i % 3);
        seenKeys.add(task.key);
        ok(engine.FAMILY_KEYS.includes(task.key), 'Blandat genTask: giltig familjenyckel');
        ok(task.choices.includes(task.correct), 'Blandat genTask: facit bland alternativen');
        ok(distinct(task.choices), 'Blandat genTask: distinkta alternativ');
    }
    ok(engine.FAMILY_KEYS.every(k => seenKeys.has(k)), 'Blandat genTask: alla 19 familjer nåbara (fick ' + seenKeys.size + '/19)');
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
