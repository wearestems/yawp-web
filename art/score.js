// fig. 1 — the score of first light, drawn from the numbers the app played: seven loops of different
// lengths, a ring on every note as it sounds, a dotted line wherever all seven meet (every 48 sixteenths).
// Silent, the band drifts on its own. "listen" plays the take and the score follows it from the empty
// sheet: each hill appears where and when the hand drew it, the waiting voices drop on bar 9.
(function () {
  var S = window.SCORE, STEP = 60 / S.bpm / 4, L = S.loops;
  var cv = document.getElementById('score'), g = cv.getContext('2d');
  var audio = document.getElementById('listen-audio'), btn = document.getElementById('listen'), clock = document.getElementById('listen-time'), word = document.getElementById('listen-word');
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, U = 40, HILL = 120, R = 1, rows = [], ink = [27, 26, 23], paper = '#e8e3da', i3 = '#9a948a';
  var playing = false, born = performance.now() - 20000;

  function rgb(hex) { var h = hex.replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function a(x) { return 'rgba(' + ink.join(',') + ',' + x + ')'; }
  function fit() {
    var cs = getComputedStyle(cv);
    ink = rgb(cs.getPropertyValue('--ink').trim() || '#1b1a17'); paper = cs.getPropertyValue('--paper').trim() || paper; i3 = cs.getPropertyValue('--ink-3').trim() || i3;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    W = cv.clientWidth; H = cv.clientHeight;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    U = Math.max(20, Math.min(46, W / 30)); R = U / 44;
    var top = H * 0.2, bot = H * 0.8, gap = (bot - top) / (L.length - 1);
    HILL = Math.min(gap * 0.78, 150);
    rows = L.map(function (lp, i) { return { lp: lp, base: top + gap * i + HILL * 0.35, h: hillOf(lp) }; });
  }
  // one pass's hill from its notes: a bump on every note, normalised so no crest is clipped
  function hillOf(lp) {
    var b = Object.keys(lp.hits).map(function (s) { return [+s, lp.hits[s]]; });
    function raw(x) { var v = 0.05; for (var i = 0; i < b.length; i++) for (var k = -1; k <= 1; k++) v += b[i][1] * Math.exp(-Math.pow((x - b[i][0] - k * lp.len) / 1.1, 2)); return v; }
    var m = 0; for (var x = 0; x < lp.len; x += 0.05) m = Math.max(m, raw(x));
    var tab = []; for (var j = 0; j < lp.len * 8; j++) tab.push(0.9 * raw(j / 8) / m);
    return function (x) { var p = ((x % lp.len) + lp.len) % lp.len * 8, i0 = Math.floor(p), f = p - i0; return tab[i0 % tab.length] * (1 - f) + tab[(i0 + 1) % tab.length] * f; };
  }
  // when the hand drew the spot under step k; whether step k sounds (in the take; drifting, everything does)
  function reveal(lp, k) { return lp.t0 + lp.dur * ((((k % lp.len) + lp.len) % lp.len) / lp.len); }
  function rests(lp, k) { return lp.id === 'kick' && k >= S.rest[0] && k < S.rest[1]; }
  function sounds(lp, k) { return !playing || (reveal(lp, k) <= k * STEP && k >= lp.live && !rests(lp, k) && k <= S.stop); }

  function frame(t) {
    var s = playing ? Math.min(S.stop, t / STEP) : t / STEP;
    var cam = s * U - W * 0.42;
    function X(k) { return k * U - cam; }
    g.fillStyle = paper; g.fillRect(0, 0, W, H);
    g.lineCap = 'round'; g.lineJoin = 'round';
    var y0 = rows[0].base - HILL - 30, y1 = rows[rows.length - 1].base + 24;
    for (var m = Math.floor((cam / U) / 48) * 48; m * U - cam < W + 20; m += 48) {
      if (m < 0 || (playing && m > S.stop)) continue;
      var x = X(m), age = t - m * STEP, hit = age >= 0 && age < 0.6 ? 1 - age / 0.6 : 0;
      g.setLineDash(hit ? [] : [2, 7]); g.lineWidth = 1 + hit * 1.6; g.strokeStyle = a(0.4 + hit * 0.6);
      g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); g.setLineDash([]);
    }
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r], lp = row.lp, base = row.base, here = Math.floor(s);
      var on = sounds(lp, here) || (playing && reveal(lp, here) <= t && here >= lp.live && !rests(lp, here));
      var al = on ? 1 : 0.28;
      var shown = function (k) { return playing ? Math.max(0, Math.min(1, (Math.min(k * STEP, t) - reveal(lp, k)) / 0.12)) : 1; };
      var x0 = playing ? Math.max(0, X(0)) : 0;
      g.beginPath();
      for (var px = x0; px <= W + 2; px += 2) { var k = (px + cam) / U, y = base - HILL * row.h(k) * shown(k); px === x0 ? g.moveTo(px, y) : g.lineTo(px, y); }
      g.lineWidth = Math.max(1, 1.8 * R); g.strokeStyle = a(al); g.stroke();
      g.lineTo(W + 2, base); g.lineTo(x0, base); g.closePath();
      var fill = g.createLinearGradient(0, base - HILL, 0, base); fill.addColorStop(0, a(0.13 * al)); fill.addColorStop(1, a(0)); g.fillStyle = fill; g.fill();
      g.lineWidth = 1; g.strokeStyle = a(0.45 * al); g.beginPath(); g.moveTo(x0, base); g.lineTo(W, base); g.stroke();
      var k0 = Math.max(0, Math.floor(cam / U) - 1), k1 = k0 + Math.ceil(W / U) + 3;
      for (var kk = k0; kk <= k1; kk++) {
        var st = kk % lp.len, xx = X(kk);
        if (st === 0) { g.lineWidth = 1; g.strokeStyle = a(0.6 * al); g.beginPath(); g.moveTo(xx, base - 14 * R); g.lineTo(xx, base); g.stroke(); }
        if (!(st in lp.hits) || shown(kk) < 1) continue;
        var ag = t - kk * STEP, live = sounds(lp, kk) && ag >= 0;
        g.beginPath(); g.arc(xx, base, 5 * R + 1, 0, 7); g.fillStyle = a(al); g.fill();
        if (live && ag < 0.5) { g.beginPath(); g.arc(xx, base, 8 * R + ag * 110 * R, 0, 7); g.lineWidth = 1.2; g.strokeStyle = a((1 - ag / 0.5) * 0.6); g.stroke(); }
      }
      var pen = X(s); g.beginPath(); g.arc(pen, base, 9 * R + 1, 0, 7); g.fillStyle = paper; g.fill(); g.lineWidth = Math.max(1.4, 2.4 * R); g.strokeStyle = a(al); g.stroke();
      var fs = Math.round(Math.max(10, 12 * R + 3)); g.font = '500 ' + fs + 'px "Geist Mono", ui-monospace, monospace';
      g.lineWidth = 5; g.strokeStyle = paper; g.strokeText(String(lp.n), 14, base - 8); g.fillStyle = i3;
      g.fillText(String(lp.n), 14, base - 8);
    }
  }

  function tick(now) {
    var t = playing ? audio.currentTime : (now - born) / 1000;
    frame(t);
    if (playing) clock.textContent = '0:' + String(Math.floor(audio.currentTime)).padStart(2, '0');
    if (!still || playing) requestAnimationFrame(tick);
  }
  function stop() { playing = false; word.textContent = '→ Listen'; btn.setAttribute('aria-pressed', 'false'); clock.textContent = '0:31'; born = performance.now() - 20000; if (still) frame(20); }
  btn.addEventListener('click', function () {
    if (playing) { audio.pause(); stop(); return; }
    audio.currentTime = 0;
    audio.play().then(function () { playing = true; word.textContent = '■ Stop'; btn.setAttribute('aria-pressed', 'true'); if (still) requestAnimationFrame(tick); }).catch(stop);
  });
  audio.addEventListener('ended', function () { setTimeout(stop, 1800); });
  // refit whenever the sheet's own size changes (iOS settles 100svh after the first layout)
  new ResizeObserver(function () { fit(); if (still) frame(20); }).observe(cv);
  fit();
  if (document.fonts) document.fonts.ready.then(function () { if (still) frame(20); });
  if (still) frame(20); else requestAnimationFrame(tick);
})();
