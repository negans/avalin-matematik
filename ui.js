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
/* ═══════════════════════════════════════════════
   Uppläsning (Web Speech API) – Mönster v2, lager 11b
   speak(text): läser en kort instruktion på svenska, lugn takt (0.9).
   Finns ingen svensk röst döljs allt uppläsnings-UI tyst via initSpeak().
   Kan inte testas i Node — verifieras ockulärt i webbläsaren.
═══════════════════════════════════════════════ */

/* Returnerar en svensk röst om någon finns, annars null. */
function svVoice() {
    if (!('speechSynthesis' in window)) return null;
    var voices = window.speechSynthesis.getVoices() || [];
    for (var i = 0; i < voices.length; i++) {
        if ((voices[i].lang || '').toLowerCase().indexOf('sv') === 0) return voices[i];
    }
    return null;
}

/* Läser upp en kort text. Avbryter pågående uppläsning först. Tyst no-op
   om Web Speech saknas eller något kastar. */
function speak(text) {
    if (!('speechSynthesis' in window) || !text) return;
    try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'sv-SE';
        u.rate = 0.9;
        var v = svVoice();
        if (v) u.voice = v;
        window.speechSynthesis.speak(u);
    } catch (e) { /* ignorera tyst */ }
}

/* Visar/döljer allt uppläsnings-UI (.speak-btn, .speak-toggle) beroende på om
   en svensk röst finns. Saknas röst: dölj tyst (ingen krasch, ingen felruta). */
function applySpeakVisibility() {
    var has = !!svVoice();
    var els = document.querySelectorAll('.speak-btn, .speak-toggle');
    for (var i = 0; i < els.length; i++) {
        els[i].style.display = has ? '' : 'none';
    }
    return has;
}

/* Kopplar in uppläsnings-UI. Röstlistan laddas ibland asynkront, så vi lyssnar
   på voiceschanged en gång och uppdaterar synligheten när den kommer. */
function initSpeak() {
    applySpeakVisibility();
    if ('speechSynthesis' in window &&
        typeof window.speechSynthesis.addEventListener === 'function') {
        window.speechSynthesis.addEventListener('voiceschanged', applySpeakVisibility);
    }
}

function setStreak(id, n) {
    document.getElementById(id).textContent = n >= 2 ? '🐱 ' + n + ' i rad' : '';
}
