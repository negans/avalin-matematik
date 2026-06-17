/* ═══════════════════════════════════════════════
   logic/shared.js – Avalins Matematikverkstad
   Delade rena hjälpfunktioner.
   Fungerar både i webbläsaren (globala) och i Node (module.exports),
   så att samma kod kan köras av sidorna och av tests/test.js.
═══════════════════════════════════════════════ */
(function (root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else Object.assign(root, api);
}(typeof window !== 'undefined' ? window : globalThis, function () {

    /* Slumpat heltal i [a, b] inklusive båda ändpunkterna. */
    function rnd(a, b) {
        return Math.floor(Math.random() * (b - a + 1)) + a;
    }

    /* Största gemensamma delare (för bråkförenkling). */
    function gcd(a, b) {
        a = Math.abs(a); b = Math.abs(b);
        while (b) { [a, b] = [b, a % b]; }
        return a || 1;
    }

    return { rnd, gcd };
}));
