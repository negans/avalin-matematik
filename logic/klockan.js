/* ═══════════════════════════════════════════════
   logic/klockan.js – ren logik för klockan.html
   Klockans övriga logik (validering av inmatning) är DOM-bunden och
   ligger kvar i klockan.html. Här finns bara den rena vinkelmatematiken.
   UMD: global i webbläsaren, module.exports i Node (för tester).
═══════════════════════════════════════════════ */
(function (root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else Object.assign(root, api);
}(typeof window !== 'undefined' ? window : globalThis, function () {

    /* Vinkel (grader, medurs från 12) för tim- och minutvisare vid tiden h:m.
       Timvisaren rör sig kontinuerligt med minuterna. */
    function clockHandAngles(h, m) {
        return {
            hrDeg:  ((h % 12) + m / 60) / 12 * 360,
            minDeg: m / 60 * 360
        };
    }

    function pad(n) { return String(n).padStart(2, '0'); }

    /* ════════ Mönster v2, lager 11a – löst exempel (steg för steg) ════════
       Tre rader för tiden h:m, ETT steg per rad. Konkret → symbolisk:
       HTML visar klockan (bilden), dessa rader bär läsningen. */

    /* Minutsteget. m = 0 hanteras särskilt (visaren pekar rakt upp på 12). */
    function minuteStep(m) {
        if (m === 0) return 'Den långa visaren pekar rakt upp på 12. Det betyder 0 minuter.';
        return 'Den långa visaren pekar på ' + (m / 5) + '. ' + (m / 5) + ' × 5 = ' + m + ' minuter.';
    }

    function workedSteps(h, m) {
        return [
            'Den korta visaren har precis passerat ' + h + '. Timmen är ' + h + '.',
            minuteStep(m),
            'Klockan är ' + h + ':' + pad(m) + '.'
        ];
    }

    /* ════════ Mönster v2, lager 11c – resonemang ("Varför stämmer det?") ════════
       En korrekt resonemangsrad + 2 distraktorer enligt distraktor-doktrinen:
       omvänd riktning (visarna förväxlade) och delberäkning (minut = siffran rakt av). */
    function whyQuestion(h, m) {
        return {
            prompt: 'Varför stämmer det?',
            correct: 'Den korta visaren visar timmen, den långa visar minuterna (siffran × 5).',
            distractors: [
                'Den långa visaren visar timmen, den korta visar minuterna.',   // visarna förväxlade
                'Minuterna är samma som siffran den långa visaren pekar på.'     // delberäkning (glömd ×5)
            ]
        };
    }

    return { clockHandAngles, pad, minuteStep, workedSteps, whyQuestion };
}));
