/* ═══════════════════════════════════════════════
   logic/blandat.js – ren logik för blandat.html
   Fas 6, steg 18: blandat repetitionsläge (interleaving).
   Slumpar uppgifter tvärs BEFINTLIGA moduler (taluppfattning, decimaltal,
   statistik, algebra, proportionalitet, problemlösning) — tränar att VÄLJA
   metod, inte bara utföra den. Rör inga befintliga filer.

   Arkitektur: varje källmoduls logic/*.js exporterar SAMMA globala namn
   (genM1Task, workedSteps, whyQuestion, ...) — de kan inte laddas som vanliga
   <script>-taggar på samma sida utan att skriva över varandra. Därför är denna
   fil helt BEROENDEFRI: den tar emot de andra modulernas exports som
   injicerade parametrar (createEngine(mods)) i stället för att require:a dem
   själv. I Node skickar testfilen in dem via require(); i webbläsaren laddar
   blandat.html varje källmodul isolerat (fetch + eval i en egen modul-scope,
   inte som global <script>) och skickar in resultatet.

   Inga DOM-anrop här. UMD: globala i webbläsaren, module.exports i Node.
═══════════════════════════════════════════════ */
(function (root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else Object.assign(root, api);
}(typeof window !== 'undefined' ? window : globalThis, function () {

    function rnd(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

    /* Svensk tusentalsavgränsare (mellanslag), t.ex. 12345 -> "12 345". Ren,
       ingen Intl-beroende, så samma resultat i Node-tester och webbläsare. */
    function sv(n) {
        const s = String(Math.trunc(n));
        const neg = s[0] === '-';
        const digits = neg ? s.slice(1) : s;
        const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return (neg ? '-' : '') + grouped;
    }

    /* Bygger listan av 19 uppgiftsfamiljer. `mods` = { tal, dec, stat, alg, prop, pl }
       (de redan require:ade/laddade exportobjekten från de sex källmodulerna). */
    function buildFamilies(mods) {
        const { tal, dec, stat, alg, prop, pl } = mods;

        return [
            /* ── Taluppfattning ── */
            {
                key: 'tal-pos', sourceLabel: 'Taluppfattning', wsModule: 'tal', wsMod: 1,
                gen: level => (level === 0 ? tal.genM1Task() : tal.genM2Task()),
                correctOf: t => t.correct,
                question: t => 'Vad är värdet av siffran ' + t.digitVal + ' i talet ' + t.numStr + '?',
                choices: t => [t.correct, ...t.distractors],
                label: v => sv(v),
                hint: t => 'Nästan – siffran ' + t.digitVal + ' på den platsen är värd ' + t.correct + '.'
            },
            {
                key: 'tal-foljd', sourceLabel: 'Taluppfattning', wsModule: 'tal', wsMod: 3,
                gen: level => tal.genM3Task(level),
                correctOf: t => t.correct,
                question: t => 'Vilket tal saknas i talföljden: ' +
                    t.series.map((v, i) => i === t.missingIdx ? '?' : sv(v)).join(', ') + '?',
                choices: t => [t.correct, ...t.distractors],
                label: v => sv(v),
                hint: t => 'Nästan – talen ändras med ' + t.step + ' varje steg, så talet är ' + t.correct + '.'
            },
            {
                key: 'tal-jamfor', sourceLabel: 'Taluppfattning', wsModule: 'tal', wsMod: 4,
                gen: level => tal.genM4Task(level),
                correctOf: t => t.correct,
                question: () => 'Vilket tal är störst?',
                choices: t => [t.A, t.B],
                label: v => sv(v),
                hint: t => 'Nästan – ' + sv(t.correct) + ' är störst.'
            },
            {
                key: 'tal-lasa', sourceLabel: 'Taluppfattning', wsModule: 'tal', wsMod: 5,
                gen: level => tal.genM5Task(level),
                correctOf: t => t.word,
                question: t => 'Hur läser man talet ' + sv(t.n) + '?',
                choices: t => [t.word, ...t.distractors.map(tal.numToSv)],
                label: v => v,
                hint: t => 'Nästan – det var "' + t.word + '".'
            },
            {
                key: 'tal-avrunda', sourceLabel: 'Taluppfattning', wsModule: 'tal', wsMod: 6,
                gen: level => tal.genM6Task(level),
                correctOf: t => t.correct,
                question: t => 'Avrunda ' + sv(t.n) + ' till ' + t.cfg.label + '.',
                choices: t => [t.correct, ...t.distractors],
                label: v => sv(v),
                hint: t => 'Nästan – ' + sv(t.n) + ' avrundas till ' + sv(t.correct) + '.'
            },
            {
                key: 'tal-negativa', sourceLabel: 'Taluppfattning', wsModule: 'tal', wsMod: 8,
                gen: level => tal.genM8Task(level),
                correctOf: t => t.correct,
                question: () => 'Vilket tal är störst?',
                choices: t => t.numbers.slice(),
                label: v => String(v),
                hint: t => 'Nästan – ' + t.correct + ' är störst.'
            },
            {
                key: 'tal-overslag', sourceLabel: 'Taluppfattning', wsModule: 'tal', wsMod: 9,
                gen: level => tal.genM9Task(level),
                correctOf: t => t.correct,
                question: t => 'Ungefär hur mycket är ' + t.parts.join(' + ') + '?',
                choices: t => [t.correct, ...t.distractors],
                label: v => sv(v),
                hint: t => 'Nästan – avrundat blir det ungefär ' + sv(t.est) + '.'
            },
            {
                key: 'tal-romerska', sourceLabel: 'Taluppfattning', wsModule: 'tal', wsMod: 10,
                gen: level => tal.genM10Task(level),
                correctOf: t => t.correct,
                question: t => 'Vilket tal är ' + t.roman + '?',
                choices: t => [t.correct, ...t.distractors],
                label: v => String(v),
                hint: t => 'Nästan – ' + t.roman + ' är ' + t.n + '.'
            },

            /* ── Decimaltal ── */
            {
                key: 'dec-beskrivning', sourceLabel: 'Decimaltal', wsModule: 'dec', wsMod: 1,
                gen: level => dec.genM1Task(level),
                correctOf: t => t.correct,
                question: t => 'Välj rätt beskrivning av talet ' + t.display + '.',
                choices: t => [t.correct, ...t.distractors],
                label: v => v,
                hint: t => 'Nästan – talet betyder "' + t.correct + '".'
            },
            {
                key: 'dec-jamfor', sourceLabel: 'Decimaltal', wsModule: 'dec', wsMod: 2,
                gen: level => dec.genM2Task(level),
                correctOf: t => t.correctDisp,
                question: () => 'Vilket tal är störst?',
                choices: t => [t.optA, t.optB],
                label: v => v,
                hint: t => t.feedback
            },
            {
                key: 'dec-add-sub', sourceLabel: 'Decimaltal', wsModule: 'dec', wsMod: 4,
                gen: level => dec.genM4Task(level),
                correctOf: t => t.result,
                question: t => t.label,
                choices: t => [t.result, ...t.distractors],
                label: v => dec.fmtOp(v),
                hint: t => 'Nästan – ' + t.label.replace(' = ?', '') + ' = ' + dec.fmtOp(t.result) + '.'
            },
            {
                key: 'dec-enhet', sourceLabel: 'Decimaltal', wsModule: 'dec', wsMod: 5,
                gen: level => dec.genM5Task(level),
                correctOf: t => t.correctStr,
                question: t => 'Hur skrivs ' + t.fromVal + ' ' + t.fromUnit + ' i ' + t.toUnit + '?',
                choices: t => [t.correctStr, ...t.distractors],
                label: v => v,
                hint: t => 'Nästan – svaret är ' + t.correctStr + ' ' + t.toUnit + '.'
            },

            /* ── Proportionalitet ── */
            {
                key: 'prop-per-styck', sourceLabel: 'Proportionalitet', wsModule: 'prop', wsMod: 1,
                gen: level => prop.genM1Task(level),
                correctOf: t => t.correct,
                question: t => t.art + ' ' + t.item + ' kostar ' + t.each + ' kr. Vad kostar ' + t.n + ' ' + t.plural + '?',
                choices: t => [t.correct, ...t.distractors],
                label: v => v + ' kr',
                hint: t => 'Nästan – ' + t.n + ' × ' + t.each + ' = ' + t.correct + ' kr.'
            },
            {
                key: 'prop-enhetspris', sourceLabel: 'Proportionalitet', wsModule: 'prop', wsMod: 2,
                gen: level => prop.genM2Task(level),
                correctOf: t => t.correct,
                question: t => t.n + ' ' + t.plural + ' kostar ' + t.total + ' kr. Vad kostar 1 ' + t.item + '?',
                choices: t => [t.correct, ...t.distractors],
                label: v => v + ' kr',
                hint: t => 'Nästan – ' + t.total + ' ÷ ' + t.n + ' = ' + t.correct + ' kr.'
            },
            {
                key: 'prop-forhallande', sourceLabel: 'Proportionalitet', wsModule: 'prop', wsMod: 3,
                gen: level => prop.genM3Task(level),
                correctOf: t => t.correct,
                question: t => 'Samma förhållande hela tiden. ' + t.a + ' ger ' + t.b + '. Vad ger ' + t.c + '?',
                choices: t => [t.correct, ...t.distractors],
                label: v => String(v),
                hint: t => 'Nästan – ' + t.c + ' × ' + t.k + ' = ' + t.correct + '.'
            },

            /* ── Algebra ── */
            {
                key: 'alg-berakna', sourceLabel: 'Algebra', wsModule: 'alg', wsMod: 1,
                gen: level => alg.genM1Task(level),
                correctOf: t => t.correct,
                question: t => 'Sätt in x = ' + t.x + ' i uttrycket ' + t.exprStr + '. Vad blir svaret?',
                choices: t => [t.correct, ...t.distractors],
                label: v => String(v),
                hint: t => 'Nästan – sätt in x = ' + t.x + ': svaret är ' + t.correct + '.'
            },

            /* ── Statistik ── */
            {
                key: 'stat-medel', sourceLabel: 'Statistik', wsModule: 'stat', wsMod: 2,
                gen: level => stat.genM2Task(level),
                correctOf: t => t.correct,
                question: t => 'Räkna ut medelvärdet av ' + t.nums.join(', ') + '.',
                choices: t => [t.correct, ...t.distractors],
                label: v => String(v),
                hint: t => 'Nästan – ' + t.nums.join(' + ') + ' = ' + t.sum + ', delat med ' + t.n + ' = ' + t.correct + '.'
            },
            {
                key: 'stat-median', sourceLabel: 'Statistik', wsModule: 'stat', wsMod: 6,
                gen: level => stat.genM6Task(level),
                correctOf: t => t.correct,
                question: t => 'Vilket är det mittersta talet i storleksordning: ' + t.data.join(', ') + '?',
                choices: t => [t.correct, ...t.distractors],
                label: v => String(v),
                hint: t => 'Nästan – sortera först: ' + t.sorted.join(', ') + '. Talet i mitten är ' + t.correct + '.'
            },

            /* ── Problemlösning ── */
            {
                key: 'pl-los', sourceLabel: 'Problemlösning', wsModule: 'pl', wsMod: 1,
                gen: level => pl.genM1Task(level),
                correctOf: t => t.correct,
                question: t => t.story,
                choices: t => [t.correct, ...t.distractors],
                label: v => String(v),
                hint: t => 'Nästan – ' + t.formula + '.'
            }
        ];
    }

    function shuffle(arr) {
        const out = arr.slice();
        for (let i = out.length - 1; i > 0; i--) {
            const j = rnd(0, i);
            [out[i], out[j]] = [out[j], out[i]];
        }
        return out;
    }

    /* Skapar interleaving-motorn. mods = { tal, dec, stat, alg, prop, pl }. */
    function createEngine(mods) {
        const FAMILIES = buildFamilies(mods);
        const byKey = new Map(FAMILIES.map(f => [f.key, f]));

        function normalize(f, t) {
            const correct = f.correctOf(t);
            const choices = shuffle(f.choices(t));
            const labels = choices.map(v => f.label(v, t));
            return {
                key: f.key, sourceLabel: f.sourceLabel, wsModule: f.wsModule, wsMod: f.wsMod,
                question: f.question(t), correct, choices, labels, hint: f.hint(t), raw: t
            };
        }

        function genTask(level) {
            const f = FAMILIES[rnd(0, FAMILIES.length - 1)];
            return normalize(f, f.gen(level));
        }

        /* För uttömmande testning: tvinga fram en specifik familj (ingen slump på valet). */
        function genTaskFor(key, level) {
            const f = byKey.get(key);
            if (!f) throw new Error('Okänd familj: ' + key);
            return normalize(f, f.gen(level));
        }

        function workedSteps(task) {
            const m = mods[task.wsModule];
            return m.workedSteps(task.wsMod, task.raw);
        }
        function whyQuestion(task) {
            const m = mods[task.wsModule];
            return m.whyQuestion(task.wsMod, task.raw);
        }

        return {
            FAMILY_KEYS: FAMILIES.map(f => f.key),
            genTask, genTaskFor, workedSteps, whyQuestion
        };
    }

    return { sv, createEngine };
}));
