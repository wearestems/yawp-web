// Plates 01–07: the app's seven scenes as they move, each played by first light, on a sheet of its own —
// day and night in turn. A 12 s loop plays while its sheet is in view; a tall cut on a phone. The film (08) too.
(function () {
  var P = [
    ['land', 'day'],
    ['figure', 'night'],
    ['mycelium', 'day'],
    ['pond', 'night'],
    ['passage', 'day'],
    ['room', 'night'],
    ['cell', 'day'],
  ];
  var root = document.getElementById('plates'), tall = matchMedia('(max-width: 640px)').matches, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  P.forEach(function (p, i) {
    var s = document.createElement('figure');
    s.className = 'plate plate-' + p[1];
    var f = 'art/' + p[0] + '-' + p[1] + (tall ? '-tall' : '');
    s.innerHTML = '<div class="plate-frame"><video class="plate-v" src="' + f + '.mp4" poster="' + f + '.jpg" muted loop playsinline preload="none" aria-hidden="true"></video></div>' +
      '<figcaption class="cap label"><span class="dim">0' + (i + 1) + '</span> ' + p[0] + (still ? ' <button class="label cap-sound" type="button">→ Play</button>' : '') +
      '</figcaption>';
    root.appendChild(s);
  });
  // a plate moves only while it is in view (never faded in from nothing: iOS refuses to play a video it
  // counts as invisible). When the browser refuses to start a
  // muted video on its own (iOS in Low Power Mode), the first tap anywhere starts the ones in view.
  var seen = [], refused = false;
  function go(v) { v.muted = true; var p = v.play(); if (p) p.catch(function () { refused = true; }); }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) {
    var v = e.target.querySelector('.plate-v'), i = seen.indexOf(v);
    if (e.isIntersecting) { e.target.classList.add('in'); if (v && !still) { if (i < 0) seen.push(v); go(v); } }
    else if (v) { v.pause(); if (i >= 0) seen.splice(i, 1); }
  }); }, { threshold: 0.25 });
  // with Reduce Motion on, a scene holds still until it is asked to move
  if (still) document.querySelectorAll('.plate .cap-sound').forEach(function (b) {
    b.addEventListener('click', function () { var v = b.closest('.plate').querySelector('.plate-v');
      if (v.paused) { go(v); b.textContent = '■ Stop'; } else { v.pause(); b.textContent = '→ Play'; } });
  });
  ['pointerdown', 'touchend', 'keydown'].forEach(function (t) {
    addEventListener(t, function () { if (refused) { refused = false; seen.forEach(go); } }, { passive: true });
  });
  document.querySelectorAll('.plate').forEach(function (el) { io.observe(el); });
  var film = document.getElementById('film');
  new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) film.play().catch(function () {}); else film.pause(); }); }, { threshold: 0.4 }).observe(film);
  var snd = document.getElementById('film-sound');
  function sound() { film.muted = !film.muted; if (!film.muted) { film.currentTime = 0; film.play(); } snd.textContent = film.muted ? '→ Sound' : '■ Mute'; snd.setAttribute('aria-pressed', String(!film.muted)); }
  film.addEventListener('click', sound); snd.addEventListener('click', sound);
})();
