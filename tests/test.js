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
