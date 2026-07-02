/* ═══════════════════════════════════════════════
   logic/proportionalitet.js – ren logik för proportionalitet.html (M1–M3)
   Fas 5, steg 15: proportionella samband (y = k·x), elevnära.
   Generaliserar skala (steg 14) och procent (brak M10): samma förhållande hela tiden.
   Inga DOM-anrop här. Nivå skickas in som parameter (level: 0,1,2).
   Ritning (SVG/emoji) och händelsehantering ligger i proportionalitet.html.
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
       facit, dubbletter och ogiltiga värden (≤0 eller icke-heltal). */
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

    /* Elevnära föremål (knyter till Avalins intressen). Emoji bärs in i HTML;
       namnet används i frågetexten. art = obestämd artikel, plural = pluralform
       så att frågetexten blir grammatiskt korrekt (viktigt för Avalin). */
    const ITEMS = [
        { name: 'fisk',         art: 'En',  plural: 'fiskar',        emoji: '🐟' },
        { name: 'klistermärke', art: 'Ett', plural: 'klistermärken', emoji: '⭐' },
        { name: 'pärla',        art: 'En',  plural: 'pärlor',        emoji: '🔴' },
        { name: 'äpple',        art: 'Ett', plural: 'äpplen',        emoji: '🍎' }
    ];
    function pickItem() { return ITEMS[rnd(0, ITEMS.length - 1)]; }

    /* ════════ Modul 1 – Lika mycket per styck (hitta totalen) ════════
       1 vara kostar `each` kr. `n` varor kostar n × each kr.
       Konkret: föremålen ritas i rad. Hittar totalen. */
    function genM1Task(level) {
        let n, each;
        if (level === 0)      { n = rnd(2, 4); each = rnd(2, 3); }
        else if (level === 1) { n = rnd(2, 6); each = rnd(2, 5); }
        else                  { n = rnd(3, 8); each = rnd(2, 9); }
        const item = pickItem();
        const correct = n * each;
        const cand = [
            n + each,         // fel räknesätt: addition
            each,             // glömde gångra (priset för en)
            (n + 1) * each,   // off-by-one på antalet
            (n - 1) * each,   // off-by-one åt andra hållet
            correct + 1, correct - 1, correct + each, correct + n
        ];
        return { mod: 1, n, each, item: item.name, art: item.art, plural: item.plural,
                 emoji: item.emoji, unit: 'kr', correct,
                 distractors: pickDistractors(correct, cand, 3) };
    }

    /* ════════ Modul 2 – Hur mycket kostar ett? (hitta enhetspriset) ════════
       `n` varor kostar `total` kr. 1 vara kostar total ÷ n kr.
       Tal väljs så att enhetspriset alltid blir helt (total = n × each). */
    function genM2Task(level) {
        let n, each;
        if (level === 0)      { n = rnd(2, 4); each = rnd(2, 4); }
        else if (level === 1) { n = rnd(2, 6); each = rnd(2, 6); }
        else                  { n = rnd(3, 8); each = rnd(2, 9); }
        const item = pickItem();
        const total = n * each;
        const correct = each;
        const cand = [
            total * n,        // omvänd riktning: multiplicerade
            total - n,        // fel räknesätt: subtraktion
            total,            // glömde dela (svarade totalen)
            correct + 1, correct - 1, correct + 2, n
        ];
        return { mod: 2, n, total, item: item.name, art: item.art, plural: item.plural,
                 emoji: item.emoji, unit: 'kr', correct,
                 distractors: pickDistractors(correct, cand, 3) };
    }

    /* ════════ Modul 3 – Samma förhållande (värdetabell, abstraktion) ════════
       a ger b (b = a × k). Samma förhållande: c ger c × k.
       Konstanten k syns. Knyter till bråk/decimal/procent i resonemanget. */
    function genM3Task(level) {
        let kset, arange, crange;
        if (level === 0)      { kset = [2, 3];          arange = [1, 3]; crange = [2, 4]; }
        else if (level === 1) { kset = [2, 3, 4, 5];    arange = [2, 4]; crange = [2, 6]; }
        else                  { kset = [2, 3, 4, 5, 10]; arange = [2, 5]; crange = [3, 9]; }
        const k = kset[rnd(0, kset.length - 1)];
        const a = rnd(arange[0], arange[1]);
        let c = rnd(crange[0], crange[1]);
        if (c === a) c = a + 1;               // c ≠ a, annars trivialt
        const b = a * k;
        const correct = c * k;
        const cand = [
            c + (b - a),      // additiv missuppfattning: la till differensen
            (k + 1) * c,      // fel förhållande (för stort)
            (k - 1) * c,      // fel förhållande (för litet)
            c,                // glömde förhållandet helt
            k,                // delberäkning: stannade vid k
            correct + 1, correct - 1, correct + c
        ];
        return { mod: 3, a, b, c, k, correct,
                 distractors: pickDistractors(correct, cand, 3) };
    }

    /* ════════ Modul 4 – Läs av grafen (proportionell graf y = k·x) ════════
       En rät linje genom origo, lutning k (1 styck = k kr).
       Vid x = a på linjen är y = a × k. Tränar grafen som representation
       av samma per-styck-samband som M1. Tal hålls snälla (k, a små). */
    function genM4Task(level) {
        let kset, arange;
        if (level === 0)      { kset = [2, 3];       arange = [2, 4]; }
        else if (level === 1) { kset = [2, 3, 4];    arange = [2, 5]; }
        else                  { kset = [2, 3, 4, 5]; arange = [2, 6]; }
        const k = kset[rnd(0, kset.length - 1)];
        const a = rnd(arange[0], arange[1]);
        const item = pickItem();
        const correct = a * k;
        const cand = [
            a + k,            // fel räknesätt: adderade lutning och antal
            a,                // läste bara av x (glömde lutningen)
            k,                // läste bara lutningen (glömde antalet)
            (a + 1) * k,      // off-by-one: läste av en ruta för långt
            (a - 1) * k,      // off-by-one åt andra hållet
            correct + 1, correct - 1, correct + k
        ];
        return { mod: 4, a, k, item: item.name, art: item.art, plural: item.plural,
                 emoji: item.emoji, unit: 'kr', correct,
                 distractors: pickDistractors(correct, cand, 3) };
    }

    /* ════════ Mönster v2, lager 11a + 11c ════════
       workedSteps(mod, task): 3 stegrader (löst exempel).
       whyQuestion(mod): "Varför stämmer det?" + 1 korrekt + 2 distraktorer. */
    function workedSteps(mod, t) {
        switch (mod) {
            case 1:
                return [
                    'Priset är ' + t.each + ' kr per styck.',
                    'Räkna ' + t.n + ' × ' + t.each + '.',
                    t.n + ' stycken kostar ' + t.correct + ' kr.'
                ];
            case 2:
                return [
                    t.n + ' stycken kostar ' + t.total + ' kr.',
                    'Räkna ' + t.total + ' ÷ ' + t.n + '.',
                    '1 styck kostar ' + t.correct + ' kr.'
                ];
            case 3:
                return [
                    t.a + ' ger ' + t.b + ' — det är gånger ' + t.k + '.',
                    'Samma förhållande: räkna ' + t.c + ' × ' + t.k + '.',
                    t.c + ' ger ' + t.correct + '.'
                ];
            case 4:
                return [
                    '1 ' + t.item + ' kostar ' + t.k + ' kr — linjen går genom origo.',
                    'Gå till ' + t.a + ' på x-axeln, följ upp till linjen: ' + t.a + ' × ' + t.k + '.',
                    t.a + ' ' + t.plural + ' kostar ' + t.correct + ' ' + t.unit + '.'
                ];
            default:
                return [];
        }
    }

    const WHY = {
        1: {
            correct: 'Fler varor kostar mer — man multiplicerar antalet med priset för en.',
            distractors: [
                'Man adderar antalet och priset för en.',          // fel räknesätt
                'Priset är lika oavsett hur många man köper.'       // ignorerar antalet
            ]
        },
        2: {
            correct: 'Priset för en hittar man genom att dela totalen med antalet.',
            distractors: [
                'Priset för en hittar man genom att gångra totalen med antalet.', // omvänd riktning
                'Priset för en är lika med hela totalen.'                          // ignorerar antalet
            ]
        },
        3: {
            correct: 'Samma förhållande gäller hela tiden — det kan skrivas som bråk, decimal eller procent.',
            distractors: [
                'Man lägger till samma tal i båda kolumnerna.',     // additiv missuppfattning
                'Förhållandet ändras när talen blir större.'        // fel: k är konstant
            ]
        },
        4: {
            correct: 'En proportionell graf är en rak linje genom origo, så priset är antalet gånger priset för ett.',
            distractors: [
                'Man lägger ihop antalet och priset för ett.',      // fel räknesätt
                'Grafen visar samma pris hur många man än köper.'   // ignorerar lutningen
            ]
        }
    };

    function whyQuestion(mod) {
        const w = WHY[mod];
        return { prompt: 'Varför stämmer det?', correct: w.correct, distractors: w.distractors.slice() };
    }

    return {
        pickDistractors, ITEMS,
        genM1Task, genM2Task, genM3Task, genM4Task,
        workedSteps, whyQuestion
    };
}));
