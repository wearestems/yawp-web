// The landing page's moving parts: the long hill under the hero, the
// hints and packs printed from the app's own words, and the film's sound.
(function () {
  // The app's hints sheet, word for word (src/ui/hints.ts).
  var HINTS = [
    ['draw on a loop', 'the hill sows the notes — redraw any time'],
    ['tap a step', 'pin it · again to silence it · again to let it go'],
    ['drag the end tick', 'the loop’s length — unequal lengths make the drift'],
    ['tap a name', 'mute · hold it — solo'],
    ['tap the small print', 'snap the sowing to 16th → 8th → 4th'],
    ['two fingers', 'scroll the rows · spread them — zoom'],
    ['the die', 'a new piece each throw — your mutes stay put'],
    ['· A by the title', 'the key — drag the tuner, the whole song follows'],
    ['M', 'the mixer: faders, and the glyphs mute (hold: solo)'],
    ['the chop lane', 'tap to record two seconds of you · ≋ edit cuts it'],
    ['◎', 'watch the song as moving line art — V, ← →'],
    ['⋮ top right', 'the drawer: ● rec 20s · voices · store · sets · night · scenes'],
  ];
  // The store sheet's packs and lines (src/engine/store.ts).
  var PACKS = [
    ['wood', 'a felt tom and a dry rim'],
    ['air', 'a pad that breathes and a mallet bell'],
    ['song', 'an arp that climbs and a voice that hums'],
    ['glass', 'a piano that stacks and a pluck that scatters light'],
    ['fog', 'an organ that answers in octaves and a melting wash'],
    ['windows', 'two scenes: the vessel and the sea'],
    ['yawp complete', 'everything, and every pack to come'],
  ];

  function rows(id, list) {
    var dl = document.getElementById(id);
    if (!dl) return;
    list.forEach(function (r) {
      var dt = document.createElement('dt');
      var dd = document.createElement('dd');
      dt.textContent = r[0];
      dd.textContent = r[1];
      dl.append(dt, dd);
    });
  }

  // One long field line: gaussian hills at seeded heights, a baseline,
  // and the sown dots where a hill clears the bar, as in the app.
  function hill() {
    var svg = document.getElementById('hill');
    if (!svg) return;
    var w = svg.clientWidth || window.innerWidth;
    var h = svg.clientHeight || 120;
    var base = h - 18;
    var peaks = [[0.08, 0.35, 0.05], [0.24, 0.8, 0.06], [0.41, 0.5, 0.045], [0.58, 0.95, 0.07], [0.77, 0.45, 0.05], [0.92, 0.7, 0.055]];
    function y(x) {
      var t = x / w, v = 0;
      peaks.forEach(function (p) { v = Math.max(v, p[1] * Math.exp(-Math.pow((t - p[0]) / p[2], 2))); });
      return v;
    }
    var d = '', step = Math.max(2, w / 400);
    for (var x = 0; x <= w; x += step) d += (x ? 'L' : 'M') + x.toFixed(1) + ' ' + (base - y(x) * (base - 8)).toFixed(1);
    var dots = '', pitch = Math.max(14, w / 64);
    for (var i = 0; i * pitch < w; i++) {
      var cx = i * pitch + pitch / 2;
      if (y(cx) > 0.3) dots += '<circle cx="' + cx.toFixed(1) + '" cy="' + base + '" r="2.6"/>';
    }
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.innerHTML = '<path class="hill-fill" d="' + d + 'L' + w + ' ' + base + 'L0 ' + base + 'Z"/>' +
      '<path class="hill-line" d="' + d + '"/><line class="hill-base" x1="0" x2="' + w + '" y1="' + base + '" y2="' + base + '"/>' + dots;
  }

  function sound() {
    var btn = document.getElementById('snd');
    var film = document.getElementById('film');
    if (!btn || !film) return;
    btn.addEventListener('click', function () {
      film.muted = !film.muted;
      if (!film.muted) film.play();
      btn.setAttribute('aria-pressed', String(!film.muted));
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    rows('hints', HINTS);
    rows('packs', PACKS);
    hill();
    sound();
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(hill, 120); });
  });
})();
