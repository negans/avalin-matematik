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
