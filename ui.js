/* ═══════════════════════════════════════════════
   ui.js – Avalins Matematikverkstad
   Delade UI-hjälpare för alla modulsidor
   (Miso-maskoten + streak-text)
═══════════════════════════════════════════════ */

/* Visar Miso i en given pose med pratbubbla som döljs efter 3 s.
   pose: 'neutral' | 'glad' | 'uppmuntrande'
   Kräver element med id 'miso-img' och 'miso-bubble'. */
var misoTimer = null;
function showMiso(pose, text) {
    var poses = { neutral: 'miso-neutral', glad: 'miso-glad', uppmuntrande: 'miso-uppmuntrande' };
    document.getElementById('miso-img').src = 'images/miso/' + (poses[pose] || 'miso-neutral') + '.webp';
    var bubble = document.getElementById('miso-bubble');
    bubble.textContent = text;
    bubble.style.display = 'block';
    if (misoTimer) clearTimeout(misoTimer);
    misoTimer = setTimeout(function () { bubble.style.display = 'none'; }, 3000);
}

/* Skriver "katt X i rad" med hårda mellanslag ( ) i elementet med givet id.
   Tomt under 2 i rad. */
function setStreak(id, n) {
    document.getElementById(id).textContent = n >= 2 ? '🐱 ' + n + ' i rad' : '';
}
