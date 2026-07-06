/* ═══════════════════════════════════════════════
   logic/problemlosning.js – ren logik för problemlosning.html (M1)
   Fas 6, steg 19: elevnära textproblem där METODVAL tränas (starkaste C/D-greppet).
   Talen hålls små och snälla (dyskalkyli) — svårigheten ligger i VILKET räknesätt,
   inte i att räkna. Ett module, 3 nivåer konkret → abstrakt:
     nivå 0 = ett-stegs (+, −, ×, ÷), stödbild
     nivå 1 = två-stegs (× följt av − eller +)
     nivå 2 = flerstegs + överflödig information att sålla bort
   Distraktorerna kodar namngivna missuppfattningar (distraktor-doktrinen):
   fel räknesätt, glömt steg, omvänd riktning, off-by-one, använt överflödig info.
   Inga DOM-anrop här. Ritning ligger i problemlosning.html.
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

    /* Plockar n distinkta distraktorer ur en kandidatlista. Hoppar över
       facit, dubbletter och ogiltiga värden (≤0 eller icke-heltal).
       Diagnostiska kandidater först, generiska närvärden sist som reserv. */
    function pickDistractors(correct, candidates, n) {
        n = n || 3;
        const seen = new Set([correct]);
        const out = [];
        for (const c of candidates) {
            if (c === null || c === undefined) continue;
            if (!Number.isInteger(c) || c <= 0) continue;
            if (!seen.has(c)) { seen.add(c); out.push(c); }
            if (out.length >= n) break;
        }
        return out;
    }

    /* Elevnära föremål (knyter till Avalins intressen: katter, rita, pyssla).
       emoji bärs in i bilden; `many` (plural) används i frågetexten. */
    const ITEMS = [
        { many: 'pärlor',        one: 'en pärla',        emoji: '🔴' },
        { many: 'kattbilder',    one: 'en kattbild',     emoji: '🐱' },
        { many: 'klistermärken', one: 'ett klistermärke', emoji: '⭐' },
        { many: 'kritor',        one: 'en krita',        emoji: '🖍️' }
    ];
    /* Behållare för grupperingsproblem (multiplikation/division). */
    const CONTAINERS = [
        { many: 'påsar',  short: 'påse' },
        { many: 'askar',  short: 'ask' },
        { many: 'lådor',  short: 'låda' }
    ];
    function pickItem() { return ITEMS[rnd(0, ITEMS.length - 1)]; }
    function pickContainer() { return CONTAINERS[rnd(0, CONTAINERS.length - 1)]; }
    /* Ett annat föremål än `not` (för överflödig information — måste vara en
       annan kategori så eleven ser att det inte hör till frågan). */
    function pickOther(not) {
        let o = pickItem();
        while (o === not) o = pickItem();
        return o;
    }

    /* Generisk svans: garanterar alltid ≥3 giltiga distraktorer. */
    function tail(c) { return [c + 1, c - 1, c + 2, c + 3]; }

    /* ════════ Nivå 0 – ett-stegs (+, −, ×, ÷) ════════ */

    function addTask() {
        const item = pickItem();
        const a = rnd(2, 9), b = rnd(2, 9);
        const correct = a + b;
        const cand = [
            a * b,            // fel räknesätt: multiplicerade
            Math.abs(a - b),  // fel räknesätt: subtraherade
            a, b,             // delberäkning: bara ena talet
            ...tail(correct)
        ];
        return finish({
            mod: 1, op: 'add', a, b, item, emoji: item.emoji, itemMany: item.many, correct,
            story: 'Avalin har ' + a + ' ' + item.many + '. Hon får ' + b + ' till. Hur många ' + item.many + ' har hon nu?',
            formula: a + ' + ' + b + ' = ' + correct,
            we: [
                'Avalin har ' + a + ' ' + item.many + '.',
                'Hon får ' + b + ' till — det blir fler.',
                a + ' + ' + b + ' = ' + correct + ' ' + item.many + '.'
            ]
        }, cand);
    }

    function subTask() {
        const item = pickItem();
        const a = rnd(4, 9), b = rnd(2, a - 1);
        const correct = a - b;                 // a > b, så correct ≥ 1
        const cand = [
            a + b,            // fel räknesätt: adderade
            a * b,            // fel räknesätt: multiplicerade
            b,                // omvänd riktning: svarade det bortgivna
            ...tail(correct)
        ];
        return finish({
            mod: 1, op: 'sub', a, b, item, emoji: item.emoji, itemMany: item.many, correct,
            story: 'Avalin har ' + a + ' ' + item.many + '. Hon ger bort ' + b + '. Hur många ' + item.many + ' har hon kvar?',
            formula: a + ' − ' + b + ' = ' + correct,
            we: [
                'Avalin har ' + a + ' ' + item.many + '.',
                'Hon ger bort ' + b + ' — det blir färre.',
                a + ' − ' + b + ' = ' + correct + ' ' + item.many + '.'
            ]
        }, cand);
    }

    function mulTask() {
        const item = pickItem(), cont = pickContainer();
        const g = rnd(2, 4), e = rnd(2, 5);
        const correct = g * e;
        const cand = [
            g + e,            // fel räknesätt: adderade
            e,                // glömde gångra (bara en grupp)
            (g + 1) * e,      // off-by-one på antalet grupper
            (g - 1) * e,      // off-by-one åt andra hållet
            ...tail(correct)
        ];
        return finish({
            mod: 1, op: 'mul', g, e, item, cont, emoji: item.emoji, itemMany: item.many, correct,
            story: 'Avalin har ' + g + ' ' + cont.many + '. I varje ' + cont.short + ' finns ' + e + ' ' + item.many + '. Hur många ' + item.many + ' har hon?',
            formula: g + ' × ' + e + ' = ' + correct,
            we: [
                'Det finns ' + g + ' ' + cont.many + '.',
                'I varje ' + cont.short + ' finns ' + e + ' ' + item.many + '.',
                g + ' × ' + e + ' = ' + correct + ' ' + item.many + '.'
            ]
        }, cand);
    }

    function divTask() {
        const item = pickItem(), cont = pickContainer();
        const g = rnd(2, 3), q = rnd(2, 5);
        const t = g * q;                       // total väljs delbar
        const correct = q;
        const cand = [
            t,                // glömde dela (svarade totalen)
            g,                // omvänd riktning: svarade antalet grupper
            t - g,            // fel räknesätt: subtraherade
            q + 1, q - 1,     // off-by-one
            ...tail(correct)
        ];
        return finish({
            mod: 1, op: 'div', t, g, q, item, cont, emoji: item.emoji, itemMany: item.many, correct,
            story: 'Avalin har ' + t + ' ' + item.many + '. Hon lägger lika många i ' + g + ' ' + cont.many + '. Hur många ' + item.many + ' i varje ' + cont.short + '?',
            formula: t + ' ÷ ' + g + ' = ' + correct,
            we: [
                t + ' ' + item.many + ' delas lika i ' + g + ' ' + cont.many + '.',
                'Räkna ' + t + ' ÷ ' + g + '.',
                'Det blir ' + correct + ' ' + item.many + ' i varje ' + cont.short + '.'
            ]
        }, cand);
    }

    /* ════════ Nivå 1 – två-stegs (× följt av − eller +) ════════ */

    function mulSubTask() {
        const item = pickItem(), cont = pickContainer();
        const g = rnd(2, 4), e = rnd(2, 5);
        const p = g * e;
        const r = rnd(1, p - 1);               // p > r, så correct ≥ 1
        const correct = p - r;
        const cand = [
            p,                // glömt sista steget: stannade halvvägs
            p + r,            // omvänd riktning: adderade i stället för att dra bort
            (g + e) - r,      // fel räknesätt i steg 1: adderade grupperna
            g + e,            // fel räknesätt, glömt steg 2
            ...tail(correct)
        ];
        return finish({
            mod: 1, op: 'mul_sub', g, e, r, p, item, cont, emoji: item.emoji, itemMany: item.many, correct,
            story: 'Avalin köper ' + g + ' ' + cont.many + ' med ' + e + ' ' + item.many + ' i varje. Hon tappar ' + r + ' ' + item.many + '. Hur många ' + item.many + ' har hon kvar?',
            formula: '(' + g + ' × ' + e + ') − ' + r + ' = ' + correct,
            we: [
                g + ' ' + cont.many + ' med ' + e + ' i varje: ' + g + ' × ' + e + ' = ' + p + '.',
                'Hon tappar ' + r + ' — dra bort dem.',
                p + ' − ' + r + ' = ' + correct + ' ' + item.many + '.'
            ]
        }, cand);
    }

    function mulAddTask() {
        const item = pickItem(), cont = pickContainer();
        const g = rnd(2, 4), e = rnd(2, 5);
        const p = g * e;
        const r = rnd(2, 9);
        const correct = p + r;
        const cand = [
            p,                // glömt sista steget: stannade halvvägs
            p - r,            // omvänd riktning: drog bort i stället för att lägga till
            (g + e) + r,      // fel räknesätt i steg 1: adderade grupperna
            g + e,            // fel räknesätt, glömt steg 2
            ...tail(correct)
        ];
        return finish({
            mod: 1, op: 'mul_add', g, e, r, p, item, cont, emoji: item.emoji, itemMany: item.many, correct,
            story: 'Avalin har ' + g + ' ' + cont.many + ' med ' + e + ' ' + item.many + ' i varje. Hon hittar ' + r + ' ' + item.many + ' till. Hur många ' + item.many + ' har hon?',
            formula: '(' + g + ' × ' + e + ') + ' + r + ' = ' + correct,
            we: [
                g + ' ' + cont.many + ' med ' + e + ' i varje: ' + g + ' × ' + e + ' = ' + p + '.',
                'Hon hittar ' + r + ' till — lägg till dem.',
                p + ' + ' + r + ' = ' + correct + ' ' + item.many + '.'
            ]
        }, cand);
    }

    /* ════════ Nivå 2 – flerstegs + överflödig information ════════
       Ett tal (h st av ett ANNAT föremål) hör inte till frågan och ska sållas bort. */
    function herringTask() {
        const item = pickItem(), cont = pickContainer(), other = pickOther(item);
        const s = rnd(2, 9), g = rnd(2, 3), e = rnd(2, 5);
        const p = g * e;
        const h = rnd(2, 9);
        const correct = s + p;
        const cand = [
            s + p + h,        // använde den överflödiga informationen (h)
            p,                // glömde lägga till s (stannade)
            s + g + e,        // fel räknesätt: adderade alla tal
            s + h,            // blandade in fel föremål, glömde grupperna
            ...tail(correct)
        ];
        return finish({
            mod: 1, op: 'herring', s, g, e, p, h, item, cont, other,
            emoji: item.emoji, itemMany: item.many, herringEmoji: other.emoji, herringMany: other.many, correct,
            story: 'Avalin har ' + s + ' ' + item.many + '. Hon köper ' + g + ' ' + cont.many + ' med ' + e + ' ' + item.many + ' i varje. Hon har också ' + h + ' ' + other.many + '. Hur många ' + item.many + ' har hon?',
            formula: s + ' + (' + g + ' × ' + e + ') = ' + correct,
            we: [
                'Frågan gäller ' + item.many + ' — ' + other.many + ' räknas inte.',
                g + ' ' + cont.many + ' med ' + e + ' i varje: ' + g + ' × ' + e + ' = ' + p + '.',
                s + ' + ' + p + ' = ' + correct + ' ' + item.many + '.'
            ]
        }, cand);
    }

    /* Fyller på distraktorer och returnerar det färdiga uppgiftsobjektet. */
    function finish(task, cand) {
        task.distractors = pickDistractors(task.correct, cand, 3);
        return task;
    }

    /* ════════ Modul 1 – Lös problemet ════════
       En generator, tre nivåer. Räknesättet varieras inom nivån så att
       eleven måste VÄLJA metod (metodval). */
    const NIVA0 = [addTask, subTask, mulTask, divTask];
    const NIVA1 = [mulSubTask, mulAddTask];
    function genM1Task(level) {
        if (level === 0) return NIVA0[rnd(0, NIVA0.length - 1)]();
        if (level === 1) return NIVA1[rnd(0, NIVA1.length - 1)]();
        return herringTask();
    }

    /* ════════ Mönster v2, lager 11a + 11c ════════
       workedSteps: de tre stegraderna byggdes redan i generatorn (t.we).
       whyQuestion: fast resonemang om metodval (visas bara på nivå 2). */
    function workedSteps(mod, t) { return t.we ? t.we.slice() : []; }

    function whyQuestion(mod) {
        return {
            prompt: 'Varför stämmer det?',
            correct: 'Man använder bara talen som handlar om det frågan gäller.',
            distractors: [
                'Man räknar alltid ihop alla tal som står i uppgiften.', // adderar allt / använder överflödig info
                'Det sista talet i uppgiften är svaret.'                 // ytlig lässtrategi
            ]
        };
    }

    return {
        pickDistractors, ITEMS, CONTAINERS,
        addTask, subTask, mulTask, divTask, mulSubTask, mulAddTask, herringTask,
        genM1Task, workedSteps, whyQuestion
    };
}));
