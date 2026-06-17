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

    return { clockHandAngles };
}));
