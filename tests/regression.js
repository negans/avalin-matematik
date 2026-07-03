/* ═══════════════════════════════════════════════
   tests/regression.js – Avalins Matematikverkstad
   Strukturell regressionskoll. Körs med:  node tests/regression.js
   Kompletterar tests/test.js (logiklagret) med den terminalbara halvan
   av det ockulära lagret: fångar strukturfel utan rendering.
   Den ANDRA halvan (skärmdumpssvep) kräver Fable + browserverktyg — se
   memory/vision_pass_fas8.md. Beroendefri, precis som test.js.

   Tre falsklarmsfria invarianter:
   1. Testtäckning: varje logic/*.js (utom shared) är require:ad i tests/test.js.
   2. Referensintegritet: varje lokal src/href/url() i *.html pekar på en fil som finns.
   3. Miso: varje modulsida innehåller miso-container (statisk ELLER JS-skapad).
═══════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
const fails = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; fails.push(msg); } }

function listFiles(dir, ext) {
    return fs.readdirSync(path.join(ROOT, dir))
        .filter(f => f.endsWith(ext))
        .sort();
}
function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

/* ═══ 1. Testtäckning — ingen logik utan test ═══ */
const testSrc = read('tests/test.js');
function requireRe(file) {
    const esc = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');   // escapa metatecken (t.ex. .js)
    return new RegExp("require\\(\\s*['\"]\\.\\./logic/" + esc + "['\"]\\s*\\)");  // tål båda fnutt-stilar + mellanslag
}
listFiles('logic', '.js')
    .filter(f => f !== 'shared.js')
    .forEach(f => {
        ok(requireRe(f).test(testSrc),
           'Täckning: logic/' + f + ' saknar require i tests/test.js (ny logik utan test?)');
    });

/* ═══ 2. Referensintegritet — inga trasiga lokala filreferenser ═══ */
const htmlFiles = listFiles('.', '.html');
const REF_RE = /(?:src|href)\s*=\s*["']([^"']+)["']/gi;
const URL_RE = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;

function isExternal(u) {
    return /^(https?:)?\/\//i.test(u) || u.startsWith('data:') ||
           u.startsWith('#') || u.startsWith('mailto:') || u.startsWith('tel:');
}
function localPart(u) { return u.split('#')[0].split('?')[0]; }

htmlFiles
    .filter(f => f !== 'template.html')   // skelett med avsiktliga platshållare (logic/MODUL.js)
    .forEach(html => {
    const src = read(html);
    const refs = new Set();
    let m;
    while ((m = REF_RE.exec(src)))  refs.add(m[1]);
    while ((m = URL_RE.exec(src)))  refs.add(m[1]);
    refs.forEach(u => {
        if (isExternal(u)) return;
        const rel = localPart(u).replace(/^\.?\//, '');
        if (!rel) return;
        ok(fs.existsSync(path.join(ROOT, rel)),
           'Referens: ' + html + ' pekar på "' + u + '" som inte finns');
    });
});

/* ═══ 3. Miso — varje modulsida har en Miso-container ═══ */
htmlFiles
    .filter(f => f !== 'index.html')   // startsidan är ingen modul
    .forEach(html => {
        ok(read(html).includes('miso-container'),
           'Miso: ' + html + ' saknar miso-container');
    });

/* ═══ Resultat ═══ */
console.log('');
console.log('  Strukturell regressionskoll');
console.log('  PASS: ' + pass);
console.log('  FAIL: ' + fail);
if (fail) {
    console.log('');
    fails.forEach(f => console.log('  ✗ ' + f));
    console.log('');
    process.exit(1);
}
console.log('');
console.log('  ✓ Struktur grön.');
