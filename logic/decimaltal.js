/* ═══════════════════════════════════════════════
   logic/decimaltal.js – ren logik för decimaltal.html (M1–M5)
   Inga DOM-anrop här. Nivå skickas in som parameter (level: 0,1,2).
   Ritning (SVG) och händelsehantering ligger kvar i decimaltal.html.
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

    /* ════════ Modul 1 – Vad är ett decimaltal? ════════ */

    const WHOLE_WORDS = [
        'noll', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio',
        'tio', 'elva', 'tolv', 'tretton', 'fjorton', 'femton', 'sexton', 'sjutton', 'arton', 'nitton'
    ];
    const DEC_ONES = ['', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio'];

    function decWord(d, unit) {
        if (d === 1) return 'en ' + unit;
        return DEC_ONES[d] + ' ' + unit + 'ar';
    }

    function makeDesc(whole, d1, d2) {
        let decPart;
        if (d2 === undefined) {
            decPart = decWord(d1, 'tiondel');
        } else if (d1 === 0) {
            decPart = decWord(d2, 'hundradel');
        } else {
            decPart = decWord(d1, 'tiondel') + ' och ' + decWord(d2, 'hundradel');
        }
        return whole === 0 ? decPart : WHOLE_WORDS[whole] + ' och ' + decPart;
    }

    function genM1Task(level) {
        let whole, d1, d2, display;

        if (level === 0) {
            whole   = rnd(0, 9);
            d1      = rnd(1, 9);
            d2      = undefined;
            display = whole + ',' + d1;
        } else if (level === 1) {
            whole   = rnd(0, 9);
            d1      = rnd(0, 9);
            d2      = rnd(1, 9);
            display = whole + ',' + d1 + d2;
        } else {
            whole   = rnd(0, 19);
            d1      = rnd(1, 9);
            d2      = rnd(1, 9);
            display = whole + ',' + d1 + d2;
        }

        const correct = makeDesc(whole, d1, d2);

        const seen = new Set([correct]);
        const pool = [];

        if (level === 0) {
            pool.push(makeDesc(whole, 0, d1));
            if (d1 > 1) pool.push(makeDesc(whole, d1 - 1, undefined));
            if (d1 < 9) pool.push(makeDesc(whole, d1 + 1, undefined));
            if (whole === 0) {
                pool.push(makeDesc(1, d1, undefined));
                pool.push(makeDesc(2, d1, undefined));
            } else {
                pool.push(makeDesc(0, d1, undefined));
                if (whole > 1) pool.push(makeDesc(whole - 1, d1, undefined));
                if (whole < 9) pool.push(makeDesc(whole + 1, d1, undefined));
            }
        } else if (level === 1) {
            if (d1 === 0) {
                pool.push(makeDesc(whole, d2, undefined));
                if (d2 > 1) pool.push(makeDesc(whole, 0, d2 - 1));
                if (d2 < 9) pool.push(makeDesc(whole, 0, d2 + 1));
                if (whole === 0) { pool.push(makeDesc(1, 0, d2)); pool.push(makeDesc(2, 0, d2)); }
                else             { pool.push(makeDesc(0, 0, d2)); pool.push(makeDesc(whole + 1, 0, d2)); }
            } else {
                pool.push(makeDesc(whole, d1, undefined));
                pool.push(makeDesc(whole, 0, d2));
                if (d1 > 1) pool.push(makeDesc(whole, d1 - 1, d2));
                if (d1 < 9) pool.push(makeDesc(whole, d1 + 1, d2));
                if (d2 > 1) pool.push(makeDesc(whole, d1, d2 - 1));
                if (d2 < 9) pool.push(makeDesc(whole, d1, d2 + 1));
            }
        } else {
            pool.push(makeDesc(whole, d1, undefined));
            pool.push(makeDesc(whole, 0, d2));
            if (d1 > 1) pool.push(makeDesc(whole, d1 - 1, d2));
            if (d1 < 9) pool.push(makeDesc(whole, d1 + 1, d2));
            if (d2 > 1) pool.push(makeDesc(whole, d1, d2 - 1));
            if (d2 < 9) pool.push(makeDesc(whole, d1, d2 + 1));
            if (whole > 0)  pool.push(makeDesc(whole - 1, d1, d2));
            if (whole < 19) pool.push(makeDesc(whole + 1, d1, d2));
        }

        const distractors = [];
        for (const c of pool) {
            if (!seen.has(c)) { seen.add(c); distractors.push(c); }
            if (distractors.length >= 3) break;
        }

        return { display, correct, distractors };
    }

    /* ════════ Modul 2 – Jämföra decimaltal ════════ */

    function genM2Task(level) {
        let optA, optB, correctDisp, feedback;

        if (level === 0) {
            const d1 = rnd(1, 9);
            let d2;
            do { d2 = rnd(1, 9); } while (d2 === d1);
            const dispD1 = '0,' + d1, dispD2 = '0,' + d2;
            correctDisp = d1 > d2 ? dispD1 : dispD2;
            feedback = 'Nästan – ' + correctDisp + ' är störst.';
            if (Math.random() < 0.5) { optA = dispD1; optB = dispD2; }
            else                     { optA = dispD2; optB = dispD1; }

        } else if (level === 1) {
            const X = rnd(1, 7);
            const Y = rnd(X + 1, 9);
            const tenth = '0,' + X;
            const hund  = '0,0' + Y;
            correctDisp = tenth;
            feedback = 'Nästan – ' + tenth + ' är större än ' + hund +
                       ' även om ' + Y + ' > ' + X + '. Titta på tiondelarna först!';
            if (Math.random() < 0.5) { optA = tenth; optB = hund; }
            else                     { optA = hund;  optB = tenth; }

        } else {
            const whole = rnd(1, 5);
            const d1    = rnd(1, 9);
            const d2    = rnd(1, 9);
            const d3    = rnd(1, 9);
            const dispA0 = whole + ',' + d1;
            const dispB0 = whole + ',' + d2 + '' + d3;
            const valA   = d1 * 10;
            const valB   = d2 * 10 + d3;
            correctDisp  = valA > valB ? dispA0 : dispB0;
            feedback = 'Nästan – ' + correctDisp + ' är störst. Jämför tiondel för tiondel!';
            if (Math.random() < 0.5) { optA = dispA0; optB = dispB0; }
            else                     { optA = dispB0; optB = dispA0; }
        }

        return { optA, optB, correctDisp, feedback };
    }

    /* ════════ Modul 3 – Decimaltal på tallinjen ════════ */

    function genM3Task(level) {
        const pos = rnd(1, 9);
        let leftLabel, rightLabel, correct, pool = [];

        if (level === 0) {
            leftLabel  = '0';
            rightLabel = '1';
            correct    = '0,' + pos;
            for (const d of [pos-1, pos+1, pos-2, pos+2, pos-3, pos+3]) {
                if (d >= 1 && d <= 9) pool.push('0,' + d);
            }
        } else if (level === 1) {
            const tenth = rnd(1, 8);
            leftLabel   = '0,' + tenth + '0';
            rightLabel  = '0,' + (tenth + 1) + '0';
            correct     = '0,' + tenth + pos;
            pool.push('0,' + pos);
            for (const d of [pos-1, pos+1, pos-2, pos+2, pos-3, pos+3]) {
                if (d >= 1 && d <= 9) pool.push('0,' + tenth + d);
            }
        } else {
            const N    = rnd(1, 9);
            leftLabel  = '' + N;
            rightLabel = '' + (N + 1);
            correct    = N + ',' + pos;
            pool.push((N + 1) + ',' + pos);
            if (N > 1) pool.push((N - 1) + ',' + pos);
            for (const d of [pos-1, pos+1, pos-2, pos+2, pos-3, pos+3]) {
                if (d >= 1 && d <= 9) pool.push(N + ',' + d);
            }
        }

        const seen = new Set([correct]);
        const distractors = [];
        for (const c of pool) {
            if (!seen.has(c)) { seen.add(c); distractors.push(c); }
            if (distractors.length >= 3) break;
        }

        return { pos, leftLabel, rightLabel, correct, distractors };
    }

    /* ════════ Modul 4 – Addition och subtraktion ════════ */

    function fmtOp(v) {
        const whole      = Math.floor(v / 100);
        const frac       = v % 100;
        const tenths     = Math.floor(frac / 10);
        const hundredths = frac % 10;
        if (hundredths === 0) return whole + ',' + tenths;
        return whole + ',' + tenths + hundredths;
    }

    function genM4Task(level) {
        let a, b, op, result;

        if (level === 0) {
            op = Math.random() < 0.5 ? '+' : '-';
            if (op === '+') {
                a = rnd(1, 24) * 10;
                b = rnd(1, 24) * 10;
                result = a + b;
            } else {
                a = rnd(2, 39) * 10;
                b = rnd(1, Math.floor(a / 10) - 1) * 10;
                result = a - b;
            }

        } else if (level === 1) {
            do {
                a  = rnd(0, 2) * 100 + rnd(0, 9) * 10 + rnd(1, 9);
                b  = rnd(0, 1) * 100 + rnd(0, 9) * 10 + rnd(1, 9);
                op = Math.random() < 0.5 ? '+' : '-';
                if (op === '-' && a <= b) [a, b] = [b, a];
                result = op === '+' ? a + b : a - b;
            } while (result <= 0 || result > 999);

        } else {
            do {
                a  = rnd(1, 3) * 100 + rnd(1, 9) * 10 + rnd(1, 9);
                b  = Math.random() < 0.5
                    ? rnd(1, 29) * 10
                    : rnd(0, 1) * 100 + rnd(0, 9) * 10 + rnd(1, 9);
                op = Math.random() < 0.5 ? '+' : '-';
                if (op === '-' && a <= b) [a, b] = [b, a];
                result = op === '+' ? a + b : a - b;
            } while (result <= 0 || result > 999);
        }

        const seen   = new Set([result]);
        const deltas = level === 0 ? [10, -10, 20, -20, 30, -30] : [1, -1, 10, -10, 11, -11, 2, -2];
        const distractors = [];
        for (const d of deltas) {
            const v = result + d;
            if (v > 0 && !seen.has(v)) { seen.add(v); distractors.push(v); }
            if (distractors.length >= 3) break;
        }

        const opChar = op === '+' ? ' + ' : ' − ';
        const label  = fmtOp(a) + opChar + fmtOp(b) + ' = ?';

        return { result, distractors, label };
    }

    /* ════════ Modul 5 – Enhetsbyten ════════ */

    const M5_FACTOR = { cm: 100, g: 1000, ml: 1000 };
    const M5_BIG    = { cm: 'm', g: 'kg', ml: 'l' };
    const M5_UNITS  = ['cm', 'g', 'ml'];
    const M5_POOLS  = {
        cm: [25, 50, 75, 125, 150, 175, 225, 250, 275],
        g:  [250, 500, 750, 1250, 1500, 1750, 2000],
        ml: [250, 500, 750, 1250, 1500, 1750, 2000]
    };

    function m5FmtAny(smallInt, fac) {
        const whole  = Math.floor(smallInt / fac);
        const rem    = smallInt % fac;
        if (rem === 0) return '' + whole;
        const places = Math.round(Math.log10(fac));
        const digits = ('' + rem).padStart(places, '0').replace(/0+$/, '');
        return whole + ',' + digits;
    }

    function genM5Task(level) {
        let smallUnit;
        if (level === 0)      smallUnit = 'cm';
        else if (level === 1) smallUnit = Math.random() < 0.5 ? 'g' : 'ml';
        else                  smallUnit = M5_UNITS[rnd(0, 2)];

        const factor   = M5_FACTOR[smallUnit];
        const bigUnit  = M5_BIG[smallUnit];
        const pool     = M5_POOLS[smallUnit];
        const smallInt = pool[rnd(0, pool.length - 1)];
        const bigStr   = m5FmtAny(smallInt, factor);
        const toBig    = Math.random() < 0.5;

        const fromVal    = toBig ? '' + smallInt : bigStr;
        const fromUnit   = toBig ? smallUnit : bigUnit;
        const toUnit     = toBig ? bigUnit   : smallUnit;
        const correctStr = toBig ? bigStr    : '' + smallInt;

        const seen = new Set([correctStr]);
        const dCands = toBig
            ? [m5FmtAny(smallInt, factor / 10), m5FmtAny(smallInt, factor * 10), '' + smallInt]
            : ['' + (smallInt * 10), '' + Math.max(1, Math.floor(smallInt / 10)), bigStr];
        const distractors = dCands.filter(d => !seen.has(d) && seen.add(d));

        return { smallUnit, smallInt, fromVal, fromUnit, toUnit, correctStr, distractors };
    }

    return {
        decWord, makeDesc, genM1Task,
        genM2Task,
        genM3Task,
        fmtOp, genM4Task,
        m5FmtAny, genM5Task,
        M5_FACTOR, M5_BIG, M5_UNITS, M5_POOLS
    };
}));
