(function () {
    var KEY = 'avalin_v1';

    function defaults() {
        return { score: 0, stars: 0, dayStreak: 0, lastDate: '', settings: {} };
    }

    function load() {
        try {
            var raw = localStorage.getItem(KEY);
            return raw ? Object.assign(defaults(), JSON.parse(raw)) : defaults();
        } catch (e) { return defaults(); }
    }

    function save(s) {
        try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    }

    function todayStr() {
        var d = new Date();
        return d.getFullYear() + '-' +
               ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
               ('0' + d.getDate()).slice(-2);
    }

    function refreshDay(s) {
        var t = todayStr();
        if (s.lastDate === t) return;
        var prev = new Date();
        prev.setDate(prev.getDate() - 1);
        var y = prev.getFullYear() + '-' +
                ('0' + (prev.getMonth() + 1)).slice(-2) + '-' +
                ('0' + prev.getDate()).slice(-2);
        s.dayStreak = (s.lastDate === y) ? s.dayStreak + 1 : 1;
        s.lastDate  = t;
    }

    function render(s) {
        var bar = document.getElementById('av-stats-bar');
        if (!bar) return;
        bar.querySelector('.av-score').textContent  = '✓ ' + s.score;
        bar.querySelector('.av-stars').textContent  = s.stars >= 1 ? '⭐ ' + s.stars : '';
        bar.querySelector('.av-streak').textContent = s.dayStreak >= 2 ? '🔥 ' + s.dayStreak + ' dagar' : '';
    }

    window.recordCorrect = function () {
        var s = load();
        s.score++;
        var prevStars = s.stars;
        s.stars = Math.floor(s.score / 10);
        save(s);
        render(s);
        if (s.stars > prevStars) {
            var msg = '⭐ ' + s.stars + ' stjärn' + (s.stars === 1 ? 'a' : 'or') + '!';
            if (typeof window.showMiso === 'function') {
                window.showMiso('glad', msg);
            } else if (typeof window.setMiso === 'function') {
                window.setMiso('miso-glad.webp', msg);
            }
        }
    };

    /* Läser en sparad inställning (t.ex. 'autoRead'); dflt om den saknas. */
    window.getSetting = function (key, dflt) {
        var s = load();
        return (s.settings && Object.prototype.hasOwnProperty.call(s.settings, key))
            ? s.settings[key] : dflt;
    };

    /* Sparar en inställning persistent. */
    window.setSetting = function (key, val) {
        var s = load();
        s.settings = s.settings || {};
        s.settings[key] = val;
        save(s);
    };

    window.initStatsBar = function () {
        var s = load();
        refreshDay(s);
        save(s);
        var nav = document.querySelector('.top-nav');
        if (nav) {
            var bar = document.createElement('div');
            bar.id = 'av-stats-bar';
            bar.innerHTML =
                '<span class="av-score"></span>' +
                '<span class="av-stars"></span>' +
                '<span class="av-streak"></span>';
            nav.insertAdjacentElement('afterend', bar);
        }
        render(s);
    };
}());
