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

/* ═══════════════════════════════════════════════
   Mönster v2 – delade hjälpare för alla modulsidor
   (löst exempel, lager 11a · resonemang "Varför?", lager 11c)
   Den visuella renderingen (rutnät/klocka/uttryck) ligger kvar per sida;
   här bor det som är identiskt mellan sidor: steg-listan, panel-växlingen
   och hela "Varför?"-panelen. Webbläsar-API → verifieras ockulärt, ej i Node.
═══════════════════════════════════════════════ */

/* Fyller en <ol> med en rad per steg (löst exempel, 11a). */
function renderExampleSteps(stepsId, steps) {
    var ol = document.getElementById(stepsId);
    ol.innerHTML = '';
    steps.forEach(function (s) {
        var li = document.createElement('li');
        li.textContent = s;
        ol.appendChild(li);
    });
}

/* Visar/döljer exempel-panelen och döljer/visar motsvarande live-yta.
   show=true → exempel syns, live göms (ett steg i taget). */
function toggleExample(panelId, liveId, show) {
    document.getElementById(panelId).hidden = !show;
    document.getElementById(liveId).hidden = show;
}

/* Renderar hela "Varför?"-panelen (11c). Identisk feedback + blandning + klick
   för alla sidor; bara element-id:n och Miso-anropen skiljer.
   ids:   { panel, q, choices, fb }  (element-id:n)
   hooks: { onCorrect, onWrong }     (valfria – t.ex. Miso) */
function renderWhyPanel(q, ids, hooks) {
    hooks = hooks || {};
    var qEl       = document.getElementById(ids.q);
    var choicesEl = document.getElementById(ids.choices);
    var fbEl      = document.getElementById(ids.fb);

    qEl.textContent  = q.prompt;
    fbEl.textContent = '';
    choicesEl.innerHTML = '';

    var choices = [q.correct].concat(q.distractors);
    for (var i = choices.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = choices[i]; choices[i] = choices[j]; choices[j] = tmp;
    }

    var answered = false;
    choices.forEach(function (val) {
        var btn = document.createElement('button');
        btn.className = 'choice-btn-text';
        btn.textContent = val;
        btn.addEventListener('click', function () {
            if (answered) return;
            answered = true;
            var kids = Array.prototype.slice.call(choicesEl.children);
            if (val === q.correct) {
                btn.classList.add('ok');
                fbEl.textContent = 'Ja, precis! 🎉 Bra tänkt.';
                if (hooks.onCorrect) hooks.onCorrect();
            } else {
                btn.classList.add('err');
                kids.forEach(function (b) { if (b.textContent === q.correct) b.classList.add('ok'); });
                fbEl.textContent = 'Inte riktigt – det gröna är rätt tanke. Och det är helt okej!';
                if (hooks.onWrong) hooks.onWrong();
            }
            kids.forEach(function (b) { b.disabled = true; });
        });
        choicesEl.appendChild(btn);
    });

    document.getElementById(ids.panel).hidden = false;
}

function hideWhyPanel(panelId) { document.getElementById(panelId).hidden = true; }

/* Skriver "katt X i rad" med hårda mellanslag ( ) i elementet med givet id.
   Tomt under 2 i rad. */
function setStreak(id, n) {
    document.getElementById(id).textContent = n >= 2 ? '🐱 ' + n + ' i rad' : '';
}
